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
                data,
                filter={};

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
                { name: "factoryName", title: "Factory"},
				{ name: "orderedTotal", title: 'Ordered total' },
				{ name: "paymentStatus", title: 'Payment status' },
				{ name: "createDate", title: 'Create date' },
				{ name: "deliveryDate", title: 'Production date' }
			];

                RestFactory.request(config.API.host + "order/load")
                    .then(function(response){
                        var data = [];

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
                    /*    console.log($scope.orders);*/

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
                    },
                    function(error){
                        console.log(error);
                    });


             //Loading factories
            RestFactory.request(config.API.host + "factory/load")
                .then(function(response){
					var factory = [];
					for( var i in response ){

						factory.push( { type:"factory", id: response[i].factory.id, name: response[i].factory.name } );
					}
                    $scope.Factory=factory;
                },
                function(error){
                    console.log(error);
                });

             //Loading statuses
            RestFactory.request(config.API.host + "status/load")
                .then(function(response){
					var statusByType = [];
					for( var i in response ){
						if( ! statusByType[response[i].type]) statusByType[response[i].type] = [];
						statusByType[response[i].type].push({ type: response[i].type, id: response[i].statusId, name: response[i].name });
					}
                    $scope.orderStatus = statusByType['order'];
					$scope.orderPaymentStatus = statusByType['orderPayment'];
                },
                function(error){
                    console.log(error);
                });

            /*
             * Table widget actions
             * */

            $scope.edit = function(){
                $location.path( '/buyer/orders/id/'+ $rootScope.row.id );
            };


            /*$scope.buttonAction=function(){

                //console.log($rootScope.row,$rootScope.method);

                if($rootScope.method=='Cancel'){

                    modalWindow=$modal.open({
                        templateUrl: "/app/views/new_product_create_confirm.html",
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

            };*/

            $scope.$watchCollection('resultData',function(newVal){

                    for(item in newVal){
                        var arr=[];

                        if($.isEmptyObject(newVal[item])){

                            delete filter[item];
                        }
                        else{
                            angular.forEach(newVal[item],function(value,key){


                                if(value.ticked ===true){

                                    arr.push(value.id);
                                    filter[item]=arr;
                                }

                            });
                        }
                    }
                    //console.log(filter);
                    if(!$.isEmptyObject(filter)){

                        url=config.API.host+"order/load/";

                        if(filter.order){

                            url+="status/"+filter.order.join()+"/";
                        }

                        if(filter.orderPayment){

                            url+="paymentStatus/"+filter.orderPayment.join()+"/";
                        }
                        if(filter.factory){

                            url+="factoryId/"+filter.factory.join()+"/";
                        }

                        console.log(url);


                        RestFactory.request(url)
                            .then(
                            function(response){
                                $scope.orders=response;
                            },
                            function(error){
                                console.log(error);
                            });
                    }
                    else{
                        $scope.orders=$scope.data;
                    }
            });

            $scope.addNewOrder = function () {

                var modalInstance = $modal.open({
                    templateUrl: '/modules/buyer/views/orders/new_order.html',
                    controller: 'OrderEditController',
                    size: 'sm',
                    resolve:{
                        factory:function(){
                            return $scope.Factory;
                        }
                    }
                });
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
            /* $scope.filesChanged = function(elm){
				console.log(elm.files);
                $scope.newOrder.files=elm.files;
                $scope.$apply();
            };*/

            /*$scope.$watch('files',function(newVal){
                //console.log(newVal);
                if(newVal){
                    $rootScope.uploadFiles=$scope.files;
                }
            });*/


}]);

app.controller("OrderEditController", function($scope,$rootScope,RestFactory,$location,$modalInstance,$modal,$http,factory,messageCenterService){

    $scope.Factory=factory;
    var fileinput;

    $scope.upload=function(){
        fileinput = document.getElementById("filesNewOrder");
        fileinput.click();

    };

    $scope.$watch('files',function(newVal){
        console.log("files",newVal);
        /*if(newVal){
            $rootScope.uploadFiles=$scope.files;
        }*/
    });

   // $scope.$watch('uploadFiles',function(newVal){
        //console.log("this",newVal);
        /* if($rootScope.uploadFiles){

            var i=1;
            var fd = new FormData();
            angular.forEach($rootScope.uploadFiles, function(file){
                fd.append('file'+i, file);
                i++;
            });
            fd.append('id',5);
            console.log(fd);

            var url = config.API.host + "order/loadfiles",
                id= 5;

                $http.post(url,fd,
                    {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    })
                    .success(function(data){
                        console.log(data);
                    });
        }*/
    //});

    $scope.saveOrder = function ( data ) {
        console.log(data,$scope.files);
			var fd = new FormData();
			angular.forEach($scope.files, function(file){
				console.log("this",file);
				fd.append('file', file);
			});

        var params = {
            'buyerId'       :   1,
            'factoryId'     :   data.factory.id,
            'type'          :   data.type.id,
            'currencyId'    :   5
            //,'amount'        :   data.amount
        };
        console.log(params);
            var url = config.API.host + "order/create";

             RestFactory.request(url,"POST",params)
                .then(function(response){
					console.log(response);
                    if(response=='null'){
                        messageCenterService.add('danger', 'Order is not created', {timeout: 3000});
                    }
                    else{
                        if(_.isObject(response)){
                           url = config.API.host + "order/loadfiles";
                            console.log(url);
                            fd.append("id",response.id);
                            console.log(fd);
                            $http.post(url,fd,
                                {
                                    transformRequest: angular.identity,
                                    headers: {'Content-Type': undefined}
                                })
                                .success(function(data){
                                    console.log(data);

                                })
                                .error(function(data,status){
                                    console.log(data,status);
                                })
                        }
                       /* console.log(response);
                        $rootScope.changeAlert=1;
                        $location.path( '/buyer/orders/id/'+ response.id );
                        $modalInstance.close(order);*/
                    }

                },
                function(error) {
                    console.log(error);
                    messageCenterService.add('danger', 'Order is not created', {timeout: 3000});

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
                    console.log(response);
                    $scope.order=response;
				});
            $scope.orderProducts=[];
            $scope.totalCount=0;
            $scope.totalPrice=0;
            RestFactory.request(config.API.host+"order/get-rows/id/"+id).then(
                function(response){

                    if(_.isArray(response)){
                        var url;

                        angular.forEach(response,function(value){
                            url=config.API.getproducts+'?params[tokien_id]=5f77e685beaa564fd3585738d65108c4&params[id]='+value.productId;

                            RestFactory.request(url).then(
                                function(data){
                                    var result=angular.fromJson(data.result);
                                    var key=_.keys(result.products);

                                    $scope.orderProducts.push(result.products[key]);
                                    console.log($scope.orderProducts);
                                    $scope.totalCount+=parseInt(result.products[key].sizes_count);
                                    $scope.totalPrice+=parseInt(result.products[key].price);

                                }
                            )
                        });

                    }
                }
            );
            $scope.imagePath=config.API.imagehost+'/files/factory/attachments/';
            $scope.showPayment=function(){
                $location.path('/buyer/payments/by-order/'+id);
            };
            $scope.tableHeader = [
                { name: "photo", title: 'Photo' },
                { name: "articul", title: 'Articul' },
                { name: "title", title: 'Title' },
                { name: "size", title: "Size"},
                { name: "count", title: 'Count' },
                { name: "price", title: 'Price' },
                { name: "subtotal", title: 'Subtotal' }

            ];
}]);