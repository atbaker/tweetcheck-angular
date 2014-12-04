/* Filters */

angular.module('tweetCheck.filters', [])

.filter('summarize', function () {
    return function (value, wordwise, max) {
        if (!value) return '';

        max = (parseInt(max, 10) || 30);
        if (!max) return value;
        if (value.length <= max) return value;

        value = value.substr(0, max);
        if (wordwise) {
            var lastspace = value.lastIndexOf(' ');
            if (lastspace != -1) {
                value = value.substr(0, lastspace);
            }
        }

        return value + (' …');
    };
})

.filter('remainingCharacterCount', function() {
    return function (body) {
        var shortUrlLength = 22;
        var shortUrlLengthHttps = 23;

        if (body === undefined) {
          return 140;
        }
        var splitBody = body.split(' ');
        var remaining = 140;

        for (var i=0; i<splitBody.length; i++) {
          if (splitBody[i].substring(0, 7) === 'http://' && splitBody[i].length > shortUrlLength) {
            remaining -= shortUrlLength;
          } else if (splitBody[i].substring(0, 8) === 'https://' && splitBody[i].length > shortUrlLengthHttps) {
            remaining -= shortUrlLengthHttps;
          } else {
            remaining -= Math.max(splitBody[i].length, 1);
          }
        }
        return remaining;
    };
});
