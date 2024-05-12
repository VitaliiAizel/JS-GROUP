function setScope(scope) {
    document = scope;
}

const main = document.getElementById('main');
if (main) {
    main.addEventListener('click', () => {
        alert('Clicked!');
        console.log(main);
    });
}
