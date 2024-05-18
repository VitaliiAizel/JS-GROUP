const data = await HttpClient.getJson('database/classes.json')
.then(() => {
    if (data) {
        ComponentWorker.ngFor("classes", data);
        ComponentWorker.ngFor("guides", data.guides);
    }
});
