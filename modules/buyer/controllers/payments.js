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

			/* Getting payments */
			$rootScope.documentTitle = "Payments";
			$scope.tableHeader = [
				{ _id:1, name: "id", title: 'ID' },
				{ _id:2, name: "orderId", title: 'Order' },
				{ _id:3, name: "factory", title: 'Factory' },
				{ _id:4, name: "paymentDate", title: 'Payment date' },
				{ _id:5, name: "paymentMethod", title: 'Payment method' },
				{ _id:6, name: "paymentAmount", title: 'Payment' },
				{ _id:7, name: "refundAmount", title: 'Refund' }
			];

			RestFactory.request(config.API.host + "payment/load")
				.then(function(response){
					console.log($scope.tableHeader);
					//console.log(response);
					var data = [];
					//data.header = $scope.paymentsHeader;

					for( var i in response ){
						data[i] = {};
						for( var n in $scope.tableHeader ) {
							//console.log(response[i]);
							var key = $scope.tableHeader[n].name;

							if( response[i][key]  ) {
								data[i][n] = response[i][key];
							}else{
								data[i][n] = '';

								if(key == 'paymentAmount'){
									if(response[i].paymentType == 'payment'){
										data[i][n] = response[i].amount;
									}
								}
								if(key == 'refundAmount'){
									if(response[i].paymentType == 'refund'){
										data[i][n] = response[i].amount;
									}
								}
							}
						}
					}
					console.log(data);
					$scope.data = data;

				});

		}]);