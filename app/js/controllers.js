/* Controllers */

angular.module('tweetCheck.controllers', [])

.controller('LoginCtrl', function($scope, AuthService) {
  $scope.login = function(user) {
    AuthService.login(user.email, user.password);
  };
})

.controller('DashboardCtrl', function($scope, AuthService, Tweet) {
  $scope.logout = AuthService.logout;

  $scope.approveTweet = function(tweet) {
    tweet.status = 1;
    Tweet.update(tweet);
  };

  $scope.rejectTweet = function(tweet) {
    tweet.status = -1;
    Tweet.update(tweet);
  };
})

.controller('AuthorizeCtrl', function($scope, $http) {
  $scope.getRequestToken = function() {
    $http.get('/auth/request').success(function(data, status, headers, config) {
      window.location.href = data.authorizationUrl;
    });
  };
})

.controller('TweetListCtrl', function($scope, tweets, handles, activity) {
  $scope.tweets = tweets;
  $scope.handles = handles;
  $scope.activity = activity;
})

.controller('TweetHistoryCtrl', function($scope, tweets) {
  $scope.tweets = tweets;
})

.controller('ActionHistoryCtrl', function($scope, activity) {
  $scope.activity = activity;
})

.controller('DetailCtrl', function($scope, $stateParams, tweet, activity) {
  $scope.tweet = tweet;
  $scope.activity = activity;
})

.controller('ComposeCtrl', function($scope, $state, handles, Tweet) {
  $scope.newTweet = $state.current.data.newTweet;
  $scope.handles = handles;

  $scope.save = function(tweet) {
    var saveSuccess = function() {
      $state.go('dashboard.review');
    };

    if (tweet.id !== undefined) {
      Tweet.update(tweet, saveSuccess);
    } else {
      Tweet.save(tweet, saveSuccess);
    }
  };

  $scope.publish = function(tweet) {
    tweet.status = 1;
    $scope.save(tweet);
  };
})

.controller('EditCtrl', function($scope, tweet) {
  $scope.tweet = tweet;
});
