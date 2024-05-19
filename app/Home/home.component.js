await HttpClient.getJson('database/news.json').then((data) => {
    ComponentWorker.ngFor(
        document,
        "news",
        data,
    );
});
