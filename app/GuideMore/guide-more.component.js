await HttpClient.getJson('database/classes.json').then((data) => {
    if (data) {
        console.log(data);
        const _class = data.find((c) => c.id == window.routerParams.id);
        if (_class) {
            const guide = _class.guides.find((c) => c.id == window.routerParams.guideId);

            console.log(guide);
        }
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
