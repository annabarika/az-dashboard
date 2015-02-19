var app = angular.module("modules.buyer.bestsellers", [

]);

app.controller('BestCalendarController',

	[
		'$scope',
		'$rootScope',
		"$modal",
		"$location",
		"$route",
		"RestFactory",


		function ($scope, $rootScope, $modal, $location, $route, RestFactory){

			$scope.$route = $route;
			$scope.$location = $location;
			console.log(config.API.host);

			/* Getting payments */
			$rootScope.documentTitle = "Bestsellers";

			RestFactory.request(config.API.host + "payment/loadAll")
				.then(function(response){
					$scope.data = response;
				});

		}]);