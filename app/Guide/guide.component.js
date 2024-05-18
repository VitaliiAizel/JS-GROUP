const data = await HttpClient.getJson('database/classes.json');

if (data) {
    ComponentWorker.ngFor(document, "classes", data, [{ name: "guides", field: "guides" }]);
}
