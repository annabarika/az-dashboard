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
		"messageCenterService",
		"AuthFactory",

		function ($scope, $rootScope, $location, $route, PaymentService,$modal,messageCenterService,AuthFactory){

			$scope.$route = $route;
			$scope.$location = $location;
			var filter={},
				url;

			$scope.userType=JSON.parse(AuthFactory.getUser('type'));

			$scope.userCO=JSON.parse(AuthFactory.getUser('cashierOffice'));


			console.log($scope.userType,$scope.userCO);


			/* Getting payments */
			$rootScope.documentTitle = "Payments";
			$scope.tableHeader = [
				{ name: "id"			,	title: 'ID' },
				{ name: "orderId"		, 	title: 'Order' },
				{ name: "factory"		, 	title: 'Factory' },
				{ name: "date"			, 	title: 'Payment date' },
				{ name: "method"		, 	title: 'Payment method'},
				{ name:"cashierOfficeId",	title:"CashierOffice"},
				{ name: "amount"		, 	title: 'Payment' },
				{ name: "refund"		, 	title: 'Refund' }
			];

			function getPayments(){
				PaymentService.getPayments().then(

					function(response){

						if(_.isArray(response)){

							$scope.data = PaymentService.parseData(response,$scope.tableHeader);
							$scope.payments=$scope.data;

							console.log(response);


						}
					}
				);
			}
			getPayments();

			PaymentService.getStatuses().then(
				function(response){
					$scope.status=response;
				}
			);

			PaymentService. getCashierOfficies().then(
				function(response){

					if(_.isString(response)){
						messageCenterService.add("danger","Error while loading offices",{timeout:3000});
						return
					}
					$scope.cashierOfficies=response;
					console.log($scope.cashierOfficies);
					angular.forEach($scope.cashierOfficies,function(value){
						if(value.id==$scope.userCO){
							$scope.userCO=value;
							console.log($scope.userCO);
							return;
						}
					})
				}
			);

			$scope.paymentType=[
				{name:'payment'},
				{name:'refund'}
			];

			/**
			 * filters for data
			 */
			$scope.$watchCollection('resultData',function(newVal){

				for(item in newVal){
					var arr=[];

					if($.isEmptyObject(newVal[item])){

						delete filter[item];
					}
					else{
						angular.forEach(newVal[item],function(value,key){


							if(value.ticked ===true){
								(value.statusId)? arr.push(value.statusId):
									(value.id)?arr.push(value.id):
										arr.push(value.name);
								filter[item]=arr;
							}

						});
					}
				}

				if(!$.isEmptyObject(filter)){
					console.log(filter);

					url=PaymentService.parseFilters(filter);

					PaymentService.getFilteredData(url).then(
						function(response){
							//console.log(response);
							if(_.isArray(response)){
								$scope.payments=PaymentService.parseData(response);
							}else{
								messageCenterService.add('danger', 'Filter does not work', {timeout: 3000});
							}
						}
					);
				}
				else{
					$scope.payments=$scope.data;
				}
			});
			/**
			 * Add new payment
			 */
			$scope.addNewPayment=function(){
				var modalInstance=$modal.open({
					templateUrl:"/modules/buyer/views/payments/new_payment.html",
					controller:function($scope,PaymentService,cashierOffice){

						$scope.cashierOffice=cashierOffice;
						/**
						 * get Orders
						 */
						PaymentService.getOrders().then(
							function(response){
								$scope.orders=response;
							}
						);
						/**
						 *
						 * @type {{name: string}[]}
						 */
						$scope.paymentMethod=[
							{name:"cash"},
							{name:"bank"}
						];
						/**
						 *
						 * @param payment
						 */
						$scope.create=function(payment){

							if(_.isUndefined(payment)){
								messageCenterService.add('danger', 'Not entered fields', {timeout: 3000});
								return;
							}
							if(_.isNull(payment.amount)||_.isUndefined(payment.amount)||payment.amount<0){
								messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
								return;
							}
							if(_.isNull(payment.method)|| _.isUndefined(payment.method)){
								messageCenterService.add('danger', 'Not choose method', {timeout: 3000});
								return;
							}
							else{
								modalInstance.close(payment);
							}




							modalInstance.close(payment)
						}
					},
					backdrop:'static',
					size:"sm",
					resolve:{
						cashierOffice:function(){
							return $scope.userCO;
						}
					}
				});
				modalInstance.result.then(
					function(payment){
						PaymentService.createNewPayment(payment).then(
							function(response){
								if(_.isObject(response)){
									messageCenterService.add('success', 'Payment created', {timeout: 3000});
									getPayments();
								}
								else{
									messageCenterService.add('danger', 'Payment not created', {timeout: 3000});
								}
							}
						)
					}
				)
			};
			/**
			 * Add new cashier office
			 */
			$scope.addNewCashOffice=function(){

				var modalInstance=$modal.open({
					templateUrl:"/modules/buyer/views/payments/new_cash_office.html",
					controller:function($scope,PaymentService){
						/**
						 * get Types
						 */
						PaymentService.getOrderType().then(
						function(response){
							$scope.type=response;
						});
						/**
						 * get Currency
						 */
						PaymentService.getCurrency().then(
							function(response){
								$scope.currency=response;
							}
						);
						/**
						 *
						 * @param obj
						 */
						$scope.create=function(obj){
							if(_.isUndefined(obj)){
								messageCenterService.add('danger', 'Not entered name', {timeout: 3000});
								return;
							}
							if(_.isUndefined(obj.name)){
								messageCenterService.add('danger', 'Not entered name', {timeout: 3000});
								return;
							}
							if(_.isNull(obj.type)|| _.isUndefined(obj.type)){
								messageCenterService.add('danger', 'Not choose type', {timeout: 3000});
								return;
							}
							else{
								modalInstance.close(obj);
							}
						}
					},
					backdrop:'static',
					size:"sm"
				});
				modalInstance.result.then(
					function(obj){
						console.log(obj);
						PaymentService.createCashierOffice(obj).then(
							function(response){
								if(_.isObject(response)){
									messageCenterService.add('success', 'Cashier Office created', {timeout: 3000});
								}else{
									messageCenterService.add('danger', 'Cashier Office is not created:'+response , {timeout: 3000});
								}

							},function(error){
								messageCenterService.add('danger', 'Error'+error, {timeout: 3000});
							}
						)
					}
				)
			};


			/**
			 *	Location to Payment orders
			 */
			$scope.edit = function(){
				console.log($rootScope.row);
				$location.path( '/buyer/payments/payment_order/'+ $rootScope.row.orderId);
			};
		}]);

