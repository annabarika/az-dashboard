'use strict';
var app = angular.module("modules.buyer.payments", []);

app.controller('PaymentListController',
	[
		'$scope',
		'$rootScope',
		'$location',
		'$route',
		'PaymentService',
		'$modal',
		'messageCenterService',

		function ($scope, $rootScope, $location, $route, PaymentService,$modal,messageCenterService) {

			$scope.getDate=function(){
				var startDate,
					currentDate,
					endDate;

				startDate=moment().date(1).format('YYYY-MM-DD');
				endDate=moment().format('YYYY-MM-DD');
				currentDate=PaymentService.getDate();
				if(!startDate==currentDate) {
					PaymentService.saveDate(startDate);
					currentDate=startDate;
				}
				// Show all collected payments
				setTimeout(getPayments({'start':currentDate,'end':endDate}),80);

			};
			$scope.getDate();

			$scope.$route = $route;
			$scope.$location = $location;
			var filter = {},
				url, date;

            // Get authorized user
			$rootScope.user = JSON.parse(localStorage['user']);
			$scope.userCO = $rootScope.user.settings.cashierOffice;

			$rootScope.documentTitle = "Payments";
			$scope.tableHeader = [
                { name: "date"				, 	title: 'Payment date' },
                { name: "documentId"		, 	title: 'Orders' },
				{ name: "factoryName"		, 	title: 'Factory name' },
				{ name: "method"			, 	title: 'Payment method'},
				{ name: "amount"			, 	title: 'Credit' },
				{ name: "refund"			, 	title: 'Debit' }
			];

            /**
             * Collect all payments
             */
			 function getPayments(date){

				// Get draft payments
				PaymentService.getPayments(0, date).then(function(response) {
						if(_.isArray(response)){
							console.log(response);
                            $scope.draftPayments = PaymentService.resolvePaymentData(response,$rootScope.factories);
							console.log($scope.draftPayments);
						}
					}
				);
                // Get paid Payments
                PaymentService.getPayments(1, date).then(function(response) {
                        if(_.isArray(response)){
							//console.log($rootScope.factories);
                            $scope.paidPayments = PaymentService.resolvePaymentData(response,$rootScope.factories);
                            $scope.paidSummary = PaymentService.calculatePaidRows($scope.paidPayments);
							//console.log($scope.paidPayments);
                        }
                    }
                );
			};



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

					$scope.payments=PaymentService.parseCashierOffice($scope.payments,$scope.cashierOfficies);


					angular.forEach($scope.cashierOfficies,function(value){
						if(value.id==$scope.userCO){
							$scope.userCO=value;
							return;
						}
					})
				}
			);

            /**
             * Load by filters
             *
             * @param filter
             */
            $scope.filteredPayments = function(filter) {
				console.log(filter);
                var filter = PaymentService.parseFilters(filter);

                if(filter.hasOwnProperty('date')) {
                    getPayments(filter.date);
                }
			};

			/**
			 * Add new payment
			 */
			/*$scope.addNewPayment=function(type){
				var modalInstance=$modal.open({
					templateUrl:"/modules/buyer/views/payments/new_payment.html",
					controller:function($scope,PaymentService,cashierOffice,cashierId){

						$scope.cashierOffice=cashierOffice;
						$scope.cashierId=cashierId;
                        $scope.filterProperty=['id'];

						*//**
						 * Get Orders for autocomplete
						 *//*
						PaymentService.getOrders().then(function(response){
								$scope.orders = response;
								$scope.orders.map(function(i){
									i.createDate=moment(i.createDate).format("L");
									if(i.deliveryDate)
									i.deliveryDate=moment(i.deliveryDate).format("L");
									return i;
								});
								console.log(response);
							}
						);

                        $scope.orderType=[
                            {name:"income",value:'refund'},
                            {name:"outcome",value:'payment'}
                        ];
                        $scope.cargoType = [
                            {name:"income",value:'refund'},
                            {name:"outcome",value:'payment'}
                        ];
						$scope.otherType = [
							{name:"payment to factory",value:'payment'},
							{name:"refund from factory",value:'refund'}
						];


                        $scope.paymentMethod = [
                            //{name:"cash",value:'cash'},
                            {name:"bank",value:'bank'}
                        ];
						$scope.columnHeaders=[
							{name  : "id",			title:"Order"},
							{name  : "createDate",	title:"CreateDate"},
							{name  : "deliveryDate",title:"deliveryDate"},
							{name  : "orderedTotal",title:"OrderedTotal"},
							{name  : "paidTotal",	title:"paidTotal"}
						];
						*//**
						 *
						 * @param payment
						 *//*
						$scope.create=function(payment){
							if(_.isUndefined(payment)){
								messageCenterService.add('danger', 'Not entered fields', {timeout: 3000});
								return;
							}
							if(_.isNull(payment.amount)||_.isUndefined(payment.amount)||payment.amount<0){
								messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
								return;
							}

							if(_.isNull(payment.note)|| _.isUndefined(payment.note)){
								messageCenterService.add('danger', 'Please,enter the note', {timeout: 3000});
								return;
							}
							else{
								modalInstance.close(payment);
							}
						}
					},
					backdrop:'static',
					size:"lg",
					resolve:{
						cashierOffice:function(){
							return $scope.userCO;
						},
						cashierId:function(){
							return $rootScope.user.id;
						}

					}
				});
				modalInstance.result.then(
					function(payment){
						PaymentService.createPayment(payment,$rootScope.user).then(
							function(response){

								if(_.isObject(response) && response.hasOwnProperty('id')) {
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
			};*/

			$scope.addNewPayment=function(type){
				var modalInstance=$modal.open({
					templateUrl:"/modules/buyer/views/payments/new_payment.html",
					controller:function($scope,PaymentService,cashierOffice,cashierId,type){
						$scope.payment={};
						$scope.payment.type=type;

						if($scope.payment.type=='payment'){
							$scope.title='Make new credit payment';
							$scope.paymentFlag='payment';
						}
						else{
							$scope.title='Make new debit payment';
							$scope.paymentFlag='refund';
						}
						/*$scope.$watch('payment.order',function(val){
							console.log(val);
						});*/


						$scope.cashierOffice=cashierOffice;
						$scope.cashierId=cashierId;
						$scope.filterProperty=['id'];
						$scope.columnHeaders=[
							{name  : "id",			title:"Order"},
							{name  : "createDate",	title:"CreateDate"},
							{name  : "deliveryDate",title:"deliveryDate"},
							{name  : "orderedTotal",title:"OrderedTotal"},
							{name  : "paidTotal",	title:"paidTotal"}
						];
						PaymentService.getOrders().then(function(response){
								$scope.orders = response;
								$scope.orders.map(function(i){
									i.createDate=moment(i.createDate).format("L");
									if(i.deliveryDate)
										i.deliveryDate=moment(i.deliveryDate).format("L");
									return i;
								});
							}
						);
						/**
						 *
						 * @param payment
						 */
						$scope.create=function(payment){
							console.log(payment);
							if(_.isUndefined(payment)){
								messageCenterService.add('danger', 'Not entered fields', {timeout: 3000});
								return;
							}
							if(_.isNull(payment.amount)||_.isUndefined(payment.amount)||payment.amount<0){
								messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
								return;
							}
							if(payment.method!='other'){
								if(!_.has(payment,'order') || payment.order==""){
									messageCenterService.add('danger', 'Not choose order', {timeout: 3000});
									return;
								}
							}
							if(_.isNull(payment.note)|| _.isUndefined(payment.note)){
								messageCenterService.add('danger', 'Please,enter the note', {timeout: 3000});
								return;
							}
							modalInstance.close(payment)
						}
					},
					backdrop:"static",
					size:'lg',
					resolve:{
						cashierOffice:function(){
							return $scope.userCO;
						},
						cashierId:function(){
							return $rootScope.user.id;
						},
						type:function(){
							return type;
						}
					}
				});
				modalInstance.result.then(
					function(payment){
						PaymentService.createPayment(payment,$rootScope.user).then(
							function(response){

								if(_.isObject(response) && response.hasOwnProperty('id')) {
									messageCenterService.add('success', 'Payment created', {timeout: 3000});
									getPayments();
								}
								else{
									messageCenterService.add('danger', 'Payment not created', {timeout: 3000});
								}
							}
						)
					})
				};

			/**
			 * Add new cashier office
			 */
			/*$scope.addNewCashOffice=function(){

				var modalInstance=$modal.open({
					templateUrl:"/modules/buyer/views/payments/new_cash_office.html",
					controller:function($scope,PaymentService){
						*//**
						 * get Types
						 *//*
						PaymentService.getOrderType().then(
						function(response){
							$scope.type=response;
						});
						*//**
						 * get Currency
						 *//*
						PaymentService.getCurrency().then(
							function(response){
								$scope.currency=response;
							}
						);
						*//**
						 *
						 * @param obj
						 *//*
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
*/

			/**
			 *	Location to Payment orders
			 */
			$scope.edit = function(item){
				if(item){
					console.log(item);
					$location.path( '/buyer/payments/id/'+ item.id);
				}
				else{
					console.log($rootScope.row);
					$location.path( '/buyer/payments/payment_order/'+ $rootScope.row.documentId);
				}

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
		/**
		 * orderId
		 */
		$scope.orderId=$routeParams.id;
		/**
		 *
		 * @type {string}
		 */
		$rootScope.documentTitle="Payments for order #"+$scope.orderId;
		/**
		 *
		 * @type {{name: string, title: string}[]}
		 */
		$scope.tableHeader = [
			{ name: "documentId"		,	title: 'ID' },
			{ name: "factoryName"		, 	title: 'Factory' },
			{ name: "date"				, 	title: 'Payment date' },
			{ name: "method"			, 	title: 'Payment method'},
			{ name:"cashierOfficeName"	,	title:"CashierOffice"},
			{ name: "amount"			, 	title: 'Credit' },
			{ name: "refund"			, 	title: 'Debit' }
		];
		$scope.tableHeader = [
			{ name: "date"				, 	title: 'Payment date' },
			{ name: "documentId"		, 	title: 'Orders' },
			{ name: "factoryName"		, 	title: 'Factory name' },
			{ name: "method"			, 	title: 'Payment method'},
			{ name: "amount"			, 	title: 'Credit' },
			{ name: "refund"			, 	title: 'Debit' }
		];
		/**
		 * get Order Payments
		 */
		PaymentService.getOrderPayments($scope.orderId).then(
			function(response){
				console.log("orderpayment",response);
				if(_.isArray(response)){
					$scope.data = PaymentService.resolvePaymentData(response,$rootScope.factories);
					$scope.orderPayments=$scope.data;
				}
				else{
					messageCenterService.add("danger","Error: "+response,{timeout:3000});
				}
			}
		);
		/**
		 * get Cashier Officeis
		 */
		PaymentService. getCashierOfficies().then(
			function(response){

				if(_.isString(response)){
					messageCenterService.add("danger","Error while loading offices",{timeout:3000});
					return
				}
				$scope.cashierOfficies=response;
				//console.log($scope.cashierOfficies);
				$scope.orderPayments=PaymentService.parseCashierOffice($scope.orderPayments,$scope.cashierOfficies);
				//console.log("this",$scope.orderPayments);
			}
		);


		/**
		 * return to payments index page
		 */
		$scope.back=function(){
			$location.path("buyer/payments")
		}
	}]);
