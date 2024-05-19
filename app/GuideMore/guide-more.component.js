await HttpClient.getJson('database/classes.json').then((data) => {
    const _class = data.find((c) => c.id == window.routerParams.id);

    const guide = _class.guides.find((c) => c.id == window.routerParams.guideId);
    const strengths = guide.strengths.split('\n');
    const weaknesses = guide.weaknesses.split('\n');

    ComponentWorker.interpolate(
        document,
        ["title", "img", "description"],
        [guide.title, guide.img, guide.description],
    );

    ComponentWorker.ngFor(
        document,
        "strengths",
        strengths
    );

    ComponentWorker.ngFor(
        document,
        "weaknesses",
        weaknesses
    );
});
