document.addEventListener("DOMContentLoaded", onInit);

const components = [
    { name: 'app-home', path: '/app/Home', component: 'home.component' },
    { name: 'app-guide', path: '/app/Guide', component: 'guide.component' },
    { name: 'app-guide-more', path: '/app/GuideMore', component: 'guide-more.component' },
    { name: 'app-game', path: '/app/Game', component: 'game.component' },
    { name: 'app-faq', path: '/app/Faq', component: 'faq.component' }
];

const availableRoutes = [
    { route: 'home', component: 'app-home' },
    { route: 'guide', component: 'app-guide' },
    { route: 'guide/more', component: 'app-guide-more' },
    { route: 'game', component: 'app-game' },
    { route: 'faq', component: 'app-faq' }
];

function onInit() {
    // Components
    components.forEach(({ name, path, component }) => {
        ComponentCreator.register(name, path, component);
    });

    // Router
    window.availableRoutes = availableRoutes;
    Router.loadComponent('home');
}
