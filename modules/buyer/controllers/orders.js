var app = angular.module("modules.buyer.orders", [

]);

app.controller('OrderListController',

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

            var modalWindow,
                url,
                method,
                data;

            $rootScope.type=[
                {
                    name:"Moscow",
                    id:1
                },
                {
                    name:"Hong Kong",
                    id:2
                }
            ];

            $scope.newOrder={};

            /* Loading orders */
			$rootScope.documentTitle = "Orders";
			$scope.tableHeader = [
				{ name: "id", title: 'ID' },
				{ name: "type", title: 'Type' },
				{ name: "status", title: 'Status' },
				{ name: "orderedTotal", title: 'Ordered total' },
				{ name: "paymentStatus", title: 'Payment status' },
				{ name: "createDate", title: 'Create date' },
				{ name: "deliveryDate", title: 'Production date' }
			];
            RestFactory.request(config.API.host + "order/load")
                .then(function(response){
					var data = [];
					//console.log(response);
					//data.header = $scope.paymentsHeader;

					for( var i in response ){
						data[i] = {};
						for( var n in $scope.tableHeader ) {
							var key = $scope.tableHeader[n].name;
							if( response[i][key]  ) {
								data[i][key] = response[i][key]
							}else{
								data[i][key] = '';
							}
						}
					}
					$scope.data = data;
                    $scope.orders = $scope.data;

                    $scope.buttons = [
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

            /* Loading factories */
            RestFactory.request(config.API.host + "factory/load")
                .then(function(response){
					var factory = [];
					for( var i in response ){
						factory.push( { id: response[i].factory.id, name: response[i].factory.name } );
					}
                    $scope.Factory=factory;
                });

            /* Loading statuses */
            RestFactory.request(config.API.host + "status/load")
                .then(function(response){
					var statusByType = [];
					for( var i in response ){
						if( ! statusByType[response[i].type]) statusByType[response[i].type] = [];
						statusByType[response[i].type].push({ statusId: response[i].statusId, name: response[i].name });
					}
                    $scope.orderStatus = statusByType['order'];
					$scope.orderPaymentStatus = statusByType['orderPayment'];
                });

            /*
             * Table widget actions
             * */

            $scope.edit = function(){
                $location.path( '/buyer/orders/id/'+ $rootScope.row.id );
            };


            $scope.buttonAction=function(){

                //console.log($rootScope.row,$rootScope.method);

                if($rootScope.method=='Cancel'){

                    modalWindow=$modal.open({
                        templateUrl: "/app/views/ask.html",
                        controller: 'OrdersListController',
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

                    }

                });
                //console.log(filter);

                try{
                    if(newVal.length==0){

                        //$scope.orders = $scope.dataOrders;
                    }
                }
                catch(e){

                }

            });
            $scope.addNewOrder = function () {
                $scope.items = ['item1', 'item2', 'item3'];

                var modalInstance = $modal.open({
                    templateUrl: '/modules/buyer/views/orders/new_order.html',
                    controller: 'OrderEditController',
                    size: 'sm'
                });

               /* modalInstance.result.then(function (obj) {
                    console.log(obj);
                        url="http://azimuth.local/api/order/new",
                        method='post',
                        data=obj,
                        header='multipart';

                    RestFactory.request(url,method,data,header)
                        .then(function(response){
                            console.log(response);
                            $rootScope.changeAlert=1;
                        },
                        function(error) {
                            console.log(error);
                            $rootScope.changeAlert=0;
                        });
                });*/
            };

            /*function add new factory*/
            $scope.new_factory=function(){
                modalWindow=$modal.open({
                    templateUrl: "/modules/buyer/views/orders/new_factory.html",
                    controller: 'OrderListController',
                    backdrop:'static'
                });
                modalWindow.result.then(function(obj){
                    console.log(obj);
                })
            };
            $scope.filesChanged = function(elm){
				//console.log(elm.files);
                $scope.newOrder.files=elm.files;
                $scope.$apply();
            };





}]);

app.controller("OrderEditController", function($scope,$rootScope,RestFactory,$location,$modalInstance,$modal){

    $scope.saveOrder = function ( data ) {
			var fd = new FormData();
			angular.forEach(data.files, function(file){
				console.log(file);
				fd.append('file', file);
			});

            var order = {
				type: data.type.id,
				buyerid: 328,
				factoryid: data.factory.idgit
			};

            var url = config.API.host + "order/create",
                method='post',
                data=order,
				contentType='multipart';

            RestFactory.request(url,method,data, contentType)
                .then(function(response){
					console.log(response);
                    if(response=='null'){
                        $modal.open({
                            templateUrl: '/app/views/error.html',
                            controller: 'BsAlertCtrl',
                            size: 'lg'
                        });
                    }
                    else{
                        console.log(response);
                        $rootScope.changeAlert=1;
                        $location.path( '/buyer/orders/id/'+ response.id );
                        $modalInstance.close(order);
                    }

                },
                function(error) {
                    console.log(error);
                    $rootScope.changeAlert = 2;

                    $modal.open({
                        templateUrl: '/app/views/error.html',
                        controller: 'BsAlertCtrl',
                        size: 'lg'
                    });

                });


    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});

app.controller("OrderController",
    [
        "$scope",
        "$rootScope",
        "$location",
        "$route",
		"RestFactory",

        function($scope,$rootScope,$location, $route, RestFactory){

            $scope.$route = $route;
			var id = $route.current.params.orderId;

			$rootScope.documentTitle = 'Order #'+ id;

            $scope.back=function(){
                $location.path('/buyer/orders');
            };

			RestFactory.request(config.API.host + "order/get/id/"+id)
				.then(function(response){
					$scope.order = response;
					console.log( $scope.order );
				});

}]);