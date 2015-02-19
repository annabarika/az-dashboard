var app = angular.module("modules.buyer.payments", [

]);

app.controller('PaymentListController',

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

			var modalWindow,
				url,
				method,
				data,
				header;

			/* Getting payments */
			$rootScope.documentTitle = "Payments";

			RestFactory.request(config.API.host + "payment/loadAll")
				.then(function(response){
					$scope.data = response;
				});

		}]);