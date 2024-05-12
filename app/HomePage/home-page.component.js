const main = document.getElementById('main');
if (main) {
    main.addEventListener('click', () => {
        alert('Click on: ', this);
    });
}
