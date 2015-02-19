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

			/* Getting payments */
			$rootScope.documentTitle = "Bestsellers";



		}]);