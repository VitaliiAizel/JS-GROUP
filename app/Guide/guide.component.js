await HttpClient.getJson('database/classes.json').then((data) => {
    ComponentWorker.ngFor(
        document,
        "classes",
        data,
        [{ name: "guides", field: "guides", child: [] }]
    );
});
