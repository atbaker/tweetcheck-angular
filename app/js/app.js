// App module
angular.module('tweetCheck', [
  'ui.router',
  'angularMoment',
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

    .state('dashboard.history', {
      url: '/history',
      abstract: true,
      template: '<ui-view/>',
      controller: 'HistoryCtrl'
    })

    .state('dashboard.history.tweets', {
      url: '/tweets',
      templateUrl: '/views/history.html',
      controller: 'TweetHistoryCtrl'
    })

    .state('dashboard.compose', {
      url: '/compose',
      abstract: true,
      template: '<ui-view/>',
      controller: 'ComposeCtrl'
    })

    .state('dashboard.compose.new', {
      url: '/new',
      templateUrl: '/views/compose.html',
    })

    .state('dashboard.compose.edit', {
      url: '/:id/edit',
      templateUrl: '/views/compose.html',
      controller: 'EditCtrl'
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

.config(function($httpProvider) {
  $httpProvider.interceptors.push('authInterceptor');
});
