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
      controller: 'LoginCtrl',
      data: {
        pageTitle: 'Login'
      }
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
      controller: 'TweetListCtrl',
      data: {
        pageTitle: 'Review tweets'
      },
      resolve: {
        tweets: function(Tweet) {
          return Tweet.query();
        },
        activity: function(Action) {
          return Action.query();
        }
      }
    })

    .state('dashboard.history', {
      url: '/history',
      abstract: true,
      template: '<ui-view/>',
    })

    .state('dashboard.history.tweets', {
      url: '/tweets',
      templateUrl: '/views/tweet-history.html',
      controller: 'TweetHistoryCtrl',
      data: {
        pageTitle: 'Tweet history'
      },
      resolve: {
        tweets: function(Tweet) {
          return Tweet.queryApproved();
        }
      }
    })

    .state('dashboard.history.actions', {
      url: '/actions',
      templateUrl: '/views/action-history.html',
      controller: 'ActionHistoryCtrl',
      data: {
        pageTitle: 'Activity log'
      },
      resolve: {
        activity: function(Action) {
          return Action.query();
        }
      }
    })

    .state('dashboard.detail', {
      url: '/:id',
      templateUrl: '/views/detail.html',
      controller: 'DetailCtrl',
      data: {
        pageTitle: 'View tweet'
      },
      resolve: {
        tweet: function($stateParams, Tweet) {
          return Tweet.get({id: $stateParams.id});
        },
        activity: function($stateParams, Action) {
          return Action.query({tweet_id: $stateParams.id});
        }
      }
    })

    .state('dashboard.compose', {
      url: '/compose',
      abstract: true,
      template: '<ui-view/>',
      controller: 'ComposeCtrl',
      resolve: {
        handles: function(Handle) {
          return Handle.query();
        }
      }
    })

    .state('dashboard.compose.new', {
      url: '/new',
      templateUrl: '/views/compose.html',
      data: {
        pageTitle: 'Compose new tweet',
        newTweet: true
      }
    })

    .state('dashboard.compose.edit', {
      url: '/:id/edit',
      templateUrl: '/views/compose.html',
      controller: 'EditCtrl',
      data: {
        pageTitle: 'Edit tweet',
        newTweet: false
      },
      resolve: {
        tweet: function($stateParams, Tweet) {
          return Tweet.get({id: $stateParams.id});
        },
        activity: function($stateParams, Action) {
          return Action.query({tweet_id: $stateParams.id});
        }
      }
    })

    .state('dashboard.authorize', {
      url: '/authorize',
      templateUrl: '/views/authorize.html',
      controller: 'AuthorizeCtrl',
      data: {
        pageTitle: 'Authorize'
      }
    });

  $urlRouterProvider.otherwise('/dashboard/review');
})

.run(function ($rootScope, $state, $stateParams, Handle) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  // The handle metadata probably won't change during a given session
  // save us some time by pre-loading it at run
  $rootScope.handleObject = Handle.queryObject();
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
