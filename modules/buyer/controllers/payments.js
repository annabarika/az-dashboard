var app = angular.module("modules.buyer.payments", [

]);

app.controller('PaymentListController',

	[
		'$scope',
		'$rootScope',
		"$location",
		"$route",
		"PaymentService",

		function ($scope, $rootScope, $location, $route, PaymentService){

			$scope.$route = $route;
			$scope.$location = $location;

			/* Getting payments */
			$rootScope.documentTitle = "Payments";
			$scope.tableHeader = [
				{ name: "id", title: 'ID' },
				{ name: "orderId", title: 'Order' },
				{ name: "factory", title: 'Factory' },
				{ name: "date", title: 'Payment date' },
				{ name: "method", title: 'Payment method' },
				{ name: "amount", title: 'Payment' },
				{ name: "refund", title: 'Refund' }
			];

			PaymentService.getPayments().then(

				function(response){

					if(_.isArray(response)){

						$scope.data = PaymentService.parseData(response,$scope.tableHeader);

					}
				}
			);

		}]);

app.controller("PaymentOrderController",[
	'$scope',
	'$rootScope',
	"$modal",
	"$location",
	"$route",
	"$routeParams",
	"RestFactory",

	function ($scope, $rootScope, $modal, $location, $route,$routeParams, RestFactory){
		console.log($routeParams);
		$scope.orderId=$routeParams.id;
		$scope.back=function(){
			$location.path("buyer/payments")
		}


	}]);