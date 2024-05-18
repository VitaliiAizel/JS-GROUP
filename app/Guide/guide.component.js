const data = await HttpClient.getJson('database/classes.json');

if (data) {
    ComponentWorker.ngFor("classes", data);
    ComponentWorker.ngFor("guides", data.guides);
}
