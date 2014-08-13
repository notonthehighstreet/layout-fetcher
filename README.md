layout-fetcher
==============

Express middleware for fetching layout templates.

Currently only supports mustache templates.

Useful for fetching dynamic layouts.

Usage
-----

```
var layoutFetcher = require('layout-fetcher');

app.use(layoutFetcher("http://www.example.com/template"));
```

If fetching the layout was successful this will create a `res.locals.layout` model. 

This can be used to render the layout template with view data:

```
var html = res.locals.layout.render(view);
```

Options
-------

Options can be provided with an object as a second argument. Example:

```
app.use(layoutFetcher("http://www.example.com/template", {
    cacheLayout: true
}));
```

Currently the only option is `cacheLayout`. When set to `true` it will cause the middlware to only ever make 
one request to the template url. The same layout will then be provided for every subsequent request.

`cacheLayout: true` is useful when you are developing your express application, but should not be used on production.
