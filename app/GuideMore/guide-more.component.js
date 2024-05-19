await HttpClient.getJson('database/classes.json').then((data) => {
    const _class = data.find((c) => c.id == window.routerParams.id);
    const guide = _class.guides.find((c) => c.id == window.routerParams.guideId);

    ComponentWorker.interpolate(
        document,
        ["id", "guideId"],
        [guide.title, guide.id],
    );
});
