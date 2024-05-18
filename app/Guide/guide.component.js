const data = await HttpClient.getJson('database/classes.json');

if (data) {
    ComponentWorker.ngFor(document, "classes", data);
    ComponentWorker.ngFor(document, "guides", data.guides);
}
