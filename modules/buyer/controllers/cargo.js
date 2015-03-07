var app = angular.module("modules.buyer.cargo", [

]);

app.controller('CargoController',

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

            // add date range to daterangepicker
            $scope.date = {startDate: null, endDate: null};

            var length,row,
                data,
                url,
                filter={},
                array;
            $scope.data=[];
            /* Loading factories */
            RestFactory.request(config.API.host + "factory/load")
                .then(function(response){
                    var factory = [];
                    for( var i in response ){
                        factory.push( { id: response[i].factory.id, name: response[i].factory.name } );
                    }
                    $scope.Factory=factory;
                    $rootScope.all_factories=factory;
                });
            /**
             * get all sizes
             */
            RestFactory.request(config.API.host+'size/load').then(
                function(response){
                    $rootScope.all_sizes=response;
                }
            );
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
                    //console.log($scope.orderPaymentStatus);
                });

            /* Getting cargo */
            $rootScope.documentTitle = "Cargo cart";
            $scope.tableHeader = [
                { name: "id", title: 'Document' },
                { name: "document", title: 'Cargo Document' },
                { name: "createDate", title: 'Create date' },
                { name: "status", title: 'Status' },
                { name: "factory", title: 'Factory' }
            ];

             RestFactory.request(config.API.host + "cargo/load")

                 .then(function(response){
                     if(response){
                         $scope.allCargo=response;
                         $scope.data=composeCargo(response);
                         $scope.cargo=$scope.data;
                     }
                 },function(error){
                     console.log(error);
                 });

            function composeCargo(response){
                length=response.length;

                array=[];

                for(var i=0;i<length;i++){
                    data={};
                    angular.forEach(response[i],function(item,k){
                        if(k=='cargo'){
                            angular.forEach(item,function(value,key){
                                if(key=='createDate'||key=='id'||key=='document'){
                                    data[key]=value;
                                    // $scope.date.push(item['createDate']);
                                }
                                if(key=='status'){

                                    if($scope.orderPaymentStatus){
                                        data[key]=$scope.orderPaymentStatus[value].name;
                                    }
                                    else{
                                        data[key]=value;
                                    }

                                }
                            })
                        }
                        if(k=='factory'){
                            angular.forEach(item,function(value,key){
                                if(key=='name'){
                                    data[k]=value;
                                }
                            })
                        }
                    });
                    array.push(data);
                }
                //$scope.cargo=$scope.data;
                return array;
            }

             /*
             * filters
             * */
           $scope.$watchCollection('resultData', function(newVal) {

               // Filter dateRange

               if(typeof newVal !== "undefined")
               {
                   if(newVal.hasOwnProperty('createDate')) {

                       var dateRange = newVal.createDate;
                       var arr = [];
                       for(item in dateRange) {
                           arr.push(moment(dateRange[item]).format('YYYY-MM-DD'));
                       }
                       filter.createDate = arr;
                   }
               }

                   for(item in newVal) {
                       var arr=[];

                       if($.isEmptyObject(newVal[item])){

                           delete filter[item];
                       }
                       else{
                           angular.forEach(newVal[item],function(value, key) {

                               if(value.ticked ===true){

                                   if(value.id){
                                       arr.push(value.id);
                                   }
                                   else{
                                       arr.push(value.statusId);
                                   }
                                   filter[item]=arr;
                               }
                           });
                       }
                   }

                if(!$.isEmptyObject(filter)){

                    url=config.API.host+"cargo/load/";

                    if(filter.orderPayment){

                        url+="status/"+filter.orderPayment.join()+"/";
                    }
                    if(filter.factory){

                        url+="factoryId/"+filter.factory.join()+"/";
                    }
                    if(filter.createDate) {

                        url+="createDate/"+filter.createDate.join(',')+"/";
                    }

                    //console.log('URL:', url);

                    RestFactory.request(url)
                        .then(
                        function(response){
                            $scope.cargo=composeCargo(response);
                            console.log(response);
                        },
                        function(error){
                            console.log(error);
                        });
                }
                else{
                    $scope.cargo=$scope.data;
                }
            });



           $scope.edit = function () {
                //console.log($rootScope.row);
                length=$scope.allCargo.length;
                row=undefined;
                for(var i=0;i<length;i++){

                    if(row!=undefined){
                        break;
                    }

                    angular.forEach($scope.allCargo[i],function(value,key){
                        if(key=='cargo'){
                            //console.log($scope.allCargo[i]);
                            if(value.createDate==$rootScope.row.createDate&&value.id==$rootScope.row.id){
                               // console.log($scope.allCargo[i]);
                                row=$scope.allCargo[i];
                                $rootScope.cart=row;
                            }
                        }
                    })
                }
               $location.path( '/buyer/cargo/cargo_cart');
           };


            /* bulding new cargo*/
            $scope.addNewCargo=function(){

                var modalInstance =$modal.open({
                    templateUrl: "/modules/buyer/views/cargo/new_cargo.html",
                    controller: 'NewCargoController',
                    backdrop:'static',
                    resolve:{
                        Factory:function(){
                            return $scope.Factory;
                        }
                    }
                });
            };

        }]);

