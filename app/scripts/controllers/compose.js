angular.module('tweetCheck')

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
});
