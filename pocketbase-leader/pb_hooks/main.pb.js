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
    throw new BadRequestError("A directory cannot have the same name as another directory");

  e.next();
}, "directories");
