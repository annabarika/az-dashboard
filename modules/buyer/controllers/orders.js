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
                 /*console.log($rootScope.fullFactories );*/
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

            var url,
                method,
                data,
                filter={};

            getTypes();
            function getTypes(){
                url=config.API.host+"/order-type/load";
                RestFactory.request(url).then(
                    function(response){
                        $scope.type= _.first(response);
                    }
                )
            }
            //$scope.newOrder={};

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

                    response[i].order.deliveryDate=moment(response[i].order.deliveryDate).format('YYYY-MM-DD');
                    response[i].order.createDate=moment(response[i].order.createDate).format('YYYY-MM-DD');

                    for( var key in $rootScope.fullFactories){

                        if(response[i].order.factoryId==key){

                            response[i]['factoryName']=$rootScope.fullFactories[key].factory.name;
                            response[i]['factoryPhone']=JSON.parse($rootScope.fullFactories[key].factory.phone);
                            response[i]['factoryFiles']=$rootScope.fullFactories[key].factoryFiles;
                        }
                    }
                }
                $scope.orders=response;
                /*console.log($scope.orders);*/
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

                if(type=='refund'){
                    $scope.title="Refund from order #"+$scope.orders[index].order.id;
                }
                else{
                    $scope.title="Make payment for order #"+$scope.orders[index].order.id;
                }

                var modalInstance=$modal.open({
                    templateUrl: "/modules/buyer/views/orders/make_payment.html",
                    controller: function($scope,messageCenterService,title){

                        $scope.title=title;

                        $scope.make=function(payment){
                            if(_.isUndefined(payment)){
                                messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
                                return;
                            }
                            if(_.isUndefined(payment.amount)||payment.amount==0||_.isNull(payment.amount)){
                                messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
                                return;
                            }
                            if(_.isNull(payment.note)|| _.isUndefined(payment.note)){
                                messageCenterService.add('danger', 'Not entered note', {timeout: 3000});
                                return;
                            }
                            else{
                                modalInstance.close(payment);
                            }
                        }
                    },
                    backdrop:'static',
                    size:"sm",
                    resolve:{
                        title:function(){
                            return $scope.title;
                        }
                    }
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
                        'paymentMethod'     :   "bank",
                        'paymentType'       :   type,
                        'amount'            :   payment.amount,
                        'note'              :   payment.note
                    };

                    RestFactory.request(url,"POST",data).then(
                        function(response){

                            if(_.isObject(response)&&response.id>0){
                                messageCenterService.add('success', 'Payment created', {timeout: 3000});
                            }else{
                                messageCenterService.add('danger', 'Payment is not created', {timeout: 3000});
                            }
                        }
                    );

                })
            };

            $scope.changeDate=function(index){

                event.stopPropagation();

                var modalInstance=$modal.open({
                    templateUrl:"/modules/buyer/views/orders/change_date.html",
                    controller:function($scope,messageCenterService){
                        $scope.today = function() {
                            $scope.dt = new Date();
                        };
                        $scope.today();

                        $scope.clear = function () {
                            $scope.dt = null;
                        };

                        $scope.disabled = function(date, mode) {
                            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
                        };

                        $scope.toggleMin = function() {
                            $scope.minDate = $scope.minDate ? null : new Date();
                        };
                        $scope.toggleMin();

                        $scope.open = function($event) {
                            $event.preventDefault();
                            $event.stopPropagation();

                            $scope.opened = true;
                        };

                        $scope.dateOptions = {
                            formatYear: 'yy',
                            startingDay: 1
                        };

                        $scope.format ='dd-MMMM-yyyy';

                        $scope.closeModal=function(date){
                            if(_.isUndefined(date)||date==""){
                                messageCenterService.add('danger',"You choose the delivery date",{timeout:3000});
                                return;
                            }
                            modalInstance.close(moment(date).format('YYYY-MM-DD'));
                        }

                    },
                    size:'sm',
                    backdrop:'static'
                });
                modalInstance.result.then(function(date){
                    console.log(date);

                    url=config.API.host+"order/update";
                    data={
                        id:$scope.orders[index].order.id,
                        deliveryDate:date
                    };
                    console.log(data);

                    RestFactory.request(url,"PUT",data).then(
                        function(response){
                            console.log(response);
                            if(response){
                                messageCenterService.add('success',"Order #"+$scope.orders[index].order.id+", delivery date updated",{timeout:3000});
                                $scope.orders[index].order.deliveryDate=date;
                            }
                            else{
                                messageCenterService.add('danger',"Error"+response,{timeout:3000});
                            }
                        }
                    )
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
            /**
             * create new order
             */
            $scope.addNewOrder = function () {
                /**
                 * show modal window with factory autocomplete
                 */
                var modalInstance=$modal.open({
                    templateUrl:"/modules/buyer/views/orders/new_order_factory.html",
                    controller:function($scope,$rootScope,imagePath,$timeout,messageCenterService){
                        /**
                         * modal title
                         * @type {string}
                         */
                        $scope.title="Choose factory";
                        /**
                         * image path
                         */
                        $scope.imagePath=imagePath;
                        /**
                         * flag for button 'create factory'
                         * @type {boolean}
                         */
                        $scope.factoryFlag=false;
                        /**
                         * filter property for autocomplete
                         * @type {string[]}
                         */
                        $scope.filterProperty=["name","phone"];
                        /**
                         * column headers for autocomplete
                         * @type {{name: string, title: string}[]}
                         */
                        $scope.columnHeaders=[
                            {name   :   "name",     title:"Factory"},
                            {name   :   "phone",    title:"Phone"},
                            {name   :   "address",  title:"Address"},
                            {name   :   "preview",  title:"Visit cards"}
                        ];
                        /**
                         * parse factories
                         */
                        $scope.allFactories=_getFactoriesByGroup($rootScope.fullFactories);
                        /**
                         *
                         * @param files
                         * @returns {Array}
                         * @private
                         */
                        function _getArray(files){

                            var array=[];

                            for (var i=0;i<files.length;i++){

                                array.push(files[i].path);
                            }

                            return array;
                        }
                        /**
                         *
                         * @param factories
                         * @returns {Array}
                         * @private
                         */
                        function _getFactoriesByGroup(factories){
                            var factory=[];
                            for(var f in factories){
                                if(factories[f].factoryGroup.id=="1"){
                                    factory.push(
                                        {
                                            name        :   factories[f].factory.name,
                                            phone       :  JSON.parse(factories[f].factory.phone),
                                            email       :   factories[f].email,
                                            address     :   factories[f].factoryAddress,
                                            preview     :   _getArray(factories[f].factoryFiles),
                                            id          :   f,
                                            currencyId  :   factories[f].factory.currencyId
                                        }
                                    )
                                }
                            }
                            return factory;
                        }
                        /**
                         * show button 'create factory' after 3000mc
                         */
                        $timeout(function(){
                            //if($scope.factory==undefined) $scope.factoryFlag=true;
                            $scope.factoryFlag=true;
                        },1000);

                        $scope.chooseFactory=function(factory){
                            if(!factory){
                                messageCenterService.add("danger","You are not choose factory",{timeout:3000});
                                return
                            }
                            modalInstance.close(factory);
                        };

                        $scope.createNewFactory=function(){
                            modalInstance.close();
                        }

                    },
                    size:'lg',
                    backdrop:"static",
                    resolve:{
                        imagePath:function(){
                           return $scope.imagePath;
                        }
                    }
                });
                modalInstance.result.then(function(factory){
                    if(factory){
                        $scope.createOrder(factory);
                    }
                    else{
                        $scope.newFactory();
                    }

                })
            };
            /**
             * create new order
             * @param factory
             */
            $scope.createOrder=function(factory){

                var modalInstance = $modal.open({
                    templateUrl: '/modules/buyer/views/orders/new_order.html',
                    controller: 'OrderEditController',
                    size: 'sm',
                    resolve:{
                        factory:function(){
                            return factory;
                        },
                        type:function(){
                            return $scope.type;
                        }
                    },
                    backdrop:'static'
                });
            };
            /*function add new factory*/
            $scope.newFactory=function(){
                var modalInstance=$modal.open({
                    templateUrl: "/modules/buyer/views/orders/new_factory.html",
                    controller: function($scope,messageCenterService){
                        $scope.title='Create new factory';
                        $scope.create=function(factory){
                            console.log(factory);
                            if(!factory){
                                messageCenterService.add("danger","Please entered form",{timeout:3000});
                                return;
                            }
                            if(factory.groupId==""||!parseInt(factory.groupId)||factory.groupId==undefined){
                                messageCenterService.add("danger","Group id must be numeric",{timeout:3000});
                                return;
                            }
                            if(factory.productionDays==""||!parseInt(factory.productionDays)||factory.productionDays==undefined){
                                messageCenterService.add("danger","Please enter valid production days count",{timeout:3000});
                                return;
                            }
                            if(factory.name==""&&factory.phone==""||factory.name==undefined&&factory.phone==undefined){
                                messageCenterService.add("danger","Please enter name or phone",{timeout:3000});
                                return;
                            }
                            if(factory.email==""||factory.email==undefined){
                                messageCenterService.add("danger","Please enter email",{timeout:3000});
                                return;
                            }
                            if(factory.currencyId==""||factory.currencyId==undefined||!parseInt(factory.currencyId)){
                                messageCenterService.add("danger","Please enter currency",{timeout:3000});
                                return;
                            }
                            modalInstance.close(factory);
                        }
                    },
                    backdrop:'static',
                    size:"sm"
                });
                modalInstance.result.then(function(factory){
                    console.log("",factory);
                    url=config.API.host+"factory/create";
                    //@TODO переделать добавление в массив параметров
                    data={
                        name            :   factory.name,
                        groupId         :   factory.groupId,
                        productionDays  :   factory.productionDays,
                        phone           :   JSON.stringify([]),
                        email           :   JSON.stringify([factory.email]),
                        currencyId      :   factory.currencyId
                    };
                    RestFactory.request(url,"POST", data).then(
                        function(response){
                            console.log("createFactory",response);
                            if(_.has(response,"id")){
                                messageCenterService.add("success","Factory created",{timeout:3000});
                                $scope.createOrder(response);
                            }
                            else{
                                messageCenterService.add("danger","Factory is not created",{timeout:3000});
                            }
                        }
                    )
                })
            };
            $scope.addNewCargo = function(){

                var modalInstance = $modal.open({
                    templateUrl: "/modules/buyer/views/orders/new_cargo.html",
                    controller: function($scope,$rootScope,imagePath,messageCenterService){
                        /**
                         * modal title
                         * @type {string}
                         */
                        $scope.title="Choose factory";
                        /**
                         * image path
                         */
                        $scope.imagePath=imagePath;
                        /**
                         * filter property for autocomplete
                         * @type {string[]}
                         */
                        $scope.filterProperty=["name","phone"];
                        /**
                         * column headers for autocomplete
                         * @type {{name: string, title: string}[]}
                         */
                        $scope.columnHeaders=[
                            {name   :   "name",     title:"Factory"},
                            {name   :   "phone",    title:"Phone"},
                            {name   :   "address",  title:"Address"},
                            {name   :   "preview",  title:"Visit cards"}
                        ];
                        /**
                         * parse factories
                         */
                        $scope.allFactories=_getFactoriesByGroup($rootScope.fullFactories);
                        /**
                         *
                         * @param files
                         * @returns {Array}
                         * @private
                         */
                        function _getArray(files){

                            var array=[];

                            for (var i=0;i<files.length;i++){

                                array.push(files[i].path);
                            }

                            return array;
                        }
                        /**
                         *
                         * @param factories
                         * @returns {Array}
                         * @private
                         */
                        function _getFactoriesByGroup(factories){
                            var factory=[];
                            for(var f in factories){
                                if(factories[f].factoryGroup.id=="1"){
                                    factory.push(
                                        {
                                            name        :   factories[f].factory.name,
                                            phone       :  JSON.parse(factories[f].factory.phone),
                                            email       :   factories[f].email,
                                            address     :   factories[f].factoryAddress,
                                            preview     :   _getArray(factories[f].factoryFiles),
                                            id          :   f,
                                            currencyId  :   factories[f].factory.currencyId
                                        }
                                    )
                                }
                            }
                            return factory;
                        }
                        /**
                         * get factory and close modal dialog
                         * @param factory
                         */
                        $scope.createCargo=function(factory){
                            if(factory){
                                modalInstance.close(factory);
                            }
                            else{
                                messageCenterService.add("danger","You are njot choose factory",{timeout:3000});
                            }
                        }
                    },
                    backdrop:'static',
                    size:'lg',
                    resolve:{
                        imagePath:function(){
                            return $scope.imagePath;
                        }
                    }
                });
                modalInstance.result.then(function(factory){
                        console.log("cargo",factory);
                        var cargo = {
                            'parentId' : 0,
                            'factoryId': factory.id,
                            'document': '',
                            'status': 0,
                            'employeeId': $rootScope.user.id
                        };

                        RestFactory.request(config.API.host+"cargo/create" , "POST", cargo)
                            .then(function(response){
                                console.log("new cargo", response);
                                if( response.cargo.id ){
                                    //$rootScope.modalInstance.close();
                                    $location.path( '/buyer/cargo/id/'+ response.cargo.id );
                                }
                                else{
                                    messageCenterService.add("danger","Cargo is mot created",{timeout:3000});
                                }
                            },function(error){
                                messageCenterService.add("danger","ERROR: "+error,{timeout:3000});
                            });
                })
            };
        }]);

