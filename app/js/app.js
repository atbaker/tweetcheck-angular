// App module
angular.module('tweetCheck', [
  'angularMoment',
  'ngFx',
  'tweetCheck.states',
  'tweetCheck.controllers',
  'tweetCheck.directives',
  'tweetCheck.filters',
  'tweetCheck.services'
])

.run(function ($rootScope, $state, $stateParams, $anchorScroll, AuthService) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  $rootScope.$on('$stateChangeStart', function(event, toState, toParams, fromState, fromParams) {
    if (toState.name.indexOf('dashboard') !== -1) {
      if ($rootScope.user !== undefined && !$rootScope.user.is_active) {
        event.preventDefault();
        $state.go('activate');
      } else if ($rootScope.handleObject !== undefined && Object.keys($rootScope.handleObject).length < 3) {
        event.preventDefault();
        $state.go('connect');
      }
    } else if (toState.name === 'activate' && toParams.token !== undefined) {
      event.preventDefault();
      AuthService.loginSuccess({token: toParams.token});
    }
  });

  $rootScope.$on('$stateChangeSuccess', function(event, to, toParams, from, fromParams) {
    $rootScope.$previousState = from;
  });

  $anchorScroll.yOffset = 20;

  // Load in our auth token (if available)
  var token = AuthService.loadToken();
  if (typeof token !== 'undefined') {
    AuthService.prepareScope(token);
  }

  // Update moment.js configuration
  moment.locale('en', {
      calendar : {
          lastDay : '[yesterday at] LT',
          sameDay : '[today at] LT',
          nextDay : '[tomorrow at] LT',
          lastWeek : '[last] dddd [at] LT',
          nextWeek : 'dddd [at] LT',
          sameElse : 'L'
      }
  });
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

      if (config.url.indexOf('api/') !== -1 || config.url.indexOf('auth/invite') !== -1) {
        config.headers['Authorization'] = 'Token ' + $window.sessionStorage['token'];
      }

      return config;
    },

    responseError: function(rejection) {
      var AuthService;
      if (!AuthService) {
        AuthService = $injector.get('AuthService');
      }

      if (rejection.status === 401) {
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