app.controller('NewCargoController',

        function($scope, $rootScope, $modalInstance, Factory, RestFactory, $modal){

            $scope.Factory= Factory;
            var url;
            $scope.saveFactory=function(obj){
                //console.log(obj.id);
                $rootScope.selectedFactory=obj;
                $modalInstance.close();

               url=config.API.host+"cargo/create";
                var data= {
                    'parentId' : 0,
                    'factoryId': obj.id,
                    'document': 0,
                    'status':0,
                    'logisticCompanyId':0,
                    'employeeId': 1,
                    'shippingDate': '2015-04-01',
                    'incomeWeight': 0,
                    'incomePlaces': 0,
                    'arriveWeight': 0,
                    'arrivePlaces': 0
                };
                var method='POST';
                RestFactory.request(url,method,data)
                    .then(function(response){
                        //console.log("new cargo",response);
                        if(typeof(response)=='object'){
                            $rootScope.new_cargo=response;
                            var id=response.cargo.id;
                            //console.log("id",id);
                            url=config.API.host+"cargo/getorders/cargoId/"+id+"/factoryId/"+obj.id;
                            /*get factory orders for new Cargo*/
                            RestFactory.request(url)
                                .then(function(response){
                                    console.log(url);
                                    console.log(response);
                                    if(response){
                                        $rootScope.factoryOrders=response;
                                        factoryOrders();
                                    }

                                });
                        }
                        else{
                            console.log(response);
                        }
                    },function(error){
                            console.log(error);
                    });
            };

            function factoryOrders(){
                var modalInstance =$modal.open({
                    templateUrl: "/modules/buyer/views/cargo/factory_orders.html",
                    controller: "CargoOrdersController",
                    backdrop:'static'

                });
            }

            $scope.cancel = function () {
                $modalInstance.dismiss();
            };
        }
);
app.controller("CargoOrdersController",function($scope,$rootScope,RestFactory,$location,$modalInstance){

    $scope.factory=$rootScope.selectedFactory;
    $scope.orders=$rootScope.factoryOrders;
    $scope.products=[];
    var length=$scope.orders.length;
    var url;
    for(var i=0;i<length;i++){

        url=config.API.host+"order/get-rows/id/"+$scope.orders[i].id;
        //console.log(url);
        RestFactory.request(url)
            .then(function(response){
               // console.log(response);
                $scope.products.push(response);
            });
    }

    $scope.choose=function(obj){
       /* console.log("order",obj[0].id);
        console.log("this",$scope.orders[0].oneProduct[0].id);*/
            for(var i=0;i<$scope.orders.length;i++){
                if(obj[0].id==$scope.orders[i].oneProduct[0].id){
                    $rootScope.order_id=$scope.orders[i].id;
                    //return;
                }
            }
            console.log("this",$rootScope.order_id);


        $rootScope.newcargo_items=obj;
        $modalInstance.close();
        $location.path("/buyer/cargo/cargo_items");

    };

    $scope.ok = function () {
        $modalInstance.close();
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
});

app.controller('CargoCartController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",
        "CargoCalculator",
        'messageCenterService',
        function ($scope, $rootScope, $modal, $location, $route, RestFactory, CargoCalculator, messageCenterService){

            var length,factory;

            if($rootScope.cart==undefined){
                $location.path("/buyer/cargo");
            }
            else
            {
                $scope.cargo_cart=[];
                $scope.logistic_companies = [];

                /**
                 * Global cargo object
                 * @type {{object}} to save cargo
                 */
                $rootScope.cargo = {};

                // Calc total amount
                $rootScope.totalAmount = CargoCalculator.calcTotalAmount($rootScope.cart.products);

                RestFactory.request(config.API.host + "logistic_company/load")
                    .then(function(response){
                        angular.forEach(response, function(value){

                            $scope.logistic_companies.push({
                                'value' : value.id,
                                'label' : value.name
                            });
                        });
                    });
                angular.forEach($rootScope.cart,function(value,key){

                    if(key=='factory'){
                        factory=value.name;
                    }
                    if(key=='products'){
                        length=value.length;

                        for(var i=0;i<length;i++){

                            $scope.cargo_cart.push({
                                "photo":"/assets/images/avatar/avatar18.jpg",
                                "article":value[i].articul,
                                "size":value[i].size,
                                "count":value[i].count,
                                "factory":factory
                            });
                        }
                    }
                    if(key=='cargo'){
                        // Присваиваем по умолчанию для формы сохранения cargo
                        $rootScope.cargo.document = value.document;
                        $rootScope.cargo.id          = value.id;
                        $rootScope.cargo.arriveWeight = value.arriveWeight;
                        $rootScope.cargo.arrivePlaces = value.arrivePlaces;
                        $rootScope.cargo.incomeWeight = value.incomeWeight;
                        $rootScope.cargo.incomePlaces = value.incomePlaces;

                        if($rootScope.cargo.hasOwnProperty('insurance') === false) {
                            $rootScope.cargo.insurance = 0;
                        }
                    }
                });
            }

            /* Getting cargo */
            $rootScope.documentTitle = "Cargo";
            $scope.tableHeader = [
                { name: "photo", title: 'photo' },
                { name: "article", title: 'Article/Name' },
                { name: "size", title: 'Size' },
                { name: "count", title: 'Count' },
                { name: "factory", title: 'Factory' }
            ];

            $scope.addNewItems = function(){
                $rootScope.items=$scope.cargo_cart;
                $location.path( '/buyer/cargo/cargo_items');
            };

            /**
             * Save cargo
             */
            $scope.saveCargo = function() {

                RestFactory.request(config.API.host + "cargo/update", 'PUT', $.param($rootScope.cargo), 'default')
                    .then(function(response){

                        if(response) {
                            messageCenterService.add('success', 'The cargo has been successfully saved', { timeout: 3000 });

                            //modalWindow.close();
                        }
                        else {
                            messageCenterService.add('danger', 'Failed to save order', { timeout: 3000 });
                        }
                    }, function() {
                        messageCenterService.add('danger', 'Undefined error', { timeout: 3000 });
                    });
            };

            /**
             * Ship cargo
             */
            $scope.sendShipment = function(){

                if (typeof $scope.id != 'undefined'
                    && typeof $scope.arriveWeight != 'undefined'
                    && typeof $scope.arrivePlaces != 'undefined') {

                    // send mail

                    var params = {
                        'id'        : $scope.id,
                        'arriveWeight'   : $scope.arriveWeight,
                        'arrivePlaces'   : $scope.arrivePlaces
                    };

                    RestFactory.request(config.API.host + "cargo/ship", 'PUT', $.param(params), 'default')
                        .then(function(response){

                            if(response.status === true) {
                                messageCenterService.add('success', response.message, { timeout: 3000 });

                                modalWindow.close();
                            }
                            else {
                                messageCenterService.add('danger', response.message, { timeout: 3000 });
                            }

                        }, function() {
                            messageCenterService.add('danger', 'Undefined error', { timeout: 3000 });
                        });
                }
                else {

                    //show modal
                    modalWindow=$modal.open({
                        templateUrl: "/modules/buyer/views/cargo/send_shipment.html",
                        controller: 'CargoController',
                        backdrop:'static',
                        size:'md'
                    });
                }
            };

            /**
             * Cancel cargo action
             */
            $scope.cargoCancel = function(){

                if (typeof $scope.id != 'undefined'
                    && typeof $scope.message != 'undefined') {

                    // send mail

                    var params = {
                        'id'        : $scope.id,
                        'message'   : $scope.message
                    };

                    RestFactory.request(config.API.host + "cargo/cancel", 'PUT', $.param(params), 'default')
                        .then(function(response){

                            if(response.status  > 0) {
                                messageCenterService.add('success', response.message, { timeout: 3000 });

                                modalWindow.close();
                            }
                            else {
                                messageCenterService.add('danger', response.message, { timeout: 3000 });
                            }

                        }, function() {
                            messageCenterService.add('danger', 'Undefined error', { timeout: 3000 });
                        });

                }
                else {
                    //show modal
                    modalWindow = $modal.open({
                        templateUrl: "/modules/buyer/views/cargo/cancel_cargo.html",
                        controller: 'CargoController',
                        backdrop:'static',
                        size:'sm'
                    });
                }
            };

        }]);

