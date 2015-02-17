(function(){

	angular.module('Azimuth', [
		"ngRoute",
		"directives",
		"models.navigation",
		"multi-select",
		"widgets",
		"ui.bootstrap",
		"services",
		"modules.buyer"
	])

	.config(function ($routeProvider, $locationProvider) {

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