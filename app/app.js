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
		.controller("MainController", function($scope, NavigationModel){
			NavigationModel.get().then(function(result){ $scope.Navigation = result.data; });
		})
	;
})();