app.controller("OrderEditController", function($scope,$rootScope,RestFactory,$location,$modalInstance,$modal,$http,factory,type,messageCenterService){

    $scope.factory=factory;
    $scope.type=type;
    var fileinput;
    console.log($rootScope.user);
    console.log($scope.factory);
    $scope.statusModel=1;
    /**
     * create and save new order
     * @param data
     */
    $scope.saveOrder = function ( amount) {

        if(amount==""){
            messageCenterService.add('danger','please enter amount',{timeout:3000});
            return;
        }
        if(!parseFloat(amount)){
            messageCenterService.add('danger','Please use the numbers or point',{timeout:3000});
            return;
        }
        var fd = new FormData();
        angular.forEach($scope.files, function(file){
            fd.append('file[]', file);
        });

        var params = {
            'buyerId'       :   $rootScope.user.id,
            'factoryId'     :   $scope.factory.id,
            'type'          :   $scope.type.id,
            'currencyId'    :   $scope.factory.currencyId,
            'status'        :   $scope.statusModel
        };
        console.log("params",params);
        var url = config.API.host + "order/create";

        RestFactory.request(url,"POST",params)
            .then(function(response){
                console.log("create order",response);
                if(response=='null'){
                    messageCenterService.add('danger', 'Order is not created', {timeout: 3000});
                }
                else{
                    if(!_.isObject(response)){
                        url=config.API.host+"order/create-manual-row";
                        params={
                            orderId: response.id,
                            price: amount
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
                     console.log(response);
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
                modalInstance.result.then(function(){

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

                        $scope.title="Make payment";

                        $scope.make=function(payment){
                            if(_.isUndefined(payment)){
                                messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
                                return;
                            }
                            if(_.isUndefined(payment.amount)||payment.amount==0||_.isNull(payment.amount)){
                                messageCenterService.add('danger', 'Not entered amount', {timeout: 3000});
                                return;
                            }
                            if(_.isNull(payment.note)|| _.isUndefined(payment.note)){
                                messageCenterService.add('danger', 'Not entered note', {timeout: 3000});
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
                        'currencyId'        :   $scope.order.currency.id,
                        'cashierId'         :   cashierId,
                        'cashierOfficeId'   :   CO,
                        'orderId'           :   id,
                        'paymentMethod'     :   "bank",
                        'paymentType'       :   "payment",
                        'amount'            :   payment.amount,
                        'note'              :   payment.note
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

            /**
             * upload files
             */
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
