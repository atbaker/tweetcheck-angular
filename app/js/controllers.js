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

.controller('ComposeCtrl', function($scope, $state, Handle, Tweet) {
  $scope.handles = Handle.query();

  var shortUrlLength = 22;
  var shortUrlLengthHttps = 23;
  $scope.remainingCharacters = 140;

  $scope.getCharacterCounter = function(body) {
    if (body === undefined) {
      return 140;
    }
    var splitBody = body.split(' ');
    var remaining = 140;

    for (var i=0; i<splitBody.length; i++) {
      if (splitBody[i].substring(0, 7) === 'http://' && splitBody[i].length > shortUrlLength) {
        remaining -= shortUrlLength;
      } else if (splitBody[i].substring(0, 8) === 'https://' && splitBody[i].length > shortUrlLengthHttps) {
        remaining -= shortUrlLengthHttps;
      } else {
        remaining -= Math.max(splitBody[i].length, 1);
      }
    }
    return remaining;
  };

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

.controller('EditCtrl', function($scope, $stateParams, Tweet) {
  $scope.tweet = Tweet.get({'id': $stateParams.id});
});
