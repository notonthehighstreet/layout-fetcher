var request = require('request');

/**
 * Fetch a layout from a remote service, proxying cookies
 *
 * @param {Object} [options]
 * @param {Function} [doneCallback]
 * @return {Function}
 * @api public
 */

module.exports = function(options) {
    var layout;
    var options = options || {};

    var useCachedLayout = function() {
        return options.cacheLayout && layout;
    };

    return function(req, res, next) {
        if (useCachedLayout()) return next();

        var requestOptions = {
            url: options.url,
            // Pass cookies from the client through to the layout service
            headers: { cookie: req.headers.cookie }
        };

        request(requestOptions, function (layoutError, layoutRes, layoutBody) {
            if (layoutError || layoutRes.statusCode !== 200) {
                return next(new Error('Failed to fetch noths layout'));
            }

            // Provide cookies to the client provided by the layout service
            res.setHeader("Set-Cookie", layoutRes.headers['set-cookie']);
            layout = layoutBody;

            options.done(layout);

            next();
        });
    };
};
