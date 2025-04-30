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

onRecordAfterUpdateSuccess((e) => {
  console.log("after successful file updated");

  // hardcoded for dev (to avoid race conditions / async issues)
  const id = "800w51c58qad2t7";
  // const id = e.record.id

  const initRecord = $app.findRecordById("files", id); // just use e.record

  const fullPath = initRecord.baseFilesPath() + "/" + initRecord.get("file");

  let fsys, file, content;
  try {
    // initialize the filesystem
    fsys = $app.newFilesystem();

    // retrieve a file reader for the avatar key
    file = fsys.getFile(fullPath);

    content = file.read();
    $filesystem.fileFromBytes(content, "randomName");

    console.log(3, file);
  } catch (error) {
    console.log(4, error);
  }

  /*
   *
   * use the above to get file
   *
   */

  // if (!file) return e.next();

  console.log(/*LL*/ 134);

  const collection = $app.findCollectionByNameOrId("filesVersionHistory");
  console.log(/*LL*/ 137);

  const record = new Record(collection);
  console.log(/*LL*/ 140);

  record.set("fileRelationId", id);
  // record.set("file", initRecord.get("file"));
  record.set("isStarred", e.record.get("isStarred"));
  record.set("name", e.record.get("name"));
  record.set("directoryRelationId", e.record.get("directoryRelationId"));
  record.set("size", e.record.get("size"));
  console.log(/*LL*/ 148);

  $app.save(record);
  console.log(/*LL*/ 151);

  e.next();
}, "files");
