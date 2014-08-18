var request = require('request');
var mustache = require('mustache');

/**
 * Fetch a layout template from a remote service, proxying cookies
 * Currently the only template format supported is mustache
 *
 * @param {String} [url]
 * @param {Object} [options]
 * @return {Function}
 * @api public
 */

module.exports = function(url, options) {
    var layout;
    var options = options || {};

    var useCachedLayout = function() {
        return options.cacheLayout && layout;
    };

    var addLayoutToRequest = function(res) {
        res.locals.layout = layout;
    };

    return function(req, res, next) {
        if (useCachedLayout()) {
            addLayoutToRequest(res);
            return next();
        }

        var requestOptions = {
            url: url,

            headers: {
                // Pass cookies from the client through to the layout service
                cookie: req.headers.cookie,
                // Provide the remote IP address to the layout service
                'X-Forwarded-For': req.connection.remoteAddress
            }
        };

        request(requestOptions, function (requestError, requestResponse, responseBody) {
            if (requestError || requestResponse.statusCode !== 200) {
                return next(new Error('Failed to fetch layout'));
            }

            // Provide cookies to the client provided by the layout service
            res.setHeader("Set-Cookie", requestResponse.headers['set-cookie']);

            layout = {
                template: responseBody,
                render: function(view) {
                    return mustache.render(this.template, view);
                }
            };

            addLayoutToRequest(res);

            next();
        });
    };
};
