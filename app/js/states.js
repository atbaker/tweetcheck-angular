// ui-router states module

angular.module('tweetCheck.states', ['ui.router'])

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $stateProvider
    .state('login', {
      url: "/login",
      templateUrl: '/views/login.html',
      controller: 'LoginCtrl',
      data: {
        pageTitle: 'Login'
      }
    })

    .state('logout', {
      url: "/logout",
      controller: 'LogoutCtrl'
    })

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
      params: {
        scrollTweet: null
      },
      resolve: {
        tweets: function($stateParams, Tweet) {
          return Tweet.query({status: 0}).$promise;
        },
        activity: function(Action) {
          return Action.query();
        }
      }
    })

    .state('dashboard.schedule', {
      url: '/schedule',
      templateUrl: '/views/tweet-list.html',
      controller: 'TweetListCtrl',
      data: {
        pageTitle: 'Scheduled tweets'
      },
      params: {
        scrollTweet: null
      },
      resolve: {
        tweets: function($stateParams, Tweet) {
          return Tweet.query({status: 3}).$promise;
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
          return Tweet.queryApproved().$promise;
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
          return Action.query().$promise;
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
          return Tweet.get({id: $stateParams.id}).$promise;
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
          return Handle.query().$promise;
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
          return Tweet.get({id: $stateParams.id}).$promise;
        },
        activity: function($stateParams, Action) {
          return Action.query({tweet_id: $stateParams.id}).$promise;
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
  $locationProvider.html5Mode(true);
});
