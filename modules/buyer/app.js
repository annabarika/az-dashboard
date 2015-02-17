var app = angular.module('modules.buyer', [

]);

app.config(function($routeProvider){

	$routeProvider
		.when('/buyer/orders',
		{
			templateUrl:"/modules/buyer/views/orders/index.html",
			controller:"OrdersController"
		}
	)
		.when('/buyer/orders/id/:orderId',
		{
			templateUrl:"/modules/buyer/views/orders/id.html",
			controller:"OrdersController"
		}
	)
		.when('/buyer/bestsellers',
		{
			templateUrl:"/modules/buyer/views/bestsellers/index.html",
			controller:"BestsController"
		}
	);
});


/** factory for orders
 * @Param: $http
 * @param:$q
 */
/*
 app.factory("orderService", ["$http","$q",
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
 */
/**
 * Order controller
 */
app.controller('OrdersController',

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
			var modal;
			$scope.newOrder={};
			/* get orders */
			RestFactory.request("/data/buyer/orders/orders.json")
				.then(function(response){

					$scope.dataOrders=response;

					$scope.orders=$scope.dataOrders;
					$scope.buttons=[
						{
							class:"btn btn-default",
							value:"Cancel"
						},
						{
							class:"btn btn-default",
							value:"Send"
						}
					]
				});
			/*get factories*/
			RestFactory.request("/data/factory.json",'get')
				.then(function(response){

					$scope.Factory=response;
				});
			/*get statuses*/
			RestFactory.request("/data/orderstatus.json",'get')
				.then(function(response){

					$scope.Status=response;
				});

			$scope.modalContent="Test Content for modal window";
			$scope.modalTitle="Some Title";

			/*
			 * Table widget actions
			 * */

			$scope.edit = function(){
				$location.path( '/buyer/orders/id/'+ $rootScope.row.id );
				console.log($rootScope.row);
			};


			$scope.buttonAction=function(){

				console.log($rootScope.row,$rootScope.method);

				if($rootScope.method=='Cancel'){
					console.log($rootScope.method);
				}
				else{
					//alert($rootScope.method);
					modal=$modal.open({
						templateUrl: "/modules/buyer/views/orders/send_order.html",
						controller: 'OrdersController',
						backdrop:'static'

					});
				}

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

			/* function Add New Order*/
			$scope.add_new_order=function(){

				modal=$modal.open({
					templateUrl: "/modules/buyer/views/orders/new_order.html",
					controller: 'OrdersController',
					backdrop:'static'

				});
			};
			$scope.saveOrder=function(){
				console.log($scope.newOrder);
				var url="http://azimuth.local/api/order/new",
					type='post',
					data=$scope.newOrder,
					header='multipart';

				RestFactory.request(url,type,data,header)
					.then(function(response){
						console.log(response);
					});
			};

			$scope.filesChanged = function(elm){
				$scope.newOrder.files=elm.files;
				$scope.$apply();
				//console.log($scope.newOrder);
			};




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



