await HttpClient.getJson('database/classes.json').then((data) => {
    ComponentWorker.interpolate(
        document,
        "id",
        window.routerParams.id,
    );

    ComponentWorker.interpolate(
        document,
        "guideId",
        window.routerParams.guideId,
    );
});
