'use strict';

(function(){
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
 * @name isAbsoluteUrl
 * @author Mohamed Kamal Kamaly
 * @description
 * 
 * # isAbsoluteUrl
 * 
 * A function that returns a function that can be passed in
 * the  a JQuery.each() to replace the attributes with
 * relative paths to full paths 
 **/
function insertRestOfPath(attributeName, parentUrl) {
	return function() {
		var element = angular.element(this);
		
		var elementUrl = element.attr(attributeName);
		
		if(isAbsoluteUrl(elementUrl)){
			return;
		}

		var newUrl = parentUrl.substr(0, parentUrl.lastIndexOf('/') + 1) + elementUrl;
		
		element.attr(attributeName, newUrl);
	}
}
	
/**
 * @name relativePathsInPartial
 * @author Mohamed Kamal Kamaly
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
 * relativePathsInPartial uses angular.element (jqLite and doesn't depend on JQuery
 * 
 */
angular
		.module("relativePathsInPartial", [])
		.config(function($httpProvider) {

					$httpProvider.interceptors.push(function() {
						return {
							response : function(response) {
								var url = response.config.url;

								/*
								 * TODO: check if the request is sent with template
								 * cache to be sure that it is an angular template
								 * 
								 * put the template after processing
								 * into the cache and do not process it again
								 */
								if (url.lastIndexOf('.html') === url.length - 5) {
									
									var elem = angular.element(response.data);

									elem.filter('link').each(insertRestOfPath('href', url));
									elem.filter('script').each(insertRestOfPath('src', url));
									elem.filter('img').each(insertRestOfPath('src', url));
									
									// TODO: find an efficient way to process "src" attribute of "ng-include"
									// elem.find('ng-include').each(replaceUrlFunc('src'));

									/* TODO: find a way to get the html as text from the elem
									 * .html() doesn't work
									 */
									response.data = elem.unwrap();
								}

								return response;
							}
						};
					});

				});

})();
