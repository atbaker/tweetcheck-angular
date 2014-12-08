/* Services */

angular.module('tweetCheck.services', ['ngResource', 'ngCookies'])

.factory('Tweet', function($resource) {
  return $resource('api/tweets/:id', {id: '@id'}, {
    query: {method: 'GET', isArray: false},
    queryApproved: {method: 'GET', isArray: false, params: {status: 1}},
    update: {method: 'PUT'}
  });
})

.factory('Handle', function($resource) {
  return $resource('api/handles/:id', {id: '@id'}, {
      query: {method: 'GET', isArray: false},
      queryObject: {method: 'GET', transformResponse: function(data, headers) {
        var handles = angular.fromJson(data).results;
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
  return $resource('api/actions/:id', {}, {
    query: {method: 'GET', isArray: false}
  });
})

.factory('User', function($resource) {
  return $resource('api/users/:id', {id: '@id'}, {
    query: {method: 'GET', isArray: false}
  });
})

// Authentication service
.factory('AuthService', function($rootScope, $http, $state, $cookieStore, User, $window) {
  var authService = {};

  authService.login = function(username, password) {
    var self = this;
    $http.post('/api-token-auth/',
      {username: username,
       password: password}
    )
    .success(function(data, status, headers) {
      $cookieStore.put('token', data.token);

      // Store the token in our session for easy access
      $window.sessionStorage['token'] = data.token;

      self.setPermissions(data.token, function() {
        $state.go('dashboard.review');
      });
    });
  };

  authService.setPermissions = function(token, callback) {
    User.get({token: token}, function(value) {
      $rootScope.user = value.results[0];
      typeof callback === 'function' && callback();
    });
  };

  authService.logout = function() {
    $cookieStore.remove('token');
    $state.go('login');

    delete $window.sessionStorage['token'];
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

  return authService;
});
