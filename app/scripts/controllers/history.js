'use strict';

angular.module('tweetCheck')

.controller('TweetHistoryCtrl', function($scope, tweets) {
  $scope.tweets = tweets;
})

.controller('ActionHistoryCtrl', function($scope, activity) {
  $scope.activity = activity;
})