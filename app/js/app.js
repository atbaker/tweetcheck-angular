// App module
angular.module('tweetCheck', [
  'ui.router',
  'tweetCheckControllers',
  'tweetCheckFilters',
  'tweetCheckServices'
])

.config(function($stateProvider, $urlRouterProvider) {
  $stateProvider
    .state('review', {
      url: '/review',
      templateUrl: '/views/tweet-list.html',
      controller: 'TweetListCtrl'
    })

    .state('compose', {
      url: '/compose',
      templateUrl: '/views/compose.html',
      controller: 'ComposeCtrl'
    })

    .state('authorize', {
      url: '/authorize',
      templateUrl: '/views/authorize.html',
      controller: 'AuthorizeCtrl'
    });

  $urlRouterProvider.otherwise('/review');
})

.config(function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
});
