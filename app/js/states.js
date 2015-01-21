// ui-router states module

angular.module('tweetCheck.states', ['ui.router'])

.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $stateProvider
    .state('register', {
      url: "/register",
      templateUrl: '/views/register.html',
      controller: 'RegisterCtrl',
      data: {
        pageTitle: 'Register'
      }
    })

    .state('activate', {
      url: "/activate?token",
      templateUrl: '/views/activate.html',
      data: {
        pageTitle: 'Activate your account'
      }
    })

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

    .state('connect', {
      url: '/connect',
      templateUrl: '/views/connect.html',
      controller: 'ConnectCtrl',
      data: {
        pageTitle: 'Connect account'
      }
    })

    .state('dashboard', {
      url: "/dashboard",
      abstract: true,
      templateUrl: "/views/dashboard.html",
      controller: 'DashboardCtrl',
      data: {
        showSidebar: true
      }
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

    .state('dashboard.users', {
      url: '/users',
      templateUrl: '/views/users.html',
      controller: 'UsersCtrl',
      data: {
        pageTitle: 'Users'
      },
      resolve: {
        users: function(User) {
          return User.query().$promise;
        }
      }
    })

    .state('dashboard.settings', {
      url: '/settings',
      templateUrl: '/views/settings.html',
      controller: 'SettingsCtrl',
      data: {
        pageTitle: 'Settings'
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
      url: '/compose/:id',
      templateUrl: '/views/compose.html',
      controller: 'ComposeCtrl',
      data: {
        pageTitle: 'Compose new tweet'
      },
      resolve: {
        handles: function(Handle) {
          return Handle.query().$promise;
        },
        tweet: function($stateParams, Tweet) {
          if ($stateParams.id !== '') {
            this.data.pageTitle = 'Edit tweet';
            return Tweet.get({id: $stateParams.id}).$promise;
          } else {
            this.data.pageTitle = 'Compose new tweet';
            return new Tweet();
          }
        },
      }
    });

  $urlRouterProvider.otherwise('/dashboard/review');
  $locationProvider.html5Mode(true);
});
