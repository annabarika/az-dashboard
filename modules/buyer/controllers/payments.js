var app = angular.module("modules.buyer.payments", [

]);

app.controller('PaymentListController',

	[
		'$scope',
		'$rootScope',
		"$location",
		"$route",
		"PaymentService",
		"$modal",
		function ($scope, $rootScope, $location, $route, PaymentService,$modal){

			$scope.$route = $route;
			$scope.$location = $location;

			/* Getting payments */
			$rootScope.documentTitle = "Payments";
			$scope.tableHeader = [
				{ name: "id", title: 'ID' },
				{ name: "orderId", title: 'Order' },
				{ name: "factory", title: 'Factory' },
				{ name: "date", title: 'Payment date' },
				{ name: "method", title: 'Payment method'},
				{ name: "amount", title: 'Payment' },
				{ name: "refund", title: 'Refund' }
			];

			PaymentService.getPayments().then(

				function(response){
					//console.log(response);
					if(_.isArray(response)){

						$scope.data = PaymentService.parseData(response,$scope.tableHeader);

					}
				}
			);

			PaymentService.getStatuses().then(
				function(response){
					//console.log(response);
					$scope.status=response;
				}
			);

			PaymentService. getCashierOfficies().then(
				function(response){
					//console.log(response);
					$scope.cashierOfficies=response;
				}
			);

			$scope.paymentType=[
				{name:'payment'},
				{name:'refund'}
			];

			$scope.$watchCollection('resultData',function(value){
				if(value){
					console.log(value);
				}
			});

			$scope.addNewPayment=function(){
				var modalInstance=$modal.open({
					templateUrl:"/modules/buyer/views/payments/new_payment.html",
					controller:function($scope){

					},
					backdrop:'static',
					size:"sm"
				})
			}
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