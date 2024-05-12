document.addEventListener("DOMContentLoaded", () => onInit());

const AvailableRoutes = [
    {
        route: 'home',
        component: 'app-home',
    },
    {
        route: 'game',
        component: 'app-game',
    },
    {
        route: '**',
        component: 'app-not-found',
    }
];

function onInit() {
    // Components
    ComponentWorker.register('app-home', '/app/HomePage', 'home-page.component');
    ComponentWorker.register('app-game', '/app/GamePage', 'game-page.component');
    ComponentWorker.register('app-not-found', '/app/NotFoundPage', 'not-found-page.component');

    // Router
    window.AvailableRoutes = AvailableRoutes;
    Router.loadComponent('home');
}
