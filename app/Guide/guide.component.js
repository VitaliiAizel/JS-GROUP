await HttpClient.getJson('database/classes.json').then((data) => {
    ComponentWorker.ngFor(
        document,
        "classes",
        data,
        [{ name: "guides", field: "guides", child: [] }]
    );
});

const search = document.getElementById('search');
if (search) {
    search.addEventListener('keyup', (e) => {
        const value = e.target.value.toLowerCase();
        document.querySelectorAll('[groupName]').forEach((el) => {
            if (el.getAttribute('groupName').toLowerCase().includes(value) || value == '') {
                el.style.display = 'block';
            }
            else {
                el.style.display = 'flex';
            }
        });
    });
}
