(function(){

	angular.module('Azimuth', [
		"ngRoute",
		"directives",
		"models.navigation",
		"multi-select",
		"widgets",
		"ui.bootstrap",

		"modules.buyer"
	])
		.provider('configProvider', function(){
			return {
				config: {
					API: "http://azimuth/proxy/",
					URLS: {
						APP: "/app/",
						MODULES: "/modules/",
						WIDGETS: "/app/widgets/"
					}
				},
				$get : function(){
					return config;
				}
			}
		})
	.config(function ($routeProvider, $locationProvider) {
			//$httpProvider.defaults.useXDomain = true;
			//delete $httpProvider.defaults.headers.common['X-Requested-With'];

			$locationProvider.html5Mode(true);

			$routeProvider

				.when("/",
				{
					templateUrl: "/app/views/startpage.html",
					controller:"MainController"
				}
			)
				.otherwise(
				{
					redirectTo:'/'
				}
			);
		})

	/**
	 * RESTApi service
	 */
		.factory("RestFactory",["$http","$q",function($http,$q){

			var service={};

			service.request=function(url,type,data) {
				console.log(url, type);

				var deferred = $q.defer();

				$http(
					{
						method: type,
						url: url,
						data: data,
						headers: "application/x-www-form-urlencoded; charset=utf-8"
					}
				)
					.success(function (response) {
						if (response) {
							deferred.resolve(response)
						}
						else {
							deferred.resolve(response);
						}
					})
					.error(function (jqXHR, textStatus, errorThrown, error) {
						console.log("You can not send Cross Domain AJAX requests: " + errorThrown);

						deferred.reject(error);
					});

				return deferred.promise;


				/*$.ajax({
				 url:url,
				 type:type,
				 data:data,
				 dataType:"json",
				 contentType:"application/x-www-form-urlencoded; charset=utf-8",
				 success:function(response)
				 {
				 if(response)
				 {
				 deferred.resolve(response);
				 }
				 else
				 {
				 deferred.resolve(response);
				 }
				 },
				 error:function(jqXHR,textStatus,errorThrown, error)
				 {
				 console.log("You can not send Cross Domain AJAX requests: "+errorThrown);

				 deferred.reject(error);
				 }
				 });

				 return deferred.promise;
				 };*/


				return service;
			}}])

		.controller("MainController", function($scope, NavigationModel){
			NavigationModel.get().then(function(result){ $scope.Navigation = result.data; });
		})
	;
})();