var app = angular.module("modules.buyer.orders", []);

app.run(
    [
        "$rootScope",
        "$http",

        function($rootScope,$http){

            $http.get(config.API.host + "factory/load")
                .success(function(data){

                     $rootScope.fullFactories=data;
                    _factoryForFilter();
                });


            /**
             * Factory getter
             * @private
             */
            function _factoryForFilter(){
                var factory = [];
                // console.log($rootScope.fullFactories );
                for( var i in $rootScope.fullFactories ){

                    factory.push( { type:"factory", id: $rootScope.fullFactories[i].factory.id, name: $rootScope.fullFactories[i].factory.name } );
                }
                $rootScope.Factory=factory;
               // console.log(factory);
            }
        }

    ]);

app.controller('OrderListController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",
        "messageCenterService",
        "$timeout",

        function ($scope, $rootScope, $modal, $location, $route, RestFactory, messageCenterService,$timeout){

            $scope.$route = $route;
            $scope.$location = $location;

            $scope.imagePath=config.API.imagehost+'/files/factory/attachments/';

            $rootScope.documentTitle = "Orders";

            var modalWindow,
                url,
                method,
                data,
                filter={};

            getTypes();
            function getTypes(){
                url=config.API.host+"/order-type/load";
                RestFactory.request(url).then(
                    function(response){
                        $scope.type=response;
                    }
                )
            }


            $scope.newOrder={};

            RestFactory.request(config.API.host+"order/load-detailed/").then(
                function(response){
                    //console.log("all orders",response);
                    _parseOrders(response);
                }
            );
            /**
             * parser Orders array
             * @param response
             * @private
             */
            function _parseOrders(response){

                var length=response.length;

                for(var i=0;i<length;i++){

                    for( var key in $rootScope.fullFactories){

                        if(response[i].order.factoryId==key){

                            response[i]['factoryName']=$rootScope.fullFactories[key].factory.name;
                            response[i]['factoryPhone']=JSON.parse($rootScope.fullFactories[key].factory.phone);
                            response[i]['factoryFiles']=$rootScope.fullFactories[key].factoryFiles;
                        }
                    }
                }
                $scope.orders=response;
            }
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
            /**
             *
             * @param item
             */
            $scope.edit = function(item){
                console.log(item);
                $location.path( '/buyer/orders/id/'+ item.order.id);
            };

            /**
             * Send to Factory
             * @param index
             */
            $scope.sendToFactory=function(index){
                event.stopPropagation();
                console.log(index);

                var modalInstance=$modal.open({
                    templateUrl:"/modules/buyer/views/orders/send_to_factory.html",
                    controller:function($scope,orderId){
                        $scope.id=orderId;
                    },
                    backdrop:'static',
                    size:"sm",
                    resolve:{
                        orderId:function(){
                            return $scope.orders[index].order.id;
                        }
                    }
                });
                modalInstance.result.then(function(){

                    url=config.API.host+'order/send-to-factory/id/'+$scope.orders[index].order.id;
                    //console.log(url);
                    RestFactory.request(url).then(
                        function(response){
                            console.log("send to factory",response);
                            if(_.has(response,"file") && _.has(response,"pdf")&&_.has(response,"html")){
                                messageCenterService.add('success', 'Order sended', {timeout: 3000});
                            }
                            else{
                                messageCenterService.add('danger', 'Error: '+response, {timeout: 3000});
                            }

                        },
                        function(error){
                            messageCenterService.add('danger', 'Error: '+error, {timeout: 3000});
                        }
                    )
                });
            };

            /**
             *  Cancel order
             * @param index
             */
            $scope.cancel=function(index){
                event.stopPropagation();
                //console.log(index);

                if($scope.orders[index].order.status==2){
                    messageCenterService.add('danger', 'Order has been canceled', {timeout: 3000});
                    $timeout(function(){
                        $scope.orders.splice(index,1);
                    },2000);
                    return;
                }

                var modalInstance=$modal.open({
                    templateUrl:"/modules/buyer/views/orders/cancel.html",
                    size:"sm",
                    backdrop:'static'

                });
                modalInstance.result.then(function(){

                    url=config.API.host+"order/cancel";

                    RestFactory.request(url,"PUT",{id:$scope.orders[index].order.id}).then(
                        function(response){
                            if(response.status==2){
                                messageCenterService.add('success', 'Order cancelled', {timeout: 3000});
                                $timeout(function(){
                                    $scope.orders.splice(index,1);
                                },2000)
                            }
                            else{
                                messageCenterService.add('danger', 'Order is not cancelled', {timeout: 3000});
                            }

                        }
                    )
                })
            };
            /**
             * make payment
             */
            $scope.makePayment=function(index,type){
                event.stopPropagation();
               // console.log("payment type",type);
                var modalInstance=$modal.open({
                    templateUrl: "/modules/buyer/views/orders/make_payment.html",
                    controller: function($scope,messageCenterService){
                        $scope.methods=[
                            {name:'cash'},
                            {name:'bank'}
                        ];
                        $scope.make=function(payment){
                            if(_.isUndefined(payment)){
                                messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
                                return;
                            }
                            if(_.isUndefined(payment.amount)||payment.amount==0||_.isNull(payment.amount)){
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
                        }
                    },
                    backdrop:'static',
                    size:"sm"
                });

                modalInstance.result.then(function(payment){
                    var CO=JSON.parse(localStorage['user']).settings.cashierOffice;
                    var cashierId=JSON.parse(localStorage['user']).id;
                    url=config.API.host+"payment/create";
                    data={
                        'currencyId'        :   $scope.orders[index].order.currencyId,
                        'cashierId'         :   cashierId,
                        'cashierOfficeId'   :   CO,
                        'orderId'           :   $scope.orders[index].order.id,
                        'paymentMethod'     :   payment.method.name,
                        'paymentType'       :   type,
                        'amount'            :   payment.amount
                    };

                    RestFactory.request(url,"POST",data).then(
                        function(response){
                           // console.log("payment",response);
                            if(_.isObject(response)&&response.id>0){
                                messageCenterService.add('success', 'Payment created', {timeout: 3000});
                            }else{
                                messageCenterService.add('danger', 'Payment is not created', {timeout: 3000});
                            }
                        }
                    );

                })
            };
            /**
             * filters for orders
             * @param filter
             */
            $scope.filteredOrders=function(filter){
                //console.log(filter);

                url=config.API.host+"order/load-detailed/";

                if(_.has(filter, "status") && filter.status!=null){


                    url+="status/"+filter.status.id+"/";
                }
                if(_.has(filter, "paymentStatus")&& filter.paymentStatus!=null){

                    url+="paymentStatus/"+filter.paymentStatus.id+"/";
                }
                if(_.has(filter, "factory") && filter.factory!=null){

                    if(_.isUndefined(filter.factory.id)){
                        return;
                    }
                    url+="factoryId/"+filter.factory.id+"/";
                }

                if(_.has(filter, "createDate") && filter.createDate!=null){
                    filter.createDate.startDate= moment(filter.createDate.startDate).format('YYYY-MM-DD');
                    filter.createDate.endDate= moment(filter.createDate.endDate).format('YYYY-MM-DD');
                    url+="createDate/"+filter.createDate.startDate+","+filter.createDate.endDate+"/";
                }

                //console.log(url);

                RestFactory.request(url)
                    .then(
                    function(response){
                        _parseOrders(response)
                    },
                    function(error){
                        console.log(error);
                    });
            };




             /*$scope.$watchCollection('resultData',function(newVal){

                for(item in newVal){
                    var arr=[];

                    if($.isEmptyObject(newVal[item])){

                        delete filter[item];
                    }
                    else{
                        angular.forEach(newVal[item],function(value,key){


                            if(key=="startDate"||key=="endDate"){

                                arr.push(moment(value).format('YYYY-MM-DD'));
                                filter[item]=arr;
                            }

                            if(value.ticked ===true){

                                arr.push(value.id);
                                filter[item]=arr;
                            }

                        });
                    }
                }

                if(!$.isEmptyObject(filter)){

                    url=config.API.host+"order/load-detailed/";

                    if(filter.order){

                        url+="status/"+filter.order.join()+"/";
                    }

                    if(filter.orderPayment){

                        url+="paymentStatus/"+filter.orderPayment.join()+"/";
                    }
                    if(filter.factory){

                        url+="factoryId/"+filter.factory.join()+"/";
                    }
                    if(filter.createDate){

                        url+="createDate/"+filter.createDate.join(',')+"/";
                    }

                    console.log(url);


                    RestFactory.request(url)
                        .then(
                        function(response){
                            _parseOrders(response)
                        },
                        function(error){
                            console.log(error);
                        });
                }
                else{
                    $scope.orders=$scope.data;
                }
            });*/

            $scope.addNewOrder = function () {

                var modalInstance = $modal.open({
                    templateUrl: '/modules/buyer/views/orders/new_order.html',
                    controller: 'OrderEditController',
                    size: 'sm',
                    resolve:{
                        factory:function(){
                            return $scope.Factory;
                        },
                        type:function(){
                            return $scope.type;
                        }
                    },
                    backdrop:'static'
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

        }]);

app.controller("OrderEditController", function($scope,$rootScope,RestFactory,$location,$modalInstance,$modal,$http,factory,type,messageCenterService){

    $scope.Factory=factory;
    $scope.type=type;
    var fileinput;


    $scope.columnHeaders=[
         {name:"name"},
        /* {name:"phone"},
         {name:"email"},
         {name:"docs"}*/

    ];


    $scope.saveOrder = function ( data ) {
        console.log(data,$scope.files);
        var fd = new FormData();
        angular.forEach($scope.files, function(file){
            fd.append('file[]', file);
        });

        var params = {
            'buyerId'       :   1,
            'factoryId'     :   data.factory.id,
            'type'          :   data.type.id,
            'currencyId'    :   data.factory.currencyId
            /*,'amount'        :   data.amount*/
        };
        console.log("params",params);
        var url = config.API.host + "order/create";

        RestFactory.request(url,"POST",params)
            .then(function(response){
                //console.log(response);
                if(response=='null'){
                    messageCenterService.add('danger', 'Order is not created', {timeout: 3000});
                }
                else{
                    if(_.isObject(response)){
                        url=config.API.host+"order/create-manual-row";
                        params={
                            orderId: response.id,
                            price: data.amount
                        };
                        console.log(params);
                        RestFactory.request(url,"POST",params).then(
                            function(resp){
                                console.log("resp",resp);
                            }
                        );

                        url = config.API.host + "order/loadfiles";
                        fd.append("id",response.id);
                        console.log(fd);
                        $http.post(url,fd,
                            {
                                transformRequest: angular.identity,
                                headers: {'Content-Type': undefined}
                            })
                            .success(function(data){
                                console.log("fileData",data);

                            })
                            .error(function(data,status){
                                console.log(data,status);
                            })
                    }
                    // console.log(response);

                    messageCenterService.add('success', 'Order is created', {timeout: 3000});
                    $location.path( '/buyer/orders/id/'+ response.id );
                    $modalInstance.close();
                }

            },
            function(error) {
                /*  console.log(error);*/
                messageCenterService.add('danger', 'Order is not created', {timeout: 3000});

            });


    };

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
});
/**
 * Controller for order cart
 */
app.controller("OrderController",
    [
        "$scope",
        "$rootScope",
        "$location",
        "$route",
        "RestFactory",
        "$modal",
        "messageCenterService",
        "$http",
        function($scope,$rootScope,$location, $route,RestFactory,$modal,messageCenterService,$http){

            $scope.$route = $route;
            var id = $route.current.params.orderId,
                url,data;

            getTypes();
            function getTypes(){
                url=config.API.host+"/order-type/load";
                RestFactory.request(url).then(
                    function(response){
                        $scope.type=response;
                    }
                )
            }

            /**
             *
             * @param status
             * @param amount
             */
            function setFlag(status,amount){
               // console.log("this", status,amount);
                if(status!=0||amount>0){
                    $scope.orderFlag=true;
                }
                else{
                    $scope.orderFlag=false;
                }
            }

            $scope.currentType=function (){

                angular.forEach($scope.type,function(value){

                    if(value.id==$scope.order.order.type){
                        return value;
                    }
                });
            };

            $scope.statusTemplates = {
                0:'<span class="label label-info">Draft</span>',
                1:'<span class="label label-danger">Send to factory</span>',
                2:'<span class="label label-success">Cancelled</span>',
                3:'<span class="label label-warning">Finished</span>'
            };

            $rootScope.documentTitle = 'Order #'+ id;

            $scope.cancel=function(){

                if($scope.order.order.status==2){
                    messageCenterService.add('danger', 'Order has been canceled', {timeout: 3000});
                    return;
                }


                var modalInstance=$modal.open({
                    templateUrl:"/modules/buyer/views/orders/cancel.html",
                    size:"sm",
                    backdrop:'static'

                });
                modalInstance.result.then(function(string){

                    url=config.API.host+"order/cancel";

                    RestFactory.request(url,"PUT",{id:id}).then(
                        function(response){

                            if(response.status==2){
                                messageCenterService.add('success', 'Order cancelled', {timeout: 3000});
                            }
                            else{
                                messageCenterService.add('danger', 'Order is not cancelled', {timeout: 3000});
                            }

                        }
                    )
                })
            };
            /**
             * load order by id
             */
            RestFactory.request(config.API.host + "order/get/id/"+id)
                .then(function(response){
                    console.log("order",response);
                    $scope.order=response;
                    setFlag($scope.order.order.status);
                    angular.forEach($scope.type,function(value,index){
                        if(value.id==$scope.order.order.type){
                            $scope.currentType=$scope.type[index];
                        }
                    });
                });
            /**
             * load cargo by orderId
             */
            RestFactory.request(config.API.host +"cargo/load/orderId/"+id).then(
                function(response){
                    console.log(response);
                    if(_.isNull(response)===false){
                        $scope.cargo=response;
                    }

                }
            );
            /**
             * load products by orderId
             * @type {Array}
             */
            $scope.totalCount=0;
            $scope.totalPrice=0;
            RestFactory.request(config.API.host+"order/get-rows/id/"+id).then(
                function(response){
                    console.log('response rows', response);
                    $scope.orderProducts=response;
                    console.log(response);
                    angular.forEach(response,function(value){

                        if(_.has(value, 'count')){

                            $scope.totalCount+=parseInt(value.count);

                        }
                        if(_.has(value.product, 'price')) {
                            $scope.totalPrice += parseInt(value.price);
                        }
                    });
                }
            );

            $scope.saveProduct=function(event,product,model){

                if(event.keyCode==13){

                    if(model.price==""||model.count==""){

                        messageCenterService.add("danger", "Fields price and count should not be empty",{timeout:3000});

                        return;
                    }



                    console.log("new", product);
                    url=config.API.host+"/order/update-row";
                    data={
                        id:product.id,
                        size:product.size,
                        price:model.price,
                        count:model.count
                    };
                    RestFactory.request(url,"PUT",data).then(
                        function(response){
                            console.log(response);
                            if(_.isObject(response)){
                                messageCenterService.add("success", "Articul #"+product.product.articul+" updated",{timeout:3000});
                            }
                            else{
                                messageCenterService.add("danger", "Articul #"+product.product.articul+" is not updated",{timeout:3000});
                            }
                        }
                    )

                }
            };


            /**
             * location to cargo cart
             * @param id
             */
            $scope.goToCargo=function(id){
                $location.path("/buyer/cargo/id/"+id);
            };
            /**
             * location to payment cart
             */
            $scope.showPayment=function(){
                $location.path('/buyer/payments/payment_order/'+id);
            };

            $scope.imagePath=config.API.imagehost+'/files/factory/attachments/';

            $scope.tableHeader = [
                { name: "photo", title: 'Photo' },
                { name: "articul", title: 'Articul' },
                { name: "factoryArticul", title: 'Factory articul' },
                { name: "title", title: 'Title' },
                { name: "size", title: "Size"},
                { name: "count", title: 'Count' },
                { name: "price", title: 'Price' },
                { name: "subtotal", title: 'Subtotal' }

            ];
            /**
             * send to factory
             */
            $scope.sendToFactory=function(){
                var modalInstance=$modal.open({
                    templateUrl:"/modules/buyer/views/orders/send_to_factory.html",
                    controller:function($scope,orderId){
                        $scope.id=orderId;
                    },
                    backdrop:'static',
                    size:"sm",
                    resolve:{
                        orderId:function(){
                            return id;
                        }
                    }
                });
                modalInstance.result.then(function(){

                    url=config.API.host+'order/send-to-factory/id/'+id;
                    console.log(url);
                    RestFactory.request(url).then(
                        function(response){
                            console.log("send to factory",response);
                            if(response=='true'){
                                messageCenterService.add('success', 'Order sended', {timeout: 3000});
                            }
                            else{
                                messageCenterService.add('danger', 'Error: '+response, {timeout: 3000});
                            }

                        },
                        function(error){
                            messageCenterService.add('danger', 'Error: '+error, {timeout: 3000});
                        }
                    )
                });
            };
            /**
             *
             * @param index
             */
            $scope.deleteProduct=function(index) {
                console.log($scope.orderProducts[index]);
                var id = $scope.orderProducts[index].id;
                url = config.API.host + "order/delete-row/id/" + id;
                RestFactory.request(url, "DELETE").then(
                    function (response) {
                        if(response=='true'){
                            $scope.orderProducts.splice(index,1);
                            messageCenterService.add('success', 'Product deleted', {timeout: 3000});

                        }else{
                            messageCenterService.add('danger', 'Error! Product is not deleted', {timeout: 3000});
                        }



                    },
                    function(error){
                        messageCenterService.add('danger', 'Error: '+error, {timeout: 3000});
                    }
                );
            };
            /**
             * make payment
             */
            $scope.makePayment=function(){
                var modalInstance=$modal.open({
                    templateUrl: "/modules/buyer/views/orders/make_payment.html",
                    controller: function($scope,messageCenterService){
                        $scope.methods=[
                            {name:'cash'},
                            {name:'bank'}
                        ];
                        $scope.make=function(payment){
                            if(_.isUndefined(payment)){
                                messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
                                return;
                            }
                            if(_.isUndefined(payment.amount)||payment.amount==0||_.isNull(payment.amount)){
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
                        }
                    },
                    backdrop:'static',
                    size:"sm"
                });

                modalInstance.result.then(function(payment){
                    var CO=JSON.parse(localStorage['user']).cashierOffice;
                    url=config.API.host+"payment/create";
                    data={
                        'currencyId'        :   $scope.order.currency.id,
                        //@TODO Узнать cashierId от авторизации
                        'cashierId'         :   1,
                        'cashierOfficeId'   :   CO,
                        'orderId'           :   id,
                        'paymentMethod'     :   payment.method.name,
                        'paymentType'       :   "payment",
                        'amount'            :   payment.amount
                    };

                    RestFactory.request(url,"POST",data).then(
                        function(response){
                            console.log("payment",response);
                            if(_.isObject(response)&&response.id>0){
                                messageCenterService.add('success', 'Payment created', {timeout: 3000});
                                setFlag(null,payment.amount);
                            }else{
                                messageCenterService.add('danger', 'Payment is not created', {timeout: 3000});
                            }
                        }
                    );

                })
            };


            $scope.upload=function(){
                $scope.uploadFlag=true;
                var uploader=document.getElementById("uploader");
                uploader.click();
            };

            $scope.$watch("files",function(value){
                console.log(value);
                if(!_.isUndefined(value) && $scope.uploadFlag){

                    runUpload();
                }
            });
            /**
             * upload files
             */
            function runUpload(){

                $scope.uploadFlag=false;

                var fd = new FormData();

                angular.forEach($scope.files, function(file){
                    fd.append('file[]', file);
                });

                url = config.API.host + "order/loadfiles";
                fd.append("id",id);
                console.log("fd",fd);
                $http.post(url,fd,
                    {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    })
                    .success(function(data,status){
                        console.log("data upload",data);
                        if(_.isArray(data)){
                            messageCenterService.add('success', 'Files uploaded', {timeout: 3000});
                        }
                        else{
                            messageCenterService.add('danger', 'Download failed: '+data, {timeout: 3000});
                        }

                    })
                    .error(function(data,status){
                        messageCenterService.add('danger', 'Error: '+data+" "+status, {timeout: 3000});
                    })
            }

            $scope.removeFiles=function(name){

                var obj={};

                angular.forEach($scope.files,function(v,k){

                    if(v.name!=name){

                        this[k]=v;
                    }
                },obj);

                if(_.isEmpty(obj)){

                    $scope.files=undefined;
                }
                else{
                    $scope.files=obj;
                }

            }

        }]);
