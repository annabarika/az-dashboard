var app = angular.module("modules.buyer.orders", []);

/*app.run(
    [
        "$rootScope",
        "$http",

        function($rootScope,$http){
            *//**
             * get factories
             *//*
            if($rootScope.fullFactories!=undefined){
                _factoryForFilter();
            }
            else{
                $http.get(config.API.host + "factory/load")
                    .success(function(data){

                        $rootScope.fullFactories=data;
                        _factoryForFilter();
                    });
            }
            *//**
             * Factory getter
             * @private
             *//*
            function _factoryForFilter(){
                var factory = [];
                 *//*console.log($rootScope.fullFactories );*//*
                for( var i in $rootScope.fullFactories ){

                    factory.push( { type:"factory", id: $rootScope.fullFactories[i].factory.id, name: $rootScope.fullFactories[i].factory.name } );
                }
                $rootScope.Factory=factory;
               // console.log(factory);
            }
        }
    ]);*/

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
        "$http",

        function ($scope, $rootScope, $modal, $location, $route, RestFactory, messageCenterService,$timeout,$http){

            $scope.$route = $route;
            $scope.$location = $location;

            $scope.imagePath=config.API.imagehost+'/files/factory/attachments/';

            $rootScope.documentTitle = "Orders";

            var modalWindow,
                url,
                method,
                data,
                filter={};

            _getTypes();
            /**
             * get types
             * @private
             */
            function _getTypes(){
                url=config.API.host+"/order-type/load";
                RestFactory.request(url).then(
                    function(response){
                        $scope.type= _.first(response);
                       /* console.log(response);*/
                    }
                )
            }
            _factoryForFilter();
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


            /**
             * get orders
             */
            $scope.getOrders=function(){
                RestFactory.request(config.API.host+"order/load-detailed/").then(
                    function(response){
                       /* console.log("all orders",response);*/
                        _parseOrders(response);
                    }
                );
            };
            $scope.getOrders();
            /**
             * get payment type for orders
             */
            $scope.$watch('types',function(val){
                if(val){
                    _getPaymentType();
                }
            });
            /**
             * get payment Type
             * @private
             */
            function _getPaymentType(){
                var index=_.findIndex($rootScope.types,{'entity':'payment','name':'Order'});
                if(index!=-1){
                    $scope.paymentType=$rootScope.types[index];
                }
            }
            /**
             * parser Orders array
             * @param response
             * @private
             */
            function _parseOrders(response){

                var length=response.length;

                for(var i=0;i<length;i++){

                    response[i].order.deliveryDate = (response[i].order.deliveryDate) ? moment(response[i].order.deliveryDate).format('YYYY-MM-DD') : null;
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
            $scope.cancel=function(index) {
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
             * Finish order
             *
             * @param index
             */
            $scope.finish = function(index) {
                event.stopPropagation();

                var modalInstance = $modal.open({
                    templateUrl:"/modules/buyer/views/orders/finish.html",
                    size:"sm",
                    backdrop: 'static'

                });
                modalInstance.result.then(function(){

                    url=config.API.host+"order/update";

                    RestFactory.request(url,"PUT",{id:$scope.orders[index].order.id, status: 3}).then(
                        function(response) {
                            if(response.status==3){
                                $scope.orders[index].order.status = 3;
                                messageCenterService.add('success', 'Order finished', {timeout: 3000});
                            }
                            else{
                                messageCenterService.add('danger', 'Order is not finished', {timeout: 3000});
                            }

                        }
                    )
                })
            };

            /**
             * make payment
             */
            $scope.makePayment=function(index,type) {

                event.stopPropagation();

                if(type=='refund'){
                    $scope.title="Ask for refund from order #"+$scope.orders[index].order.id;
                }
                else{
                    $scope.title="Ask for payment for order #"+$scope.orders[index].order.id;
                }

                var modalInstance=$modal.open({
                    templateUrl: "/modules/buyer/views/orders/make_payment.html",
                    controller: function($scope,messageCenterService,title){

                        $scope.title= title;

                        $scope.make = function(payment) {

                            if(_.isUndefined(payment)) {
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

                modalInstance.result.then(function(payment) {

                    var CO=JSON.parse(localStorage['user']).settings.cashierOffice;

                    var cashierId=JSON.parse(localStorage['user']).id;

                    url = config.API.host + 'payment/create';

                    data = {
                        documentId      : $scope.orders[index].order.id,
                        currencyId      : $scope.orders[index].order.currencyId,
                        cashierId       : cashierId,
                        cashierOfficeId : parseInt(CO),
                        paymentType     : type,
                        paymentMethod   : "bank",
                        paymentDocumentType : $scope.paymentType.typeId,//1,
                        amount          : payment.amount,
                        note            : payment.note
                    };

                    RestFactory.request(url,"POST",data).then(function(response){

                            if(_.isObject(response)&&response.id>0) {

                                if(type == 'refund') {
                                    $scope.orders[index].order.paidTotal = Number(parseFloat($scope.orders[index].order.paidTotal) - data.amount).toFixed(2);
                                }
                                else {

                                    $scope.orders[index].order.paidTotal = Number(parseFloat($scope.orders[index].order.paidTotal) + data.amount).toFixed(2);
                                }

                                data.paymentType = type;
                                data.paymentDate = moment().format('YYYY-MM-DD hh:mm:ss');

                                $scope.orders[index].payments.push(data);

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

                        /*$scope.disabled = function(date, mode) {
                            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
                        };*/

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
                    controller:function($scope,imagePath,factories,$timeout,messageCenterService){
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
                        //$scope.factoryFlag=false;
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
                        $scope.allFactories=_getFactoriesByGroup(factories);
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
                                //if(factories[f].factoryGroup.id=="1"){
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
                                //}
                            }
                            return factory;
                        }
                        /**
                         * show button 'create factory' after 3000mc
                         */
                      /*  $timeout(function(){
                            $scope.factoryFlag=true;
                        },3000);*/
                        $scope.$watch('factory',function(val){
                            if(val==""){
                                $scope.factoryFlag=true;
                            }
                            else{
                                $scope.factoryFlag=false;
                            }
                        });
                        /**
                         * close modal window
                         * @param factory
                         */
                        $scope.chooseFactory=function(factory){
                            if(!factory){
                                messageCenterService.add("danger","You are not choose factory",{timeout:3000});
                                return
                            }
                            modalInstance.close(factory);
                        };
                        /**
                         * create new factory
                         */
                        $scope.createNewFactory=function(){
                            modalInstance.close();
                        }

                    },
                    size:'lg',
                    backdrop:"static",
                    resolve:{
                        imagePath:function(){
                           return $scope.imagePath;
                        },
                        factories:function(){
                            return $rootScope.fullFactories;
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
                            var index= _.findIndex($rootScope.types,{entity:'order',name:'other'});
                            return $rootScope.types[index];
                        }
                    },
                    backdrop:'static'
                });
            };
            /**
             * create new factory
             */
            $scope.newFactory=function(){
                var modalInstance=$modal.open({
                    templateUrl: "/modules/buyer/views/orders/new_factory.html",
                    controller: function($scope,$rootScope,messageCenterService){
                        /**
                         * modal window title
                         * @type {string}
                         */
                        $scope.title='Create new factory';
                        /**
                         * watch file uploader
                         */
                        $scope.$watch('files',function(val){
                            if(val){
                                console.log(val);
                                $rootScope.factoryAttachment=val;
                            }
                        });
                        /**
                         * close modal window and validate form data
                         * @param factory
                         */
                        $scope.create=function(factory){
                            console.log(factory);
                            if(!factory){
                                messageCenterService.add("danger","Please, entered form",{timeout:3000});
                                return;
                            }
                            if(factory.name==""||factory.name==undefined){
                                messageCenterService.add("danger","Please, enter name field",{timeout:3000});
                                return;
                            }
                            if(factory.groupId==""||factory.groupId==undefined){
                                messageCenterService.add("danger","Please, enter group Id field",{timeout:3000});
                                return;
                            }
                            if(!parseInt(factory.groupId)){
                                messageCenterService.add("danger","Please, use only numbers in group Id field",{timeout:3000});
                                return;
                            }

                            if(factory.productionDays==""||factory.productionDays==undefined){
                                messageCenterService.add("danger","Please, enter valid production days count",{timeout:3000});
                                return;
                            }
                            if(!parseInt(factory.productionDays)){
                                messageCenterService.add("danger","Please, use only numbers in production days field",{timeout:3000});
                                return;
                            }
                            if(factory.phone==""||factory.phone==undefined){
                                messageCenterService.add("danger","Please, enter phone field",{timeout:3000});
                                return;
                            }
                            if(!parseInt(factory.phone)){
                                messageCenterService.add("danger","Please, use numbers in phone field",{timeout:3000});
                                return;
                            }
                            if(factory.email==""||factory.email==undefined){
                                messageCenterService.add("danger","Please, enter email",{timeout:3000});
                                return;
                            }
                            if(factory.currencyId==""||factory.currencyId==undefined||!parseInt(factory.currencyId)){
                                messageCenterService.add("danger","Please, enter currency",{timeout:3000});
                                return;
                            }
                            if(!parseInt(factory.currencyId)){
                                messageCenterService.add("danger","Please, use only numbers",{timeout:3000});
                                return;
                            }
                            modalInstance.close(factory);
                        };
                    },
                    backdrop:'static',
                    size:"sm"
                });
                modalInstance.result.then(function(factory){
                    if(!factory){
                        $scope.addNewOrder();
                        return;
                    }
                    console.log("make new factory",factory,$rootScope.factoryAttachment);
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
                                $scope.uploadFiles(response);
                                $scope.createOrder(response);
                            }
                            else{
                                messageCenterService.add("danger","Factory is not created",{timeout:3000});
                            }
                        }
                    )
                })
            };
            /**
             * upload files
             */
            $scope.uploadFiles=function(response){
                url=config.API.host+'factory/loadfiles';

                var fd = new FormData();
                angular.forEach($rootScope.factoryAttachment, function(file){
                    fd.append('file[]', file);
                });
                fd.append("id",response.id);
                console.log(fd);
                $http.post(url,fd,
                    {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    })
                    .success(function(data){
                        console.log("fileData",data);
                        messageCenterService.add("success","Files uploaded",{timeout:3000});
                    })
                    .error(function(data,status){
                        messageCenterService.add("danger","Files is not uploaded",{timeout:3000});
                    })
            };
            /**
             * create new cargo
             */
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
    console.log($scope.type);
    /**
     * order status
     * @type {number}
     */
    $scope.statusModel=1;
    /**
     * create and save new order
     * @param data
     */
    $scope.saveOrder = function ( amount,advance) {

        if(amount==""){
            messageCenterService.add('danger','please enter amount',{timeout:3000});
            return;
        }
        if(!parseFloat(amount)){
            messageCenterService.add('danger','Please use the numbers or point',{timeout:3000});
            return;
        }

        var params = {
            'buyerId'       :   $rootScope.user.id,
            'factoryId'     :   $scope.factory.id,
            'type'          :   $scope.type.typeId,
            'currencyId'    :   $scope.factory.currencyId,
            'status'        :   $scope.statusModel
        };

        RestFactory.request(config.API.host + "order/create","POST",params)
            .then(function(response){
                console.log("create order",response);

                    if(_.has(response,"id")){
                        if(advance){
                            _createPayment(response,$rootScope.user,advance);
                        }

                        _createManualRow(response.id,amount);

                        if($scope.files){
                            _loadOrderFiles(response.id);
                        }
                        messageCenterService.add('success', 'Order is created', {timeout: 3000});
                        $location.path( '/buyer/orders/id/'+ response.id );
                        $modalInstance.close();
                    }
                    else{
                        messageCenterService.add('danger', 'Order is not created', {timeout: 3000});
                    }
            })
    };
    /**
     * create payment for order if advance
     * @param order
     * @param user
     * @param advance
     * @private
     */
    function _createPayment(order, user,advance) {

        var data = {
            documentId          : order.id,
            currencyId          : order.currencyId,
            paymentDocumentType : 1,
            cashierId           : user.id,
            cashierOfficeId     : parseInt(user.settings.cashierOffice),
            paymentType         : "payment",
            amount              : parseFloat(advance),
            paymentMethod       : "bank",
            note                : "&nbsp"
        };
        console.log("paymentCreate",data);
        RestFactory.request(config.API.host + "payment/create", "POST", data).then(function(response){
            if(_.has(response,"id")){
                messageCenterService.add("success","Payment created",{timeout:1000});
            }
            else{
                messageCenterService.add("danger","Payment is not created",{timeout:1000});
            }
        });
    }
    /**
     * load files for order
     * @param id
     * @private
     */
    function _loadOrderFiles(id){
        var fd = new FormData();
        angular.forEach($scope.files, function(file){
            fd.append('file[]', file);
        });
        fd.append("id",id);
        $http.post(config.API.host + "order/loadfiles",fd,
            {
                transformRequest: angular.identity,
                headers: {'Content-Type': undefined}
            })
            .success(function(data){
                console.log("fileData",data);

            })
            .error(function(data,status){
                console.log(data,status);
                messageCenterService.add("danger","ERROR: files is not upload, "+status,{timeout:1000});
            })
    }
    /**
     * create manual row for new order
     * @param id
     * @param price
     * @private
     */
    function _createManualRow(id,price){

        var params={
            orderId : id,
            price   : price
        };
        //console.log("row params",params);
        RestFactory.request(config.API.host+"order/create-manual-row","POST",params).then(
            function(response){
                //  console.log("create-manual-row",response);
                if(response==null){
                    messageCenterService.add("danger","Row is not created",{timeout:1000});
                }
            }
        );
    }

    /**
     * close modal window without creating order
     */
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
                url,
                data;
            /**
             * get type China/Guangzhou
             */
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
             * get payment type for orders
             */
            $scope.$watch('types',function(val){
                console.log("watch",val);
                if(val){
                    _getPaymentType();
                }
            });
            /**
             * get payment Type
             * @private
             */
            function _getPaymentType(){
                var index=_.findIndex($rootScope.types,{'entity':'payment','name':'Order'});
                if(index!=-1){
                    $scope.paymentType=$rootScope.types[index];
                }
                console.log(index,$scope.paymentType);
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

            /**
             * get current type
             * @private
             */
            /*function _currentType(){
                console.log("type",$scope.type);
                angular.forEach($scope.type,function(value){

                    if(value.id==$scope.order.order.type){
                        $scope.currentType= value;
                    }
                });
            };*/

            $scope.statusTemplates = {
                0:'<span class="label label-info">Draft</span>',
                1:'<span class="label label-danger">Send to factory</span>',
                2:'<span class="label label-success">Cancelled</span>',
                3:'<span class="label label-warning">Finished</span>'
            };
            /**
             *  set title
             * @type {string}
             */
            $rootScope.documentTitle = 'Order #'+ id;
            /**
             * canceled order
             */
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
                                $scope.order.order.status=response.status;
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
                    $scope.price=response.order.orderedTotal;
                    //$scope.files=response.files;
                    setFlag($scope.order.order.status);
                    _getProductRows();
                    angular.forEach($scope.type,function(value,index){
                        //console.log(value.id==$scope.order.order.type,value.id,$scope.order.order.type);
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
             * @private
             */
            function _getProductRows(){
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
            }
            /**
             * Update ordered Total value
             *
             * @param object order
             */
            $scope.totalUpdate = function(price) {

                // ENTER
                if(event.keyCode == 13) {
                    if(price == ""){
                        messageCenterService.add("danger", "Ordered total can not be empty",{timeout:3000});
                        return;
                    }
                    /*RestFactory.request(config.API.host+"/order/update","PUT",{
                        id:             order.id,
                        orderedTotal:   order.orderedTotal
                    }).then(function(response){

                            if(_.isObject(response)){
                                messageCenterService.add("success", "Ordered total updated",{timeout:3000});
                            }
                            else{
                                messageCenterService.add("danger", "Ordered total is not updated",{timeout:3000});
                            }
                        }
                    )}*/
                    RestFactory.request(config.API.host+"order/update-row","PUT",{
                        id          :   $scope.orderProducts[0].id,
                        price       :   price,
                        size        :   $scope.orderProducts[0].size
                    }).then(function(response){

                        if(_.isObject(response)){
                            messageCenterService.add("success", "Ordered total updated",{timeout:3000});
                            _getProductRows();
                        }
                        else{
                            messageCenterService.add("danger", "Ordered total is not updated",{timeout:3000});
                        }
                    }
                    )}
            };
/*
            $scope.saveProduct=function(event,product,model){

                if(event.keyCode==13) {

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
            };*/
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
            /**
             * imagePath for products
             * @type {string}
             */
            $scope.imagePath=config.API.imagehost+'/files/factory/attachments/';
            /**
             * table header for products
             * @type {{name: string, title: string}[]}
             */
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

                   // url=config.API.host+'order/send-to-factory/id/'+id;//update status
                    url=config.API.host+'order/update';//update status
                    RestFactory.request(url,"PUT",{id:id,status:1}).then(
                        function(response){
                            console.log("send to factory",response);
                            if(response.status=='1'){
                                messageCenterService.add('success', 'Order sended', {timeout: 3000});
                                $scope.order.order.status=response.status;
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

                        $scope.title="Ask for payment";

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

                modalInstance.result.then(function(payment) {
                    var CO=JSON.parse(localStorage['user']).settings.cashierOffice;
                    var cashierId=JSON.parse(localStorage['user']).id;
                    url = config.API.host + 'payment/create';
                    data = {
                        documentId          :   id,
                        currencyId          :   $scope.order.currency.id,
                        cashierId           :   cashierId,
                        cashierOfficeId     :   parseInt(CO),
                        paymentType         :   "payment",
                        paymentMethod       :   "bank",
                        paymentDocumentType :   $scope.paymentType.typeId,
                        amount              :   payment.amount,
                        note                :   payment.note
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

                if(!_.isUndefined(value) && $scope.uploadFlag){
                    console.log(value);
                    runUpload();
                }
            });
            /**
             * upload files
             */
            function runUpload(){
                $scope.uploadFlag=false;
                var fd = new FormData();
                fd.append("id",id);
                angular.forEach($scope.files, function(file){
                    fd.append('file[]', file);
                });
                url = config.API.host + "order/loadfiles";
                $http.post(url,fd,
                    {
                        transformRequest: angular.identity,
                        headers: {'Content-Type': undefined}
                    })
                    .success(function(data,status){
                        console.log("data upload",data);
                        if(_.isArray(data)){
                            messageCenterService.add('success', 'Files uploaded', {timeout: 3000});
                            for(var i=0,length=data.length;i<length;i++){
                                $scope.order.files.push(data[i]);
                            }
                            $scope.files=undefined;
                        }
                        else{
                            messageCenterService.add('danger', 'Download failed: '+data, {timeout: 3000});
                        }
                    })
                    .error(function(data,status){
                        messageCenterService.add('danger', 'Error: '+data+" "+status, {timeout: 3000});
                    })
            }

            /*$scope.removeFiles=function(name){

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
            }*/

        }]);
