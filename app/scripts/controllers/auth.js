angular.module('tweetCheck')

.controller('RegisterCtrl', function($scope, AuthService) {
  $scope.register = function(user) {
    AuthService.register(user, function(error) {
      $scope.registerError = error;
    });
  };
})

.controller('ActivateInvitationCtrl', function($scope, $stateParams, AuthService) {
  $scope.activate = function(user) {
    user.token = $stateParams.key;
    AuthService.activate(user, function(error) {
      $scope.activationError = error;
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
});
