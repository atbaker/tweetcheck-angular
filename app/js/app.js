'use strict';

// App module
var tweetCheck = angular.module('tweetCheck', [
  'ngRoute',
  'tweetCheckControllers',
  'tweetCheckFilters',
  'tweetCheckServices'
]);

tweetCheck.config(['$routeProvider', function($routeProvider) {
  $routeProvider.
    when('/', {
      templateUrl: '/views/tweet-list.html',
      controller: 'TweetListCtrl'
    }).
    when('/compose', {
      templateUrl: '/views/compose.html',
      controller: 'ComposeCtrl'
    }).
    when('/authorize', {
      templateUrl: '/views/authorize.html',
      controller: 'AuthorizeCtrl'
    }).
    otherwise({redirectTo: '/'});
}]);

tweetCheck.config(['$httpProvider', function($httpProvider) {
  $httpProvider.defaults.xsrfCookieName = 'csrftoken';
  $httpProvider.defaults.xsrfHeaderName = 'X-CSRFToken';
}]);

tweetCheck.config(['$resourceProvider', function($resourceProvider) {
  $resourceProvider.defaults.stripTrailingSlashes = false;
}]);
