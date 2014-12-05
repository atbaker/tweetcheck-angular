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
        pageTitle: 'login'
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
        pageTitle: 'dashboard'
      },
      resolve: {
        tweets: function(Tweet) {
          return Tweet.query();
        },
        handles: function(Handle) {
          return Handle.queryObject();
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
        pageTitle: 'tweet history'
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
        pageTitle: 'action history'
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
        pageTitle: 'view tweet'
      },
      resolve: {
        tweet: function($state, $stateParams, Tweet, $q) {
          var deferred = $q.deferred();
          var tweet = Tweet.get({id: $stateParams.id});

          // If this tweet is in 'pending' status, throw an error
          // so we can redirect to the edit view instead
          if (tweet.results[0].status === 0) {
            deferred.reject('This tweet is still being edited');
            return deferred.promise;
          } else {
            return tweet;
          }
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
        pageTitle: 'new tweet',
        newTweet: true
      }
    })

    .state('dashboard.compose.edit', {
      url: '/:id/edit',
      templateUrl: '/views/compose.html',
      controller: 'EditCtrl',
      data: {
        pageTitle: 'edit tweet',
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
        pageTitle: 'authorize'
      }
    });

  $urlRouterProvider.otherwise('/dashboard/review');
})

.run(function ($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;

  // Catch and redirect when we try to view tweets that should be edited
  $rootScope.$on('$stateChangeError',
    function (event, toState, toParams, fromState, fromParams, error) {
    if (toState.name === 'dashboard.detail' && toParams.id) {
      event.preventDefault();
      $state.go('dashboard.compose.edit', toParams);
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
