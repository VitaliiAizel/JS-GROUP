function setScope(scope) {
    document = scope;
    console.log(scope);
    console.log(document);
}

const main = document.getElementById('main');
if (main) {
    main.addEventListener('click', () => {
        alert('Clicked!');
        console.log(main);

        console.log('2334');
    });
}
