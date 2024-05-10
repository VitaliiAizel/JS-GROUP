document.addEventListener("DOMContentLoaded", () => onInit());

const AvailableRoutes = [
    {
        route: 'home',
        componentName: 'home-page',
        componentPath: 'app/HomePage'
    },
    {
        route: 'game',
        componentName: 'game-page',
        componentPath: 'app/GamePage'
    },
    {
        route: '**',
        componentName: 'not-found-page',
        componentPath: 'app/NotFoundPage'
    }
];

function onInit() {
    window.AvailableRoutes = AvailableRoutes;
    Router.loadComponent('home');
}
