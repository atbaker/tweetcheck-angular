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

.controller('DashboardCtrl', function() {
})

.controller('AuthorizeCtrl', function($scope, $http) {
  $scope.getRequestToken = function() {
    $http.get('/auth/request').success(function(data, status, headers, config) {
      window.location.href = data.authorizationUrl;
    });
  };
})

.controller('TweetListCtrl', function($scope, tweets, activity, $stateParams, $location, $anchorScroll, Tweet, Realtime) {
  $scope.tweets = tweets;
  $scope.activity = activity;

  $scope.processingTracker = {};

  if ($stateParams.scrollTweet !== null) {
    console.log('scrolling');
    $location.hash('tweet-' + $stateParams.scrollTweet);
    $anchorScroll();
  }

  $scope.updateTweet = function(tweet) {
    $scope.processingTracker[tweet.id] = true;
    Tweet.update(tweet, function(value) {
      for (var i=0; i<$scope.tweets.results.length; i++) {
        if (value.id === $scope.tweets.results[i].id) {
          angular.extend($scope.tweets.results[i], value);
          $scope.processingTracker[value.id] = false;
        }
      }
    });
  };

  $scope.approveTweet = function(tweet) {
    var tweetUpdate = angular.copy(tweet);
    tweetUpdate.status = 1;
    $scope.updateTweet(tweetUpdate);
  };

  $scope.rejectTweet = function(tweet) {
    var tweetUpdate = angular.copy(tweet);
    tweetUpdate.status = -1;
    $scope.updateTweet(tweetUpdate);
  };

  Realtime.setCallback(function(message) {
    $scope.message = message;
    $scope.$apply();
  });
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
    tweetUpdate.status = 1;
    $scope.updateTweet(tweetUpdate);
  };

  $scope.rejectTweet = function(tweet) {
    var tweetUpdate = angular.copy(tweet);
    tweetUpdate.status = -1;
    $scope.updateTweet(tweetUpdate);
  };
})

.controller('ComposeCtrl', function($scope, $rootScope, $state, handles, Tweet) {
  $scope.newTweet = $state.current.data.newTweet;
  $scope.handles = handles;
  $scope.processing = false;

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
    $scope.processing = true;

    var saveSuccess = function(value) {
      // Slightly complicated routing logic here - to be codified in tests
      // new and save -> review#id
      // new and post -> detail
      // edit save from review -> review#id
      // edit post from review -> detail
      // edit save from detail -> detail
      // edit post from detail -> detail
      if (value.status === 0 && ($scope.newTweet || (!$scope.newTweet && $rootScope.$previousState.name === 'dashboard.review'))) {
        $state.go('dashboard.review', {scrollTweet: value.id});
      } else {
        $state.go('dashboard.detail', {id: value.id});
      }
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

  $scope.reject = function(tweet) {
    tweet.status = -1;
    $scope.save(tweet);
  };
})

.controller('EditCtrl', function($scope, tweet) {
  $scope.tweet = tweet;
});
