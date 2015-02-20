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
			controller:"CurrentOrderController"
		}
	)
		.when('/buyer/bestsellers',
		{
			templateUrl:"/modules/buyer/views/bestsellers/index.html",
			controller:"BestsController"
		}
	);
});

/*
app.run( function($rootScope, $location) {

	$rootScope.$on( "$routeChangeStart", function() {
		if ( $rootScope.row == null ) {

				$location.path('/buyer/orders');

		}})
	});
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
		"$http",

		function ($scope, $rootScope, $modal, $location, $route, RestFactory,$http){

			$scope.$route = $route;
			$scope.$location = $location;
			var modalWindow,
				url,
				method,
				data,
				header;
			$rootScope.msk=[
				{
					name:"type1"
				},
				{
					name:"type2"
				}
			];
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
			RestFactory.request("/data/factory.json")
				.then(function(response){

					$scope.Factory=response;
				});
			/*get statuses*/
			RestFactory.request("/data/orderstatus.json")
				.then(function(response){

					$scope.Status=response;
				});
			/*get payment*/
			RestFactory.request("/data/payment.json")
				.then(function(response){

					$scope.Payment=response;
				});

			$scope.modalContent="Test Content for modal window";
			$scope.modalTitle="Some Title";

			/*
			 * Table widget actions
			 * */

			$scope.edit = function(){
				$location.path( '/buyer/orders/id/'+ $rootScope.row.id );
				//console.log($rootScope.row);
			};


			$scope.buttonAction=function(){

				//console.log($rootScope.row,$rootScope.method);

				if($rootScope.method=='Cancel'){

					modalWindow=$modal.open({
						templateUrl: "/app/views/ask.html",
						controller: 'OrdersController',
						backdrop:'static'
					});
					modalWindow.result.then(function(answer){
						if(answer){
							//console.log('del');
							url="",//url
							method='post',
							data=$rootScope.row;
							RestFactory.request(url,method,data)
								.then(function(response){
									console.log(response);
									$rootScope.changeAlert=1;
									//update $scope.orders: $http?,$scope.$apply($digest) or array.splice
								},
								function(error){
									console.log(error);
									$rootScope.changeAlert=0;
								});
						}
					});
				}
				else{
					modalWindow=$modal.open({
						templateUrl: "/modules/buyer/views/orders/send_order.html",
						controller: 'OrdersController',
						backdrop:'static'

					});
				}

			};


			/*get selected items for factory  */


			$scope.$watch('resultData',function(newVal){
				var filter={},
					arr=[];

				angular.forEach( newVal, function( value, key ) {

					if ( value.ticked === true ) {

						filter[value.name]=value;

						/*RestFactory.request("/mock/orderfilter.json?"+value.name)

							.then(function(response){

								for(var i=0; i<response[value.name].length;i++){
									arr.push(response[value.name][i]);
								}
								$scope.orders=arr;
							});*/

					}

				});
				 //  console.log(filter);

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


				modalWindow=$modal.open({
					templateUrl: "/modules/buyer/views/orders/new_order.html",
					controller: 'OrdersController',
					backdrop:'static'

				});
				modalWindow.result.then(function(obj){
						console.log("test",obj);
						//url="http://lex.b.compass/order/loadfiles/",
						url="http://localhost:7888/api/order/loadfiles",
						method='POST',
						data=obj;
						header='multipart';


					/*$.get(url, {}, function(response) {
						console.log(response);
					});*/

					/*	$http.get(url)
							.success(function(data){
								console.log(data)
							})
							.error(function(data,status){
								console.log(data,status);
							});*/

					RestFactory.request(url,method,data)
						.then(function(response){
							console.log(response);
							$rootScope.changeAlert=1;
						},
						function(error) {
							console.log(error);
							$rootScope.changeAlert=0;
						});
				});

			};

			/*function add new factory*/
			$scope.new_factory=function(){
				modalWindow=$modal.open({
					templateUrl: "/modules/buyer/views/orders/new_factory.html",
					controller: 'OrdersController',
					backdrop:'static'
				});
				modalWindow.result.then(function(obj){
					console.log(obj);
				})
			};

			$scope.filesChanged = function(elm){
				$scope.newOrder.files=elm.files;
				$scope.$apply();
			};





		}]);

app.controller("CurrentOrderController",
	[
		"$scope",
		"$rootScope",
		"$location",

	function($scope,$rootScope,$location){

	$scope.back=function(){
		$location.path('/buyer/orders');
	};

	$scope.$watch('order',function(val,old){
		console.log(val.type,old.type);
	});

	$scope.order={
		factory:$rootScope.row.factory,
		ordered_total:300,
		paid_total:200,
		createDate:$rootScope.row.createDate
	}




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



