// App module
angular.module('tweetCheck', [
  'ui.router',
  'tweetCheck.controllers',
  'tweetCheck.filters',
  'tweetCheck.services'
])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: '/views/login.html',
      controller: 'LoginCtrl'
    })

    // setup an abstract state for the tabs directive
    .state('dashboard', {
      url: "/dashboard",
      abstract: true,
      templateUrl: "/views/dashboard.html",
      controller: 'DashboardCtrl'
    })

    .state('dashboard.review', {
      url: '/review',
      templateUrl: '/views/tweet-list.html',
      controller: 'TweetListCtrl'
    })

    .state('dashboard.compose', {
      url: '/compose',
      templateUrl: '/views/compose.html',
      controller: 'ComposeCtrl'
    })

    .state('dashboard.authorize', {
      url: '/authorize',
      templateUrl: '/views/authorize.html',
      controller: 'AuthorizeCtrl'
    });

  $urlRouterProvider.otherwise('/dashboard/review');
})

.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
})

.factory('authInterceptor', function($window, $injector, $q) {

  return {
    request: function(config) {
      var AuthService;
      if (!AuthService) {
        AuthService = $injector.get('AuthService');
      }

      if (config.url.indexOf('api/') !== -1 && AuthService.loadToken()) {
        config.headers['Authorization'] = 'Token ' + $window.sessionStorage['token'];
      }

      return config;
    },

    responseError: function(rejection) {
      var AuthService;
      if (!AuthService) {
        AuthService = $injector.get('AuthService');
      }

      if (rejection.status === 403 || rejection.status === 0) {
        // Our request 403'd - user needs to login again
        AuthService.logout();
      }
      return $q.reject(rejection);
    }
  };
})

.config(['$httpProvider', function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
}]);
