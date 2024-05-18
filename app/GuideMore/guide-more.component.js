await HttpClient.getJson('database/classes.json').then((data) => {
    if (
        data && 
        data[window.routerParams.id || 0] && 
        data[window.routerParams.id || 0].guides[window.routerParams.guideId || 0]
    ) {
        const guide = data[window.routerParams.id].guides[window.routerParams.guideId];
        console.log(guide);
    }

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
