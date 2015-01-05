/* Services */

angular.module('tweetCheck.services', ['ngResource', 'ngCookies'])

.factory('Tweet', function($resource) {
  return $resource('api/tweets/:id/', {id: '@id'}, {
    queryApproved: {method: 'GET', isArray: true, params: {status: 1}},
    update: {method: 'PUT'}
  });
})

.factory('Handle', function($resource) {
  return $resource('api/handles/:id/', {id: '@id'}, {
      queryObject: {method: 'GET', transformResponse: function(data, headers) {
        var handles = angular.fromJson(data);
        var handleObject = {};

        for (var i=0; i < handles.length; i++) {
          var handle = handles[i];
          handleObject[handle.id] = handle;
        }

        return handleObject;
      }},
      update: {method: 'PUT'}
  });
})

.factory('Action', function($resource) {
  return $resource('api/actions/:id/', {}, {
    query: {method: 'GET', isArray: false}
  });
})

.factory('User', function($resource) {
  return $resource('api/users/:id/', {id: '@id'});
})

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
})

// Authentication service
.factory('AuthService', function($rootScope, Handle, $http, $state, $cookieStore, $q, User, $window) {
  var authService = {};

  authService.login = function(username, password, success, failure) {
    var self = this;
    $http.post('/api-token-auth/',
      {username: username,
       password: password}
    )
    .success(function(data, status, headers) {
      $cookieStore.put('token', data.token);

      // Store the token in our session for easy access
      $window.sessionStorage['token'] = data.token;

      self.prepareScope(data.token, function() {
        success();
        $state.go('dashboard.review');
      });
    })
    .error(function(data, status, headers) {
      failure(data.non_field_errors[0]);
    });
  };

  authService.logout = function() {
    $cookieStore.remove('token');
    $state.go('login');

    delete $window.sessionStorage['token'];
    delete $rootScope.user;
    delete $rootScope.handleObject;
  };

  authService.loadToken = function() {
    if (!$window.sessionStorage.hasOwnProperty('token')) {
      var storedToken = $cookieStore.get('token');
      if (typeof storedToken === 'undefined') {
        $state.go('login');
        return;
      } else {
        $window.sessionStorage['token'] = storedToken;
      }
    }

    return $window.sessionStorage['token'];
  };

  authService.prepareScope = function(token, callback) {
    var users = User.query({token: token}, function(value) {
      $rootScope.user = value[0];
    });
    var handles = Handle.queryObject({}, function(value) {
      if (Object.keys(value).length < 3) {
        // This organization hasn't authorized any handles yet
        $state.go('connect');
      }
      $rootScope.handleObject = value;
    });

    $q.all([users, handles]).then(function() {
      if (typeof callback === 'function') {
        callback();
      } else {
        return;
      }
    });
  };

  return authService;
});
