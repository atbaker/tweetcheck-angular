/* Controllers */

angular.module('tweetCheck.controllers', [])

.controller('RegisterCtrl', function($scope, AuthService) {
  $scope.register = function(user) {
    AuthService.register(user, function(error) {
      $scope.registerError = error;
    });
  };
})

.controller('LoginCtrl', function($scope, AuthService) {
  $scope.login = function(user) {
    AuthService.login(user.email, user.password, function(error) {
      $scope.loginError = error;
    });
  };
})

.controller('LogoutCtrl', function(AuthService) {
  AuthService.logout();
})

.controller('DashboardCtrl', function(Realtime) {
  Realtime.getCounts();
})

.controller('ConnectCtrl', function($scope, $http) {
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
})

.controller('ComposeCtrl', function($scope, $rootScope, $state, tweet, handles, Tweet) {
  $scope.newTweet = tweet.id === undefined;

  $scope.handles = handles;
  $scope.processing = false;

  // Initialize the tweet model object
  $scope.tweet = tweet;
  if (!$scope.newTweet) {
    if (tweet.eta !== null) {
      $scope.showScheduleFields = true;
      var eta = moment(tweet.eta).toDate();
      tweet.etaDate = eta;
      tweet.etaTime = eta;
    }
  }

  if (handles.length === 1) {
    $scope.disableHandle = true;
    $scope.tweet.handle = handles[0].id;
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

    // Create a datetime object from the two fields
    if (tweet.etaDate !== undefined) {
      var tweetDate = moment(tweet.etaDate).startOf('day');
      var tweetTime = moment(tweet.etaTime);

      tweetDate.hour(tweetTime.hour()).minute(tweetTime.minute());
      tweet.eta = tweetDate.toISOString();
    }

    delete tweet.etaDate;
    delete tweet.etaTime;

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

  $scope.approve = function(tweet) {
    if (tweet.etaDate !== null) {
      tweet.status = 3;
    } else {
      tweet.status = 1;
    }
    $scope.save(tweet);
  };

  $scope.reject = function(tweet) {
    tweet.status = -1;
    $scope.save(tweet);
  };
})

.controller('UsersCtrl', function($scope, $rootScope, users, filterFilter, User, AuthService) {
  $scope.users = users;

  $scope.changeApprover = function(user) {
    user.is_approver = !user.is_approver;
    User.update(user);
  };

  $scope.changeActive = function(user) {
    user.is_active = !user.is_active;
    User.update(user);
  };

  $scope.inviteApprover = function(email) {
    $scope.inviteApproverError = null;
    $scope.inviteUser({email: email, is_approver: true});
  };

  $scope.inviteAuthor = function(email) {
    $scope.inviteAuthorError = null;
    $scope.inviteUser({email: email, is_approver: false});
  };

  $scope.inviteUser = function(user) {
    AuthService.invite(user, function(invitedUser) {
      $scope.users.push(invitedUser);
    }, function(error) {
      if (user.is_approver) {
        $scope.inviteApproverError = error;
      } else {
        $scope.inviteAuthorError = error;
      }
    });
  };

  $scope.reinviteUser = function(user) {

  };
})

.controller('SettingsCtrl', function($scope) {

});