app.controller('PaymentCartController',
	[
		"$scope",
		"$rootScope",
		"PaymentService",
		"$location",
		"$route",
		"messageCenterService",

		function($scope,$rootScope,PaymentService,$location,$route,messageCenterService){
			/**
			 * document title
			 * @type {string}
			 */
			$rootScope.documentTitle='Payment cart: payment #'+$route.current.params.id;
			/**
			 * get current payment
			 */
			PaymentService.getCurrentPayment($route.current.params.id).then(function(response){
				if(response){
					/*console.log(response);*/
					$scope.payment= _.first(response);
				}
			});
			/**
			 * confirm or canceled payment
			 */
			$scope.upload=function(){
				var now =moment().format("YYYY-MM-DD HH:mm");
				$scope.payment.payment.paymentDate=now;
				PaymentService.updatePayment($scope.payment.payment).then(function(response){
					if(_.has(response,'status')){
						if(response.status==1){
							messageCenterService.add('success','Payment paid',{timeout:3000});
							$location.path("buyer/payments");
						}
						if(response.status==2){
							messageCenterService.add('success','Payment canceled',{timeout:3000});
							$location.path("buyer/payments");
						}
						else{
							messageCenterService.add('danger','Payment is not update: '+response,{timeout:3000});
						}
					}
				})
			};
		}
	]);