app.controller('CargoItemsController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "RestFactory",
        "$http",
        'CargoCalculator',
        "messageCenterService",
        "$q",
        function ($scope, $rootScope, $modal, $location, RestFactory,$http, CargoCalculator,messageCenterService, $q){

            var items=[],length, item_length,url,data;



            $scope.cargo_order_row=[];

            if($rootScope.items==undefined&&$rootScope.newcargo_items==undefined){
                $location.path("/buyer/cargo");
            }
            else{
               // console.log($rootScope.items);
                if (typeof $rootScope.items != 'undefined'&&$rootScope.items.length>0) {
                   // if($rootScope.items!=null||$rootScope.items.length>0){
                    //console.log($rootScope.items);
                    composeItems($rootScope.items);
                }

                if($rootScope.newcargo_items!=null){
                    console.log($rootScope.newcargo_items);
                    composeNewCargo($rootScope.newcargo_items);
                }
            }


            //compose items
            function composeItems(items_array,articul){
                var tmp=[],item_index;
                var article=articul||items_array[0].article;

                length=items_array.length;
                item_length=items.length;

                if(item_length!=0){
                    for(var i=0;i<item_length;i++){
                       if(items[i].article==article){
                            console.log(items[i].article,article,"true");
                            item_index=i;
                       }
                    }
                }
                if(item_index==undefined){
                    items.push(
                        {
                            "article":article,
                            "size_list":[],
                            "count_list":[],
                            "photo":"",
                            "active":'inactive'
                        }
                    );
                    item_length=items.length;
                    item_index=item_length-1;
                }
                for(var j=0;j<length;j++){

                    if(items[item_index].article==items_array[j].article){
                        var size_id;
                        for(var k=0;k<$rootScope.all_sizes.length;k++){

                            if($rootScope.all_sizes[k].name==items_array[j].size){
                                size_id=$rootScope.all_sizes[k].id;
                            }
                        }

                        items[item_index].size_list.push(
                            {
                                "value":items_array[j].size,
                                "id":size_id
                            }
                        );
                        items[item_index].count_list.push(
                            {"value":items_array[j].count}
                        );
                        items[item_index].photo=items_array[j].photo;
                        items[item_index].active='';

                    }else{
                        tmp.push(items_array[j]);
                    }
                }
                if(tmp.length!=0) {
                    composeItems(tmp);
                }
                else{
                    $scope.cargo_items=items;
                }
            }
            //compose new cargo items
            function composeNewCargo(items_array,articul){
                var tmp=[],item_index;
                if(items_array[0].product==undefined){
                    return
                }
                var article=articul||items_array[0].product.articul;

                length=items_array.length;
                item_length=items.length;

                if(item_length!=0){
                    for(var i=0;i<item_length;i++){
                        if(items[i].article==article){
                            item_index=i;
                        }
                    }
                }
                if(item_index==undefined){
                    items.push(
                        {
                            "article":article,
                            "size_list":[],
                            "count_list":[],
                            "photo":"",
                            "active":''
                        }
                    );
                    item_length=items.length;
                    item_index=item_length-1;
                }
                for(var j=0;j<length;j++){
                    var size_id;
                    for(var k=0;k<$rootScope.all_sizes.length;k++){

                        if($rootScope.all_sizes[k].name==items_array[j].size){
                            size_id=$rootScope.all_sizes[k].id;
                        }
                    }

                    if(items[item_index].article==items_array[j].product.articul){

                        items[item_index].size_list.push(
                            {
                                "value":items_array[j].size,
                                "id":size_id
                            }
                        );

                        items[item_index].count_list.push(
                            {"value":items_array[j].count}
                        );
                        items[item_index].photo="http://back95.ru/f/p/g/60x60/catalogue/"+items_array[j].product.id+"/"+items_array[j].product.photos[0];
                        items[item_index].active='';

                    }else{
                        tmp.push(items_array[j]);
                    }
                }
                if(tmp.length!=0) {
                    composeNewCargo(tmp);
                }
                else{
                    $scope.cargo_items=items;
                }
            }

            function composeNewProduct(items_array,articul){
                var tmp=[],item_index;
                var article=articul||items_array[0].articul;
               // console.log(article);
                length=items_array.length;
                item_length=items.length;

                if(item_length!=0){
                    for(var i=0;i<item_length;i++){
                        if(items[i].article==article){
                            item_index=i;
                        }
                    }
                }
                if(item_index==undefined){
                    items.push(
                        {
                            "article":article,
                            "size_list":[],
                            "count_list":[],
                            "photo":"",
                            "active":''
                        }
                    );
                    item_length=items.length;
                    item_index=item_length-1;
                }
                for(var j=0;j<length;j++){
                    var size_id;
                    if(items_array[j].size){

                    for(var k=0;k<$rootScope.all_sizes.length;k++){

                        if($rootScope.all_sizes[k].name==items_array[j].size){
                            size_id=$rootScope.all_sizes[k].id;
                        }
                        }

                        items[item_index].size_list.push(
                            {
                                "value":items_array[j].size,
                                "id":size_id
                            }
                        );

                        items[item_index].count_list.push(
                            {"value":items_array[j].count}
                        );



                    }
                    else{
                        for(var k=0;k<$rootScope.all_sizes.length;k++){

                            angular.forEach(items_array[j].sizeInfo,function(value,key){
                                if(key==$rootScope.all_sizes[k].name){

                                    size_id=$rootScope.all_sizes[k].id;
                                    items[item_index].size_list.push(
                                        {
                                            "value":key,
                                            "id":size_id
                                        }
                                    );
                                    items[item_index].count_list.push(
                                        {"value":0}
                                    );
                                }
                            });
                        }
                    }
                    //}
                    if(items[item_index].article==items_array[j].articul){


                        if(items_array[j].photos){
                            items[item_index].photo="http://back95.ru/f/p/g/60x60/catalogue/"+items_array[j].id+"/"+items_array[j].photos[0];
                        }
                        items[item_index].active='';

                    }else{
                        tmp.push(items_array[j]);
                    }
                }
                if(tmp.length!=0) {
                    composeNewProduct(tmp);
                }
                else{
                    $scope.cargo_items=items;
                }
            }

            /**
             * add new size and count in product
             */
            $scope.newSize=function(){

            /*console.log($rootScope.row);
            console.log($rootScope.all_sizes);*/

                var modalInstance=$modal.open(
                    {
                        templateUrl:"/modules/buyer/views/cargo/add_size.html",
                        controller:'NewSizeController',
                        backdrop:'static'
                    }
                );
                modalInstance.result.then(function (obj) {
                    if(obj.size==undefined||obj.count==undefined){
                        return;
                    }
                    console.log($scope.cargo_items);
                    length=$scope.cargo_items.length;
                    for(var i=0;i<length;i++){
                        if($scope.cargo_items[i].article==$rootScope.row.article){
                            $scope.cargo_items[i].size_list.push({
                               "value": obj.size.name,
                                "id":obj.size.id
                            });
                            $scope.cargo_items[i].count_list.push({
                                "value":obj.count
                            });
                        }
                    }
                }, function (error) {
                   console.log(error);
                });
            };

            /* Getting cargo */
            $rootScope.documentTitle = "Cargo cart";
            $scope.tableHeader = [
                { name: "photo", title: 'Photo' },
                { name: "article", title: 'Articul/name' },
                { name: "size_list", title: 'Size' },
                { name: "count_list", title: 'Count' }
            ];

            $scope.buttons=[{
                class:"btn btn-success",
                value:"add",
                icon:"fa fa-plus"
            }];
            /**
             * Get all products and add product in cargo
             */
            $scope.addNewProducts=function() {

                 var modalInstance =$modal.open({
                 templateUrl: "/modules/buyer/views/cargo/new_product.html",
                 controller: 'NewProductController',
                 backdrop:'static'
                 });
                 modalInstance.result.then(function (articul){
                    console.log(articul);
                    if(articul){
                        url=config.API.jsonp+'?params[articul]='+articul;
                        console.log(config.API.jsonp);
                        RestFactory.request(url).then(
                            function (response) {

                                if(response.result){

                                    var result=JSON.parse(response.result).products;
                                    var resolveData = CargoCalculator.resolveResponse(result);
                                    console.log(resolveData);
                                    if($scope.cargo_items!=undefined){
                                        $scope.cargo_items.push(resolveData[0]);
                                    }
                                    else{
                                        $scope.cargo_items=resolveData;
                                    }


                                    if($rootScope.newcargo_items){
                                        for(var i;i<response.length;i++){
                                            $rootScope.newcargo_items.push(result);
                                        }
                                    }
                                    else{
                                        //$rootScope.newcargo_items=result;
                                        angular.forEach(result,function(value,key){
                                            $rootScope.newcargo_items=[];
                                            $rootScope.newcargo_items.push(value);
                                        })
                                    }
                                    //composeNewProduct(result);
                                }
                                else{

                                    var modal =$modal.open({
                                        templateUrl: "/modules/buyer/views/cargo/ask.html",
                                        controller: 'NewProductController',
                                        backdrop:'static'
                                    });
                                    modal.result.then(function(){
                                        var modalInstance=$modal.open({
                                         templateUrl: "/modules/buyer/views/cargo/create_product_item.html",
                                         controller: 'AddProductController',
                                         backdrop:'static',
                                         size:'md'
                                         });
                                        /*modal.result.then(function(obj){
                                            console.log("this",obj);
                                        });*/
                                    });

                                }
                            }
                        )
                    }

                 })
            };

            $scope.$watch('tmp',function(value){
                console.log("tmp",$scope.cargo_items,value);
                if(value!=undefined){
                    if($scope.cargo_items!=undefined){

                        $scope.cargo_items.push(value[0]);
                    }
                    else{
                        $scope.cargo_items=value;
                    }

                }
            });


                $scope.buttonAction=function(){

                    var modalInstance=$modal.open({
                        templateUrl: "/modules/buyer/views/cargo/change_factory.html",
                        controller: 'ChangeFactoryController',
                        backdrop:'static',
                        size:'md'
                    });
                    modalInstance.result.then(
                        function(changed_factory){
                            //console.log("this",changed_factory);
                           // $rootScope.new_cargo=response;
                             var id=$rootScope.cart.cargo.id;
                             //console.log("id",id);
                             url=config.API.host+"cargo/getorders/cargoId/"+id+"/factoryId/"+changed_factory.id;
                             //get factory orders for new Cargo
                             RestFactory.request(url)
                             .then(function(response){
                             console.log(url);
                             console.log("this",response);
                            if(typeof response !='null'){
                                $rootScope.factoryOrders=response;

                                 var modalWindow =$modal.open({
                                     templateUrl: "/modules/buyer/views/cargo/order_for_factory.html",
                                     controller: 'ChangeFactoryController',
                                     backdrop:'static'
                                 });
                                 modalWindow.result.then(
                                     function(id){
                                        $rootScope.order_id=id;
                                         console.log($rootScope.order_id);
                                         //$scope.buttonAction_two();
                                         var data=CargoCalculator.parseData();
                                         console.log(data);
                                         url=config.API.host + "cargo/addproduct";
                                         RestFactory.request(url, 'POST', data).then(
                                             function (response) {
                                                 console.log(response);
                                                 if (response!='null') {
                                                     // $scope.cargo_order_row.push($rootScope.row);
                                                    /* $scope.cargo_order_row.push({
                                                         "article": $rootScope.row.article,
                                                         "size_list": $rootScope.row.size_list[i],
                                                         "count_list": $rootScope.row.count_list[i],
                                                         "photo": $rootScope.row.photo,
                                                         "active": '',
                                                         "id":$rootScope.newcargo_items[number].id
                                                     });*/





                                                     //$scope.cargo_items.splice(number, 1);
                                                 }
                                                 else{

                                                 }
                                             }
                                         )



                                     }
                                 )
                            }

                             });




                        }
                    )
                };





                 /**
                 * Add to cargo
                 */
                $scope.buttonAction_two=function () {
                    var number = 0;
                    length = $scope.cargo_items.length;
                        console.log( $scope.cargo_items);

                    if($rootScope.newcargo_items){
                        if (length > 1) {
                            for (var i = 0; i < length; i++){
                                console.log("items", $rootScope.newcargo_items);
                                if( typeof $rootScope.newcargo_items[i].product=='object'){
                                    if ($rootScope.row.article == $rootScope.newcargo_items[i].product.articul) {
                                        number = i;
                                        break;

                                    }
                                    else{
                                        if ($rootScope.row.article == $rootScope.newcargo_items[i].articul) {
                                            number = i;
                                            break;

                                        }
                                    }
                                }

                            }

                        }
                    }



                    //url = config.API.host + "/cargo/addtocargo";
                    url = config.API.host + "cargo/addproduct";
                    length = $rootScope.row.size_list.length;
                    /*console.log("new_cargo",$rootScope.new_cargo);
                    console.log( "newcargo_items",$rootScope.newcargo_items);
                    console.log("items",$rootScope.items);
                    console.log("cart",$rootScope.cart);
                    console.log("row",$rootScope.order_id);
                    console.log("factoryOrders",$rootScope.factoryOrders);
                    console.log("row",$rootScope.order_id);*/

                   /* if($rootScope.newcargo_items==undefined){

                    }
*/

                    if($rootScope.newcargo_items!=undefined||typeof $rootScope.new_cargo == "undefined" && typeof $rootScope.newcargo_items.product=='undefined'){
                        cargoId=$rootScope.cart.cargo.id;


                        if (length > 1) {
                            for (var i = 0; i < length; i++) {

                                data = {
                                    'cargoId': $rootScope.cart.cargo.id,
                                    'orderId':$rootScope.order_id,//orderid
                                    'sizeId': $rootScope.row.size_list[i].id,
                                    //'id': $rootScope.newcargo_items[number].id,//id prod
                                    'articul': $rootScope.newcargo_items[number].articul,
                                    'productId': $rootScope.newcargo_items[number].articul,
                                    'factoryArticul': $rootScope.newcargo_items[number].vendor_articul,
                                    'count': $rootScope.row.count_list[i].value,
                                    'price': $rootScope.newcargo_items[number].price_cn
                                };

                                RestFactory.request(url, 'POST', data).then(
                                    function (response) {
                                        //console.log("response",response);
                                        if (typeof response[0]=='object') {
                                            $scope.cargo_order_row.push({
                                                "article": $rootScope.row.article,
                                                "size_list": $rootScope.row.size_list[i],
                                                "count_list": $rootScope.row.count_list[i],
                                                "photo": $rootScope.row.photo,
                                                "active": '',
                                                "id":$rootScope.newcargo_items[number].id
                                            });
                                        }
                                        else{
                                            console.log("string",response);
                                            messageCenterService.add('danger', response[0], { timeout: 3000 });
                                        }

                                    }
                                )
                            }
                            $scope.cargo_items.splice(number, 1);

                        }
                        else {

                            data = {
                                'cargoId': $rootScope.cart.cargo.id,
                                'orderId': $rootScope.order_id,//orderid
                                'sizeId': $rootScope.row.size_list[0].id,
                                //'id': $rootScope.newcargo_items[number].id,//id prod
                                'articul': $rootScope.newcargo_items[number].articul,
                                'productId': $rootScope.newcargo_items[number].articul,
                                'factoryArticul': $rootScope.newcargo_items[number].vendor_articul,
                                'count': $rootScope.row.count_list[0].value,
                                'price': $rootScope.newcargo_items[number].price_cn
                            };
                            console.log("data",data);
                            RestFactory.request(url, 'POST', data).then(
                                function (response) {
                                    console.log(response);
                                    if (response!='null') {
                                       // $scope.cargo_order_row.push($rootScope.row);
                                        $scope.cargo_order_row.push({
                                            "article": $rootScope.row.article,
                                            "size_list": $rootScope.row.size_list[i],
                                            "count_list": $rootScope.row.count_list[i],
                                            "photo": $rootScope.row.photo,
                                            "active": '',
                                            "id":$rootScope.newcargo_items[number].id
                                        });





                                        $scope.cargo_items.splice(number, 1);
                                    }
                                    else{

                                    }
                                }
                            )
                        }

                    }
                    else{
                        if (length > 1) {
                            for (var i = 0; i < length; i++) {

                                data = {
                                    'cargoId': $rootScope.new_cargo.cargo.id,
                                   // 'orderId': $rootScope.newcargo_items[number].id,//orderid
                                    'orderId': $rootScope.order_id,//orderid
                                    'sizeId': $rootScope.row.size_list[i].id,
                                    //'id': $rootScope.newcargo_items[number].product.id,//id prod
                                    'articul': $rootScope.newcargo_items[number].product.articul,
                                    'productId': $rootScope.newcargo_items[number].product.articul,
                                    'factoryArticul': $rootScope.newcargo_items[number].product.factoryArticul,
                                    'count': $rootScope.row.count_list[i].value,
                                    'price': $rootScope.newcargo_items[number].price
                                };

                                RestFactory.request(url, 'POST', data).then(
                                    function (response) {
                                        //console.log(response);
                                        if (response) {
                                            $scope.cargo_order_row.push({
                                                "article": $rootScope.row.article,
                                                "size_list": $rootScope.row.size_list[i],
                                                "count_list": $rootScope.row.count_list[i],
                                                "photo": $rootScope.row.photo,
                                                "active": '',
                                                'id': $rootScope.newcargo_items[number].product.id
                                            });
                                        }
                                    }
                                )
                            }
                            $scope.cargo_items.splice(number, 1);

                        }
                        else {

                            data = {
                                'cargoId': $rootScope.new_cargo.cargo.id,
                                //'orderId': $rootScope.newcargo_items[number].id,//orderid
                                'orderId': $rootScope.order_id,//orderid
                                'sizeId': $rootScope.row.size_list[0].id,
                                //'id': $rootScope.newcargo_items[number].product.id,//id prod
                                'articul': $rootScope.newcargo_items[number].product.articul,
                                'productId': $rootScope.newcargo_items[number].product.articul,
                                'factoryArticul': $rootScope.newcargo_items[number].product.factoryArticul,
                                'count': $rootScope.row.count_list[0].value,
                                'price': $rootScope.newcargo_items[number].price
                            };
                            RestFactory.request(url, 'POST', data).then(
                                function (response) {
                                    if (response) {
                                        console.log("response",response);
                                       // $scope.cargo_order_row.push($rootScope.row);

                                        $scope.cargo_order_row.push({
                                            "article": $rootScope.row.article,
                                            "size_list": $rootScope.row.size_list[i],
                                            "count_list": $rootScope.row.count_list[i],
                                            "photo": $rootScope.row.photo,
                                            "active": '',
                                            'id': $rootScope.newcargo_items[number].product.id
                                        });


                                        $scope.cargo_items.splice(number, 1);
                                    }
                                }
                            )
                        }
                    }
                };

            $scope.$watch('cargo_order_row',function(newVal,oldVal){
                console.log("watcher",newVal,oldVal);
            });
            /**
             * save
             */
            $scope.saveItems=function(){

                console.log("new_cargo",$rootScope.new_cargo);
                console.log( "newcargo_items",$rootScope.newcargo_items);
                console.log("items",$rootScope.items);
                console.log("cart",$rootScope.cart);
                console.log("row",$rootScope.row);

                    /*RestFactory.request(config.API.host + "cargo/update", 'POST', $.param($rootScope.cargo), 'default')
                        .then(function(response){

                            if(response) {
                                messageCenterService.add('success', 'The cargo has been successfully saved', { timeout: 3000 });

                                //modalWindow.close();
                            }
                            else {
                                messageCenterService.add('danger', 'Failed to save order', { timeout: 3000 });
                            }
                        }, function() {
                            messageCenterService.add('danger', 'Undefined error', { timeout: 3000 });
                        });*/

            };
            /**
             * delete
             */
            $scope.delete=function(row){
               // $scope.cargo_order_row;
                    console.log(row);
               /* RestFactory.request(config.API.host + "cargo/delete-product", 'DELETE', $.param($rootScope.cargo), 'default')
                    .then(function(response){

                        if(response) {
                            messageCenterService.add('success', 'The cargo has been successfully saved', { timeout: 3000 });

                            //modalWindow.close();
                        }
                        else {
                            messageCenterService.add('danger', 'Failed to save order', { timeout: 3000 });
                        }
                    }, function() {
                        messageCenterService.add('danger', 'Undefined error', { timeout: 3000 });
                    });*/
            }
            }]);


