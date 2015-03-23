'use strict';

angular.module('tweetCheck')

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

  $scope.setInviteError = function(user, error) {
    if (user.is_approver) {
      $scope.inviteApproverError = error;
    } else {
      $scope.inviteAuthorError = error;
    }
  };

  $scope.inviteUser = function(user) {
    AuthService.invite(user, function(invitedUser) {
      $scope.users.push(invitedUser);
    }, function(error) {
      $scope.setInviteError(user, error);
    });
  };

  $scope.reinviteUser = function(user) {
    AuthService.reinvite(user, function() {
      user.reinvited = true;
    }, function(error) {
      $scope.setInviteError(user, error);
    });
  };
});
