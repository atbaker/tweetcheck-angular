/* Services */

angular.module('tweetCheck.services', ['ngResource', 'ngCookies'])

.factory('Tweet', function($resource) {
  return $resource('api/tweets/:tweetId', {}, {
    query: {method:'GET', isArray: false},
    update: {method:'PUT'}
  });
})

.factory('Handle', function($resource) {
  return $resource('api/handles/:handleId', {}, {
      query: {method:'GET', isArray: false},
      update: {method:'PUT'}
  });
})

// Authentication service
.factory('AuthService', function($http, $state, $cookieStore, $window) {
  var authService = {};

  authService.login = function(username, password) {
    $http.post('/api-token-auth/',
      {username: username,
       password: password}
    )
    .success(function(data, status, headers) {
      $cookieStore.put('token', data.token);
      $state.go('dashboard.review');

      // Store the token in our session for easy access
      $window.sessionStorage['token'] = data.token;
    });
  };

  authService.logout = function() {
    $cookieStore.remove('token');
    $state.go('login');

    delete $window.sessionStorage['token'];
  };

  authService.loadToken = function() {
    if ($window.sessionStorage.hasOwnProperty('token')) {
      return true;
    }

    var storedToken = $cookieStore.get('token');
    if (typeof storedToken === 'undefined') {
      $state.go('login');
      return false;
    } else {
      $window.sessionStorage['token'] = storedToken;
      return true;
    }

    return false;
  };

  return authService;
});