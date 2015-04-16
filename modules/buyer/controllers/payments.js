var app = angular.module("modules.buyer.payments", []);

app.controller('PaymentListController', ['$scope','$rootScope','$location','$route','PaymentService','$modal','messageCenterService',
		function ($scope, $rootScope, $location, $route, PaymentService,$modal,messageCenterService) {

			$scope.$route = $route;
			$scope.$location = $location;
			var filter = {},
				url, date;

            // Get authorized user
			$rootScope.user = JSON.parse(localStorage['user']);
			$scope.userCO = $rootScope.user.settings.cashierOffice;

			$rootScope.documentTitle = "Payments";
			$scope.tableHeader = [
				{ name: "documentId"		, 	title: 'Document' },
				{ name: "factory"			, 	title: 'Factory' },
				{ name: "date"				, 	title: 'Payment date' },
				{ name: "method"			, 	title: 'Payment method'},
                { name: "cashierOfficeId"	,	title: "CashierOffice"},
				{ name: "amount"			, 	title: 'Amount' },
				{ name: "refund"			, 	title: 'Refund' }
			];

            /**
             * Collect all payments
             */
			getPayments = function(date) {

                var paymentsDraft = [], paymentsPaid = [];

				// Get draft Order payments
				PaymentService.getPayments('order', 0, date).then(function(response) {
						if(_.isArray(response)){
                            paymentsDraft = response;

                            // Get draft Cargo payments
                            PaymentService.getPayments('cargo', 0, date).then(function(response) {
                                    if(_.isArray(response)){
                                        paymentsDraft = response.concat(paymentsDraft);

                                        // Get draft Other payments
                                        PaymentService.getPayments('other', 0, date).then(function(response) {
                                                if(_.isArray(response)){
                                                    paymentsDraft = response.concat(paymentsDraft);
                                                    $scope.draftPayments = paymentsDraft;
                                                }
                                            }
                                        );
                                    }
                                }
                            );
						}
					}
				);

                // Get paid Order Payments
                PaymentService.getPayments('order', 1, date).then(function(response) {
                        if(_.isArray(response)){
                            paymentsPaid = PaymentService.resolvePaymentData(response);

                            // Get paid Cargo payments
                            PaymentService.getPayments('cargo', 1, date).then(function(response) {
                                    if(_.isArray(response)){
                                        paymentsPaid = PaymentService.resolvePaymentData(response).concat(paymentsPaid);

                                        // Get paid Other payments
                                        PaymentService.getPayments('other', 1, date).then(function(response) {
                                                if(_.isArray(response)){
                                                    paymentsPaid = PaymentService.resolvePaymentData(response).concat(paymentsPaid);

                                                    $scope.paidSummary = PaymentService.calculatePaidRows(paymentsPaid);
                                                    $scope.paidPayments = paymentsPaid;
                                                }
                                            }
                                        );
                                    }
                                }
                            );
                        }
                    }
                );
			};

            // Show all collected payments
            setTimeout(getPayments(), 1000);

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

                var filter = PaymentService.parseFilters(filter);

                if(filter.hasOwnProperty('date')) {
                    getPayments(filter.date);
                }
			};

			/**
			 * Add new payment
			 */
			$scope.addNewPayment=function(){
				var modalInstance=$modal.open({
					templateUrl:"/modules/buyer/views/payments/new_payment.html",
					controller:function($scope,PaymentService,cashierOffice,cashierId){

						$scope.cashierOffice=cashierOffice;
						$scope.cashierId=cashierId;
                        $scope.filterProperty=['id'];

						/**
						 * Get Orders for autocomplete
						 */
						PaymentService.getOrders().then(function(response){
								$scope.orders = response;
							}
						);

                        /**
                         * Get Cargo for autocomplete
                         */
                        PaymentService.getCargo().then(function(response){
                                var cargo = [];
                                if(!_.isEmpty(response)) {
                                    response.forEach(function(items) {
                                        cargo.push(items.cargo);
                                    });
                                }
                                $scope.cargo = cargo;
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
                            {name:"cash",value:'cash'},
                            {name:"bank",value:'bank'}
                        ];
						$scope.columnHeaders=[
							{name  : "id"}
						];
						/**
						 *
						 * @param payment
						 */
						$scope.create=function(payment){
							//console.log(payment);
							if(_.isUndefined(payment)){
								messageCenterService.add('danger', 'Not entered fields', {timeout: 3000});
								return;
							}
							if(_.isNull(payment.amount)||_.isUndefined(payment.amount)||payment.amount<0){
								messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
								return;
							}
							if(_.isNull(payment.type)|| _.isUndefined(payment.type)){
								messageCenterService.add('danger', 'Not choose type', {timeout: 3000});
								return;
							}
                            if(_.isNull(payment.method)|| _.isUndefined(payment.method)){
                                messageCenterService.add('danger', 'Not choose method', {timeout: 3000});
                                return;
                            }
							if(_.isNull(payment.note)|| _.isUndefined(payment.note)){
								messageCenterService.add('danger', 'Please,enter the note', {timeout: 3000});
								return;
							}
							else{
								modalInstance.close(payment);
							}
							//modalInstance.close(payment)
						}
					},
					backdrop:'static',
					size:"sm",
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
			{ name: "id"				,	title: 'ID' },
			{ name: "factory"			, 	title: 'Factory' },
			{ name: "date"				, 	title: 'Payment date' },
			{ name: "method"			, 	title: 'Payment method'},
			{ name:"cashierOfficeName"	,	title:"CashierOffice"},
			{ name: "amount"			, 	title: 'Payment' },
			{ name: "refund"			, 	title: 'Refund' }
		];
		/**
		 * get Order Payments
		 */
		PaymentService.getOrderPayments($scope.orderId).then(
			function(response){
				console.log("orderpayment",response);
				if(_.isArray(response)){
					$scope.data = PaymentService.resolvePaymentData(response,$scope.tableHeader);
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