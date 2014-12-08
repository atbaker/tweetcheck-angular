/* Controllers */

angular.module('tweetCheck.controllers', [])

.controller('LoginCtrl', function($scope, AuthService) {
  $scope.login = function(user) {
    AuthService.login(user.email, user.password);
  };
})

.controller('LogoutCtrl', function(AuthService) {
  AuthService.logout();
})

.controller('DashboardCtrl', function($scope, Tweet) {
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

.controller('TweetListCtrl', function($scope, tweets, activity) {
  $scope.tweets = tweets;
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

  $scope.tweet = new Tweet();

  // This is necessary because angular-ui-router won't force resolves defined
  // in the state to be resolved before loading the controller on page refresh
  if (handles.hasOwnProperty('results') && handles.results.length === 1) {
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
