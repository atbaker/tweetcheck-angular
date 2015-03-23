'use strict';

angular.module('tweetCheck')

.factory('Tweet', function($resource) {
  return $resource('api/tweets/:id/', {id: '@id'}, {
    queryApproved: {method: 'GET', isArray: true, params: {status: 1}},
    update: {method: 'PUT'}
  });
})

.factory('Handle', function($resource) {
  return $resource('api/handles/:id/', {id: '@id'}, {
      queryObject: {method: 'GET', transformResponse: function(data) {
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
  return $resource('api/users/:id/', {id: '@id'}, {
    update: {method: 'PUT'}
  });
});
