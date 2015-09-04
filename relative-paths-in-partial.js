'use strict';

(function(){

/**
 * JS equivalent of Java hash codo function.
 * source: http://werxltd.com/wp/2010/05/13/javascript-implementation-of-javas-string-hashcode-method/
 **/
function hashCode(string) {
        var hash = 0, i, chr, len;
        if (string.length == 0) return hash;
        for (i = 0, len = string.length; i < len; i++) {
            chr = string.charCodeAt(i);
            hash = ((hash << 5) - hash) + chr;
            hash |= 0; // Convert to 32bit integer
        }
        return hash;
}
    
/**
 * @name isAbsoluteUrl
 * @author Mohamed Kamal Kamaly
 * @description
 * 
 * # isAbsoluteUrl
 * 
 * Determines whether the url is an absolute url (not relative)
 **/
function isAbsoluteUrl(url){
	return url[0] === '/' || (url.indexOf('://') !== -1);
}

/**
 * @author Mohamed Kamal Kamaly
 * A function that traverse the full tree of a jqLite element
 * and perform operations on its nodes
 **/
function searchAndApply(elem, opertations){
	if(elem.length == 0)
		return;

	for(var i=0; i<elem.length; i++){
		for(var j=0; j<opertations.length; j++){
			if(opertations[j].matcherFunc(elem[i])){
				opertations[j].applyFunc(elem[i]);
			}
		}
	}
	
	/* cannot use setTimeout for the recursion because the interceptor
	   has to return the proccessed response */
	searchAndApply(elem.children(), opertations);
}

/**
 * @author Mohamed Kamal Kamaly
 * a property matcher to be used in searchAndApply function
 **/
function propertyMatcher(propertyName, propertyValue){
	return function(element){
		return element[propertyName] === propertyValue;
	}
}

/**
 * @name isAbsoluteUrl
 * @author Mohamed Kamal Kamaly
 * @description
 * 
 * # isAbsoluteUrl
 * 
 * A function that returns a function that can be passed in
 * the searchAndApply function to replace the attributes with
 * relative paths to full paths 
 **/
function insertRestOfPath(attributeName, parentUrl) {
	return function(elementNode) {
		var element = angular.element(elementNode);
		
		var elementUrl = element.attr(attributeName);
		
		if(!elementUrl || isAbsoluteUrl(elementUrl)){
			return;
		}

		var newUrl = parentUrl.substr(0, parentUrl.lastIndexOf('/') + 1) + elementUrl;
		
		element.attr(attributeName, newUrl);
	};
}
	
/**
 * @name relativePathsInPartial
 * @author Mohamed Kamal Kamaly, David Eberlein
 * @description
 * 
 * # relativePathsInPartial
 * 
 * When you modularize your apps by features not by layers, usually you want each feature to be self contained
 * so your controller, html partial and any static resources (images, css, other htmls, ...etc) that is only
 * related to this feature are placed in the same folder, the problem occurs when you want to use static resources like an image
 * you will have to write the full path of the image because relative path in partials is actually relative to the index.html
 * not the html partial, this means in any change of the folder structure of your app, you will
 * have to manually modifiy the path of all the static resources
 * 
 * relativePathsInPartial helps solving this problem by allowing you to write paths of your resource
 * relative to the html partial file.
 * 
 * it works by adding an interceptor to the http response, when a partial is requested from the server 
 * and returns in a response, relativePathsInPartial intercepts this response, modify all the paths to have full
 * path relative to parent.
 * 
 * You can configure a url prefix to restrict the replacements to only be done on url's that start with the given prefix.
 * This can be done using the relativePathsInterceptorProvider in your module.configure() function.
 * This functionality requires the support of String.startsWith or a polyfill 
 * (e.g. https://github.com/MathRobin/string.startsWith)
 * 
 * relativePathsInPartial uses angular.element (jqLite and doesn't depend on JQuery)
 * 
 */
angular.module('relativePathsInPartial', [])
	.provider("relativePathsInterceptor", function () {

            var prefix = "";
            var processedHashCache = {};

            function _isProcessedYet(url, data) {
                var cacheHash = processedHashCache[url];
                if (cacheHash === undefined) return false;
                var dataHash = hashCode(data);
                return dataHash === cacheHash;
            }

            function _isHtml(url) {
                return url.lastIndexOf('.html') === url.length - 5;
            }

            return {
                /**
                 * Only include urls with the given prefix.
                 * @param value @type {string}
                 */
                setInteceptionPrefix: function (value) {
                    prefix = value;
                },
                $get: function () {
                    return {
                        response: function (response) {
                            var url = response.config.url;

                            if (_isHtml(url) && url.startsWith(prefix) && !_isProcessedYet(url, response.data)) {

                                var elem = new angular.element(response.data);

                                var myOperations = [{
                                    matcherFunc: propertyMatcher('tagName', 'LINK'),
                                    applyFunc: insertRestOfPath('href', url)
                                }, {
                                    matcherFunc: propertyMatcher('tagName', 'SCRIPT'),
                                    applyFunc: insertRestOfPath('src', url)
                                }, {
                                    matcherFunc: propertyMatcher('tagName', 'IMG'),
                                    applyFunc: insertRestOfPath('src', url)
                                }];

                                // TODO: find an efficient way to process 'src' attribute of 'ng-include'
                                // elem.find('ng-include').each(replaceUrlFunc('src'));
                                searchAndApply(elem, myOperations);
                                response.data = angular.element('<div />').append(elem).html();

                                // Since angular caches our intercepted data we save a hash of the data
                                // to be able to check if data has already been processed or not
                                processedHashCache[url] = hashCode(response.data);
                            }

                            return response;
                        }
                    };
                }
            };
        })
        .config(function ($httpProvider) {
            $httpProvider.interceptors.push("relativePathsInterceptor");
        });


})();
