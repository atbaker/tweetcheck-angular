'use strict';

angular.module('tweetCheck')

.controller('DetailCtrl', function($scope, tweet, activity, Tweet) {
  $scope.tweet = tweet;
  $scope.activity = activity;
  $scope.processing = false;

  $scope.updateTweet = function(tweet) {
    $scope.processing = true;
    Tweet.update(tweet, function(value) {
      $scope.tweet = value;
      $scope.processing = false;
    });
  };

  $scope.approveTweet = function(tweet) {
    var tweetUpdate = angular.copy(tweet);
    if (tweetUpdate.eta !== null) {
      tweetUpdate.status = 3;
    } else {
      tweetUpdate.status = 1;
    }
    $scope.updateTweet(tweetUpdate);
  };

  $scope.rejectTweet = function(tweet) {
    var tweetUpdate = angular.copy(tweet);
    tweetUpdate.status = -1;
    $scope.updateTweet(tweetUpdate);
  };
});
