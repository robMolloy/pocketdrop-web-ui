onTerminate((e) => {
  console.log("[custom hook] PocketBase is shutting down");

  e.next();
});

onRecordCreate((e) => {
  const recordsCount = $app.countRecords("users");
  if (recordsCount === 0) e.record.set("status", "admin");

  e.next();
}, "users");

onRecordCreateRequest((e) => {
  const directoryRelationId = e.record.get("directoryRelationId");
  const name = e.record.get("name");

  const count = $app.countRecords("directories", $dbx.hashExp({ directoryRelationId, name }));

  if (count > 0)
    throw new BadRequestError(
      "Two directories within the same parent directory cannot share identical names.",
    );

  e.next();
}, "directories");

onRecordUpdateRequest((e) => {
  const directoryRelationId = e.record.get("directoryRelationId");
  const name = e.record.get("name");
  const id = e.record.get("id");
  const count = $app.countRecords(
    "directories",
    $dbx.hashExp({ directoryRelationId, name }),
    $dbx.not($dbx.hashExp({ id: id })),
  );

  if (count > 0)
    throw new BadRequestError(
      "Two directories within the same parent directory cannot share identical names.",
    );

  e.next();
}, "directories");

onRecordCreateRequest(async (e) => {
  const directoryRelationId = e.record.get("directoryRelationId");
  const name = e.record.get("name");
  const file = e.record.get("file");
  e.record.set("size", file.size);

  const count = $app.countRecords("files", $dbx.hashExp({ directoryRelationId, name }));

  if (count > 0)
    throw new BadRequestError(
      "Two files within the same parent directory cannot share identical names.",
    );

  e.next();
}, "files");
onRecordUpdateRequest((e) => {
  const directoryRelationId = e.record.get("directoryRelationId");
  const name = e.record.get("name");
  const id = e.record.get("id");
  const file = e.record.get("file");
  if (file.size > 0) e.record.set("size", file.size);

  const count = $app.countRecords(
    "files",
    $dbx.hashExp({ directoryRelationId, name }),
    $dbx.not($dbx.hashExp({ id: id })),
  );

  if (count > 0)
    throw new BadRequestError(
      "Two files within the same parent directory cannot share identical names.",
    );

  e.next();
}, "files");

onRecordAfterCreateSuccess((e) => {
  const id = e.record.get("id");

  let collection = $app.findCollectionByNameOrId("filesVersionHistory");
  let record = new Record(collection);

  record.set("fileRelationId", id);
  record.set("isStarred", e.record.get("isStarred"));
  record.set("name", e.record.get("name"));
  record.set("directoryRelationId", e.record.get("directoryRelationId"));
  record.set("size", e.record.get("size"));

  $app.save(record);

  e.next();
}, "files");

console.log("after successful file updated");
onRecordAfterUpdateSuccess((e) => {
  console.log(/*LL*/ 101);

  const id = e.record.id;

  const fullPath =
    $app.dataDir() + "/storage/" + e.record.baseFilesPath() + "/" + e.record.get("file");

  const getFileFromPath = (path) => {
    let fsys, file;
    try {
      fsys = $app.newFilesystem();
      file = $filesystem.fileFromPath(path);
    } catch (error) {
      console.log(/*LL*/ 151, error);
    }
    fsys?.close();
    return file;
  };

  const file = getFileFromPath(fullPath);

  if (!file) return e.next();

  const collection = $app.findCollectionByNameOrId("filesVersionHistory");
  const record = new Record(collection);

  record.set("file", file);

  record.set("fileRelationId", id);
  record.set("directoryRelationId", e.record.get("directoryRelationId"));
  record.set("isStarred", e.record.get("isStarred"));
  record.set("name", e.record.get("name"));
  record.set("size", e.record.get("size"));

  $app.save(record);

  e.next();
}, "files");