app.controller('ChangeFactoryController',function($scope,$rootScope,$modalInstance, RestFactory,$modal){

    $scope.change=function(changed_factory){
        //console.log(changed_factory);
        $modalInstance.close(changed_factory);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    $scope.choose=function(id){
        //console.log(id);
        //$rootScope.order_id=id;
        $modalInstance.close(id);
    }




});



app.controller('NewProductController',function($scope,$modalInstance, RestFactory,$modal){

    $scope.save=function(articul){
        $modalInstance.close(articul);
    };
    $scope.cancel = function () {
        $modalInstance.dismiss();
    };
    $scope.yes=function(){
        $modalInstance.close();
    };


});

app.controller('AddProductController',function($scope,$rootScope,$modalInstance, RestFactory,CargoCalculator){

    $scope.create=function(obj){
        console.log('create',obj);
        $modalInstance.close(obj);
        //var url=config.API.host+"cargo/addtocargo";

        console.log(config);
        var url=config.API.jsoncreate +'?params[params][vendor_id]='+1+'&params[params][vendor_articul]='+obj.factory_articul+'&params[params][cat_title]=Test&params[params][brand_id]='+1+'&params[params][category]='+1+'&params[params][weight]='+0+'&params[params][price]='+obj.price+'&params[params][status]=1';
       /* var data={
            cargoId:0,
            docId:0,
            sizeId:0,
            id:0,
            articul:0,
            factoryArticul:obj.factory_articul,
            count:0,
            price:obj.price
        };*/
        RestFactory.request(url).then(
            function(response){

                var result = JSON.parse(response.result).products;
                console.log(result);
                var resolveData = CargoCalculator.resolveResponse(result);

                //$scope.cargo_items=resolveData;
                $rootScope.tmp=resolveData;

                if($rootScope.newcargo_items){
                    for(var i;i<response.length;i++){
                        $rootScope.newcargo_items.push(result);
                    }
                }
                else{
                    //$rootScope.newcargo_items=result;
                    angular.forEach(result,function(value,key){
                        $rootScope.newcargo_items=[];
                        $rootScope.newcargo_items.push(value);
                    })
                }





                if(result) {

                    var url=config.API.host +'/cargo/addproduct';

                    /* var data = {
                        'productId' : result.id,
                        'articul'   : result.articul,
                        'factoryArticul': result.vendor_articul,
                        'count': ,
                        'sizeId' : ,
                        'price': ,
                        'orderId' : ,
                        'cargoId' :
                    };*/

                   /* RestFactory.request(url, 'POST', $.param()).then(
                        function(response){

                            var result = JSON.parse(response.result).products;


                            if(result) {



                            }
                        }
                    );*/

                }
            }
        );
    };

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

});




app.controller('NewSizeController',

    function($scope, $modalInstance, RestFactory){


        $scope.save=function(size,count){
            //console.log(size,count);
            $scope.newsize={
                size:size,
                count:count
            };
            $modalInstance.close($scope.newsize);
        };
        $scope.cancel = function () {
            $modalInstance.dismiss();
        };
    });

