angular.module('myAppRouter', ['ui.router'])
    .config(function($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('/login');
        $stateProvider
            .state('login', {
                url: '/login',
                templateUrl: 'public/app/modules/login/login.html',
                authenticated: false,
            })   
            .state('register', {
                url: '/register',
                templateUrl: 'public/app/modules/register/register.html',
                authenticated: false,
            }) 
            .state('home', {
                url: '/home',
                templateUrl: 'public/app/modules/home/home.html',
                authenticated: true,
            })   
    });

