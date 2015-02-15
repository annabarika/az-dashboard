(function(){

	var app = angular.module('modules.buyer', []);

	app.config(function($stateProvider){

		$stateProvider
			.state('buyer.orders', {
				url: '/buyer/orders',
				templateUrl: '/modules/buyer/views/orders/index.html'
			});
	});


	/** factory for orders
	 * @Param: $http
	 * @param:$q
	 */

	app.factory("orderService",["$http","$q",
			function($http,$q){

				var service={};

				service.getData=function(url){

					var deferred = $q.defer();

					$http.get(url)
						.success(function (response) {
							if(response)
							{
								deferred.resolve(response);
							}
							else
							{
								deferred.resolve(response);
							}

						})
						.error(function (error) {
							deferred.reject(error);
						});

					return deferred.promise;
				};




				return service;
			}]
	);
	/**
	 * Order controller
	 */
	app.controller('OrdersController',

		[
			'$scope',
			"orderService",


			function($scope,orderService){

				/* get orders */
				orderService.getData("/mock/order.json")
					.then(function(response){

						$scope.dataOrders=response;

						$scope.orders=$scope.dataOrders;
					});
				/*get factories*/
				orderService.getData("/mock/factory.json")
					.then(function(response){

						$scope.Factory=response;
					});
				/*get statuses*/
				orderService.getData("/mock/orderstatus.json")
					.then(function(response){

						$scope.Status=response;
					});

				$scope.modalContent="Test Content for modal window";
				$scope.modalTitle="Some Title";

				$scope.edit=function(obj){
					console.log(obj);
				};

				/*get selected items for factory  */

				var filter={};
				$scope.$watch('resultData',function(newVal){
					var arr=[];

					angular.forEach( newVal, function( value, key ) {

						if ( value.ticked === true ) {

							filter[value.name]=value;

							orderService.getData("/mock/orderfilter.json?"+value.name)

								.then(function(response){

									for(var i=0; i<response[value.name].length;i++){
										arr.push(response[value.name][i]);
									}
									$scope.orders=arr;
								});

						}

					});
					/*   console.log(filter);*/

					try{
						if(newVal.length==0){

							$scope.orders=$scope.dataOrders;
						}
					}
					catch(e){

					}

				});


				/*get selected items for statuses */

				/* $scope.$watch('resultDataStatus',function(newVal){
				 var arr=[];
				 angular.forEach( newVal, function( value, key ) {

				 if ( value.ticked === true ) {

				 orderService.filterData("/mock/orderfilter.json", value.name)

				 .then(function(response){

				 for(var i=0; i<response[value.name].length;i++){
				 arr.push(response[value.name][i]);
				 }
				 $scope.orders=arr;
				 });

				 }
				 });

				 try{
				 if(newVal.length==0){

				 $scope.orders=$scope.dataOrders;
				 }
				 }
				 catch(e){

				 }

				 });*/


			}]);


	app.controller('BestsController',

		[
			'$http',
			'$scope',
			"$rootScope",


			function($http, $scope,$rootScope){

				$scope.test="bestsellers routing is work!";

			}]);



	app.controller('CargoController',

		[
			'$http',
			'$scope',
			"$rootScope",

			function($http, $scope,$rootScope){

				$scope.test="cargo routing is work!";

			}]);


})();
