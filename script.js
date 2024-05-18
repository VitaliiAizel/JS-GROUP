document.addEventListener("DOMContentLoaded", () => onInit());

const AvailableRoutes = [
    {
        route: 'home',
        component: 'app-home',
    },
    {
        route: 'guide',
        component: 'app-guide',
    },
    {
        route: 'guide/more',
        component: 'app-guide-more',
    },
    {
        route: 'game',
        component: 'app-game',
    },
    {
        route: 'faq',
        component: 'app-faq',
    }
];

function onInit() {
    // Components
    ComponentWorker.register('app-home', '/app/Home', 'home.component');
    ComponentWorker.register('app-guide', '/app/Guide', 'guide.component');
    ComponentWorker.register('app-guide-more', '/app/GuideMore', 'guide-more.component');
    ComponentWorker.register('app-game', '/app/Game', 'game.component');
    ComponentWorker.register('app-faq', '/app/Faq', 'faq.component');

    // Router
    window.AvailableRoutes = AvailableRoutes;
    Router.loadComponent('home');
}
