'use strict';

angular.module('tweetCheck.filters', ['ngSanitize'])

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

.filter('linkHashtags', function ($sce) {
    return function (body) {
        var words = body.split(' ');
        for (var i=0; i<words.length; i++) {
            if (words[i][0] === '#') {
                var hashtag = words[i];
                var oldString = body;
                body = oldString.replace(hashtag, $sce.trustAsHtml('<a href="https://twitter.com/hashtag/' + hashtag.substring(1) + '" target="_blank">' + hashtag + '</a>'));

            }
        }
        return body;
    };
});
