angular.module('tweetCheck')

.controller('TweetListCtrl', function($scope, tweets, activity, $stateParams, $location, $anchorScroll, Tweet, Realtime) {
  $scope.tweets = tweets;
  $scope.activity = activity;

  $scope.processingTracker = {};

  if ($stateParams.scrollTweet !== null) {
    $location.hash('tweet-' + $stateParams.scrollTweet);
    $anchorScroll();
  }

  var updateScope = function(updatedTweet) {
    for (var i=0; i<$scope.tweets.length; i++) {
      if (updatedTweet.id === $scope.tweets[i].id) {
        angular.extend($scope.tweets[i], updatedTweet);
        $scope.processingTracker[updatedTweet.id] = false;
      }
    }
  };

  $scope.updateTweet = function(tweet) {
    $scope.processingTracker[tweet.id] = true;
    Tweet.update(tweet, updateScope);
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

  var refreshTweets = function() {
    Tweet.query({status: 0}, function(value) {
      $scope.tweets = value;
    });
  };

  var retrieveUpdatedTweet = function(id) {
    Tweet.get({id: id}, updateScope);
  };

  Realtime.setCallbacks(refreshTweets, retrieveUpdatedTweet);
});
