'use strict';

angular.module('tweetCheck')

.factory('AuthService', function($rootScope, Handle, $http, $state, $cookieStore, $q, User, $window) {
  var authService = {};

  authService.register = function(userData, failure) {
    $http.post('/auth/register', userData)
    .success(function(data) {
      $state.go('activate');
    })
    .error(function(data) {
      failure(data.error || 'There was an registering this user.');
    });
  };

  authService.activate = function(userData, failure) {
    var self = this;
    $http.post('/auth/activate-invitation', userData)
    .success(function(data) {
      self.loginSuccess(data);
    })
    .error(function(data) {
      failure(data.error || 'There was an error activating this user.');
    });
  }

  authService.invite = function(userData, success, failure) {
    $http.post('/auth/invite', userData)
    .success(function(data) {
      success(data);
    })
    .error(function(data) {
      failure(data.error || 'There was an error inviting this user.');
    });
  };

  authService.reinvite = function(userData, success, failure) {
    $http.get('/auth/reinvite?user=' + userData.id)
    .success(success)
    .error(function(data) {
      failure(data.error || 'There was an error reinviting this user.');
    })
  }

  authService.loginSuccess = function(data, status, headers) {
    $cookieStore.put('token', data.token);

    // Store the token in our session for easy access
    $window.sessionStorage['token'] = data.token;

    this.prepareScope(data.token, function() {
      $state.go('dashboard.review');
    });
  };

  authService.login = function(username, password, failure) {
    $http.post('/api-token-auth/',
      {username: username,
       password: password}
    )
    .success(this.loginSuccess.bind(this))
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
