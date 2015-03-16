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
                        console.log($scope.orders);

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
                    console.log(response);
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


            $scope.buttonAction=function(){

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

            };

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
                    size: 'sm'
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

            $scope.$watch('files',function(newVal){
                //console.log(newVal);
                if(newVal){
                    $rootScope.uploadFiles=$scope.files;
                }
            });


}]);

app.controller("OrderEditController", function($scope,$rootScope,RestFactory,$location,$modalInstance,$modal,$http){

    $scope.upload=function(){
        fileinput = document.getElementById("FilesNewOrder");
        fileinput.click();
    };

    $scope.$watch('uploadFiles',function(){
        //console.log("this",newVal,oldVal);
         if($rootScope.uploadFiles){

            var i=1;
            var fd = new FormData();
            angular.forEach($rootScope.uploadFiles, function(file){
                fd.append('file'+i, file);
                i++;
            });
            fd.append('id',5);
            console.log(fd);

            var url = config.API.host + "order/loadfiles",
           // var url = "http://lex.b.compass/order/loadfiles",
                id= 5,
                data={
                    id:id,
                    jpg:fd[0],
                    pdf:fd[1]
                },
                method="POST";

            RestFactory.request(url,method,fd,"multipart")
                .then(function(response){
                    console.log(response);
                },
                function(error){
                    console.log(error);
                });


               // $scope.upload($rootScope.files);
               /* $http.post(url,fd,
                    {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    })
                    .success(function(data){
                        console.log(data);
                    });*/
        }


    });

   /* $scope.upload = function (files) {
        var url = config.API.host + "order/loadfiles";
        if (files && files.length) {
            for (var i = 0; i < files.length; i++) {
                var file = files[i];
                $upload.upload({
                    url: url,
                    fields: {
                        'id': 5
                    },
                    file: file
                }).progress(function (evt) {
                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                    console.log('progress: ' + progressPercentage + '% ' +
                    evt.config.file.name);
                }).success(function (data, status, headers, config) {
                    console.log('file ' + config.file.name + 'uploaded. Response: ' +
                    JSON.stringify(data));
                });
            }
        }
    };*/





    $scope.saveOrder = function ( data ) {
        console.log(data);
			//var fd = new FormData();
			//angular.forEach(data.files, function(file){
			//	console.log("this",file);
			//	fd.append('file', file);
			//});

            var order = {
				type: data.type.id,
				buyerid: 328,
				factoryid: data.factory.idgit
			};

            var url = config.API.host + "order/create",
                method='post',
                data=order,
				contentType='multipart';

           /* RestFactory.request(url,method,data, contentType)
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

                });*/


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