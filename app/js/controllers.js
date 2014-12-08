/* Controllers */

angular.module('tweetCheck.controllers', [])

.controller('LoginCtrl', function($scope, AuthService) {
  $scope.login = function(user) {
    AuthService.login(user.email, user.password, function() {
      $scope.loginForm.$setPristine();
    }, function(error) {
      $scope.loginError = error;
    });
  };
})

.controller('LogoutCtrl', function(AuthService) {
  AuthService.logout();
})

.controller('DashboardCtrl', function($scope, Tweet) {
})

.controller('AuthorizeCtrl', function($scope, $http) {
  $scope.getRequestToken = function() {
    $http.get('/auth/request').success(function(data, status, headers, config) {
      window.location.href = data.authorizationUrl;
    });
  };
})

.controller('TweetListCtrl', function($scope, tweets, activity, Tweet) {
  $scope.tweets = tweets;
  $scope.activity = activity;

  $scope.updateTweet = function(tweet) {
    Tweet.update(tweet, function(value) {
      for (var i=0; i<$scope.tweets.results.length; i++) {
        if (value.id === $scope.tweets.results[i].id) {
          angular.extend($scope.tweets.results[i], value);
        }
      }
    });
  };

  $scope.approveTweet = function(tweet) {
    tweet.status = 1;
    $scope.updateTweet(tweet);
  };

  $scope.rejectTweet = function(tweet) {
    tweet.status = -1;
    $scope.updateTweet(tweet);
  };
})

.controller('TweetHistoryCtrl', function($scope, tweets) {
  $scope.tweets = tweets;
})

.controller('ActionHistoryCtrl', function($scope, activity) {
  $scope.activity = activity;
})

.controller('DetailCtrl', function($scope, tweet, activity, Tweet) {
  $scope.tweet = tweet;
  $scope.activity = activity;

  $scope.updateTweet = function(tweet) {
    Tweet.update(tweet, function(value) {
      $scope.tweet = value;
    });
  };

  $scope.approveTweet = function(tweet) {
    tweet.status = 1;
    $scope.updateTweet(tweet);
  };

  $scope.rejectTweet = function(tweet) {
    tweet.status = -1;
    $scope.updateTweet(tweet);
  };
})

.controller('ComposeCtrl', function($scope, $state, handles, Tweet) {
  $scope.newTweet = $state.current.data.newTweet;
  $scope.handles = handles;

  $scope.tweet = new Tweet();

  if (handles.results.length === 1) {
    $scope.disableHandle = true;
    $scope.tweet.handle = handles.results[0].id;
  }

  $scope.getCharacterCount = function(body) {
    var shortUrlLength = 22;
    var shortUrlLengthHttps = 23;

    if (body === undefined) {
      return 140;
    }
    
    var remaining = 140;
    var splitBody = body.split(' ');

    if (splitBody.length > 1) {
      remaining -= (splitBody.length - 1);
    }

    for (var i=0; i<splitBody.length; i++) {
      if (splitBody[i].substring(0, 7) === 'http://' && splitBody[i].length > shortUrlLength) {
        remaining -= shortUrlLength;
      } else if (splitBody[i].substring(0, 8) === 'https://' && splitBody[i].length > shortUrlLengthHttps) {
        remaining -= shortUrlLengthHttps;
      } else {
        remaining -= splitBody[i].length;
      }
    }
    return remaining;
  };

  $scope.save = function(tweet) {
    var saveSuccess = function(value) {
      $state.go('dashboard.detail', {id: value.id});
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
