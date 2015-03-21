angular.module('tweetCheck')

.factory('Realtime', function($rootScope, $http) {
  var realtime = {};

  var socket = io('/');
  socket.emit('subscribeToOrg', {organization: $rootScope.user.organization});

  socket.on('new', function() {
    realtime.newCallback();
  });

  socket.on('update', function(message) {
    realtime.updateCallback(message.id);
  });

  socket.on('pending', function(message) {
    $rootScope.$apply(function() {
      $rootScope.pendingCount = message;
    });
  });

  socket.on('scheduled', function(message) {
    $rootScope.$apply(function() {
      $rootScope.scheduledCount = message;
    });
  });

  realtime.setCallbacks = function(newCallback, updateCallback) {
    this.newCallback = newCallback;
    this.updateCallback = updateCallback;
  };

  realtime.getCounts = function() {
    $http.get('/api/counts/')
      .success(function(data, status, headers, config) {
        $rootScope.pendingCount = data.pending;
        $rootScope.scheduledCount = data.scheduled;
      });
  };

  return realtime;
});
