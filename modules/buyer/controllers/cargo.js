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
            var length,row,
                data,
                url,
                filter={},
                array;
            $scope.data=[];
            $scope.date=[];
            /* Loading factories */
            RestFactory.request(config.API.host + "factory/load")
                .then(function(response){
                    var factory = [];
                    for( var i in response ){
                        factory.push( { id: response[i].factory.id, name: response[i].factory.name } );
                    }
                    $scope.Factory=factory;
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
                   // console.log($scope.orderPaymentStatus);
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
                      console.log(response);
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
                //console.log(length);
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
                                        //console.log(item);
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
             * filters*/
           $scope.$watchCollection('resultData',function(newVal){

                //console.log(newVal);
                for(item in newVal){
                    var arr=[];

                    if($.isEmptyObject(newVal[item])){

                        delete filter[item];
                    }
                    else{
                        angular.forEach(newVal[item],function(value,key){


                            if(value.ticked ===true){
                                //console.log(value);
                                if(value.id){
                                    arr.push(value.id);
                                }
                                else{
                                    arr.push(value.statusId);
                                }
                                filter[item]=arr;
                                //console.log(value[0]);
                            }

                        });
                    }
                }
                //console.log(filter);
                if(!$.isEmptyObject(filter)){

                    url=config.API.host+"cargo/load/";

                    if(filter.orderPayment){

                        url+="status/"+filter.orderPayment.join()+"/";
                    }
                    if(filter.factory){

                        url+="factoryId/"+filter.factory.join()+"/";
                    }

                    console.log(url);


                    RestFactory.request(url)
                        .then(
                        function(response){
                            $scope.cargo=composeCargo(response);
                            //console.log(response);
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
                console.log($rootScope.row);
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
                console.log($rootScope.cart);
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
                        //console.log(response);
                        if(typeof(response)=='object'){
                            $rootScope.new_cargo=response;
                            var id=response.cargo.id;
                            //console.log("id",id);
                            url=config.API.host+"cargo/getorders/cargoId/"+id+"/factoryId/"+obj.id;
                            /*get factory orders for new Cargo*/
                            RestFactory.request(url)
                                .then(function(response){
                                   // console.log(url);
                                    //console.log(response);
                                    $rootScope.factoryOrders=response;
                                    factoryOrders();
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
        //console.log(obj);
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


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){

            var length,factory;

            if($rootScope.cart==undefined){
                $location.path("/buyer/cargo");
            }
            else{
               // console.log($rootScope.cart);
                $scope.cargo_cart=[];

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


                });
               // console.log($scope.cargo_cart);
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

            $scope.sendShipment = function(){
                modalWindow=$modal.open({
                    templateUrl: "/modules/buyer/views/cargo/send_shipment.html",
                    controller: 'CargoController',
                    backdrop:'static',
                    size:'sm'
                });
            };



        }]);

app.controller('CargoItemsController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "RestFactory",

        function ($scope, $rootScope, $modal, $location, RestFactory){

            var items=[],length, item_length,url,data;



            $scope.cargo_order_row=[];

            if($rootScope.items==undefined&&$rootScope.newcargo_items==undefined){
                $location.path("/buyer/cargo");
            }
            else{
                if($rootScope.items!=null){
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
                        items[item_index].photo="http://back95.ru/f/catalogue/"+items_array[j].product.id+"/"+items_array[j].product.photos[0];
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


            /**
             * add new size and count in product
             */
            $scope.newSize=function(){

            //console.log($rootScope.row);
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
            /**
             * Get all products and add product in cargo
             */
            $scope.addNewProducts=function(){
               /* url="http://b.dr.dev95.ru/legacy/jsonrpc/?method=catalogue.getProducts&params%5Btokien_id%5D=5f77e685beaa564fd3585738d65108c4";

                RestFactory.request(url).then(
                    function(response){
                        console.log(response);
                    },
                    function(error){
                        console.log(error);
                    }
                );*/
                var modalInstance =$modal.open({
                    templateUrl: "/modules/buyer/views/cargo/new_product.html",
                    controller: 'NewProductController',
                    backdrop:'static'
                });
            };


            $scope.buttons=[{
                 class:"btn btn-success",
                 value:"add",
                 icon:"fa fa-plus"
            }];

            /**
             * Add to cargo
             */
            $scope.buttonAction=function(){
                var number=0;
                length=$scope.cargo_items.length;
                if(length>1){
                    for(var i=0;i<length;i++){
                        if($rootScope.row.article==$rootScope.newcargo_items[i].product.articul){
                            number=i;
                            break;

                        }
                    }

                }
                /*console.log($rootScope.newcargo_items);
                console.log($rootScope.row);
                console.log($rootScope.new_cargo);*/
                url=config.API.host+"/cargo/addtocargo";
                length=$rootScope.row.size_list.length;
                if(length>1){
                    for(var i=0;i<length;i++){

                        data={
                            'cargoId': $rootScope.new_cargo.cargo.id,
                            'docId': $rootScope.newcargo_items[number].id,//orderid
                            'sizeId' : $rootScope.row.size_list[i].id,
                            'id' : $rootScope.newcargo_items[number].product.id,//id prod
                            'articul' : $rootScope.newcargo_items[number].product.articul,
                            'factoryArticul' : $rootScope.newcargo_items[number].product.factoryArticul,
                            'count' :$rootScope.row.count_list[i].value,
                            'price' : $rootScope.newcargo_items[number].price
                        };

                        RestFactory.request(url,'POST',data).then(
                            function(response){
                                //console.log(response);
                                if(response){
                                    $scope.cargo_order_row.push({
                                        "article":$rootScope.row.article,
                                        "size_list":$rootScope.row.size_list[i],
                                        "count_list":$rootScope.row.count_list[i],
                                        "photo":$rootScope.row.photo,
                                        "active":''
                                    });
                                }
                            }
                        )
                    }
                    $scope.cargo_items.splice(number,1);

                }
                else{

                    data={
                        'cargoId': $rootScope.new_cargo.cargo.id,
                        'docId': $rootScope.newcargo_items[number].id,//orderid
                        'sizeId' : $rootScope.row.size_list[0].id,
                        'id' : $rootScope.newcargo_items[number].product.id,//id prod
                        'articul' : $rootScope.newcargo_items[number].product.articul,
                        'factoryArticul' : $rootScope.newcargo_items[number].product.factoryArticul,
                        'count' :$rootScope.row.count_list[0].value,
                        'price' : $rootScope.newcargo_items[number].price
                    };
                    RestFactory.request(url,'POST',data).then(
                        function(response){

                            if(response){
                                $scope.cargo_order_row.push($rootScope.row);
                                $scope.cargo_items.splice(number,1);
                            }
                        }
                    )
                }
            };
        }]);

app.controller('NewProductController',function($scope,$modalInstance, RestFactory,$modal){

    /*RestFactory.request()
        .then(function(response){
            $scope.all_products=response;
        });*/

    $scope.save=function(obj){
        console.log(obj);
        $modalInstance.close();
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