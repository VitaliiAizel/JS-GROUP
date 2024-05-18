await HttpClient.getJson('database/classes.json').then((data) => {
    if (data) {
        const guides = data.find((c) => c.id === window.routerParams.id).guide;
        const guide = guides.find((c) => c.id === window.routerParams.guideId);
        
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
