var request = require('request');
var mustache = require('mustache');

/**
 * Fetch a layout from a remote service, proxying cookies
 *
 * @param {Object} [options]
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
                return next(new Error('Failed to fetch layout'));
            }

            // Provide cookies to the client provided by the layout service
            res.setHeader("Set-Cookie", layoutRes.headers['set-cookie']);
            layout = layoutBody;
            
            req.layout = {
                html: layout,
                render: function(view) {
                    return mustache.render(this.html, view);
                }
            };

            next();
        });
    };
};
