angular-relative-paths-in-partial
=================================

an angular module that allows you to write paths inside your partial html files relative to the html partial location instead of the index.html location.

# About

When you modularize your apps by features not by layers, usually you want each feature to be self contained
so your controller, html partial and any static resources (images, css, other htmls, ...etc) that is only
related to this feature are placed in the same folder, the problem occurs when you want to use static resources like an image
you will have to write the full path of the image because relative path in partials is actually relative to the index.html
not the html partial, this means in any change of the folder structure of your app, you will
have to manually modifiy the path of all the static resources

relativePathsInPartial helps solving this problem by allowing you to write paths of your resource
relative to the html partial file.

it works by adding an interceptor to the http response, when a partial is requested from the server 
and returns in a response, relativePathsInPartial intercepts this response, modify all the paths to have full
path relative to parent.

relativePathsInPartial uses angular.element (jqLite and doesn't depend on JQuery


# How to use

just include the "relative-paths-in-partial.js" and add a dependency on "relativePathsInPartial" module.

# Configuring a URL prefix
You can configure a URL prefix to restrict the replacements be to only done to HTML files which URLs start with the given prefix.
This can be done using the ```relativePathsInterceptorProvider``` in your ```module.configure()``` function.
This functionality requires the support of String.startsWith or a polyfill (e.g. https://github.com/MathRobin/string.startsWith)

Example

```javascript
angular.module('myApp', ['relativePathsInPartial'])
.config(['relativePathsInterceptorProvider', function (relativePathsInterceptorProvider) {
  relativePathsInterceptorProvider.setInteceptionPrefix('/intercept/urls/');
  // other setup
});
```

This will result in all html files starting with the URLs ```'/intercept/urls/'``` to be intercepted:
- ```'/intercept/urls/myhtml.html'``` --> intercepted
- ```'/intercept/urls/subdir/myhtml.html'``` --> intercepted
- ```'/templates/urls/other.html'``` --> not intercepted (other prefix)
- ```'/intercept/urls/subdir/myhtml'``` --> not intercepted (no .html extention)
