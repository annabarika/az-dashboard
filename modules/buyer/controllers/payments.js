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
            // show header and max-sidebar
            $rootScope.hideHeader = 'showHeader';
			/* Getting payments */
			$rootScope.documentTitle = "Payments";
			$scope.tableHeader = [
				{ name: "id", title: 'ID' },
				{ name: "orderId", title: 'Order' },
				{ name: "factory", title: 'Factory' },
				{ name: "paymentDate", title: 'Payment date' },
				{ name: "paymentMethod", title: 'Payment method' },
				{ name: "paymentAmount", title: 'Payment' },
				{ name: "refundAmount", title: 'Refund' }
			];

			RestFactory.request(config.API.host + "payment/load")
				.then(function(response){
					console.log(response);
					//console.log(response);
					var data = [];
					//data.header = $scope.paymentsHeader;

					for( var i in response ){
						data[i] = {};
						for( var n in $scope.tableHeader ) {
							//console.log(response[i]);

							var key = $scope.tableHeader[n].name;

							if( response[i][key]  ) {
								data[i][key] = response[i][key]
							}else{
								data[i][key] = '';

								if(key == 'paymentAmount'){
									if(response[i].paymentType == 'payment'){
										data[i][key] = response[i].amount;
									}
								}
								if(key == 'refundAmount'){
									if(response[i].paymentType == 'refund'){
										data[i][key] = response[i].amount;
									}
								}
							}
							data[i][key]._id = n;
						}
					}
					console.log(data);
					$scope.data = data;

				});

		}]);