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

.controller('TweetListCtrl', function($scope, Tweet, Handle, Action) {
  $scope.handles = {};
  $scope.tweets = Tweet.query(function() {
    // Populate the handles object with details about each handle in these tweets
    for (var i=0; i<$scope.tweets.results.length; i++) {
      var handleId = $scope.tweets.results[i].handle;
      if (!$scope.handles.hasOwnProperty(handleId)) {
        $scope.handles[handleId] = Handle.get({id: handleId});
      }
    }
  });

  $scope.activity = Action.query();
})

.controller('HistoryCtrl', function($scope) {

})

.controller('TweetHistoryCtrl', function($scope, Tweet) {
  $scope.response = Tweet.queryApproved();
})

.controller('ActionHistoryCtrl', function($scope, Action) {
  $scope.response = Action.query();
})

.controller('DetailCtrl', function($scope, $stateParams, tweet, activity) {
  $scope.tweet = tweet;
  $scope.activity = activity;
})

.controller('ComposeCtrl', function($scope, $state, handles, Tweet) {
  // $scope.newTweet = $state.current.data.newTweet;
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