app.controller("PaymentOrderController",[
	'$scope',
	'$rootScope',
	"$modal",
	"$location",
	"$route",
	"$routeParams",
	"PaymentService",
	"messageCenterService",

	function ($scope, $rootScope, $modal, $location, $route,$routeParams,PaymentService,messageCenterService){
		console.log($routeParams);
		$scope.orderId=$routeParams.id;

		$rootScope.documentTitle="Payments for order #"+$scope.orderId;

		$scope.tableHeader = [
			{ name: "id"			,	title: 'ID' },
			{ name: "factory"		, 	title: 'Factory' },
			{ name: "date"			, 	title: 'Payment date' },
			{ name: "method"		, 	title: 'Payment method'},
			{ name:"cashierOfficeId",	title:"CashierOffice"},
			{ name: "amount"		, 	title: 'Payment' },
			{ name: "refund"		, 	title: 'Refund' }
		];

		PaymentService.getOrderPayments($scope.orderId).then(
			function(response){
				console.log("orderpayment",response);
				if(_.isArray(response)){
					$scope.data = PaymentService.parseData(response,$scope.tableHeader);
					$scope.orderPayments=$scope.data;
				}
				else{
					messageCenterService.add("danger","Error: "+response,{timeout:3000});
				}
			}
		);


		$scope.back=function(){
			$location.path("buyer/payments")
		}


	}]);