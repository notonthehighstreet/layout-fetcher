var request = require('request');
var mustache = require('mustache');

// The default, this can be overridden by setting one on the url property
const URL = 'http://www.notonthehighstreet.com/layout';

exports.fetchLayout = function(req, res, next) {
    if (useCachedLayout()) return next();

    var requestOptions = {
        url: exports.url,
        // Pass cookies from the client through to the layout service
        headers: { cookie: req.headers.cookie }
    };

    request(requestOptions, function (layoutError, layoutRes, layoutBody) {
        if (layoutError || layoutRes.statusCode !== 200) {
            return next(new Error('Failed to fetch noths layout'));
        }

        // Provide cookies to the client provided by the layout service
        res.setHeader("Set-Cookie", layoutRes.headers['set-cookie']);
        exports.layout = layoutBody;

        next();
    });
};

exports.render = function(view) {
    return mustache.render(exports.layout, view);
};

exports.cacheLayout = false;
exports.url = URL;

var useCachedLayout = function() {
    return exports.cacheLayout && exports.layout;
};
