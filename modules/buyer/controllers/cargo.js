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

        function ($scope, $rootScope, $modal, $location, $route, RestFactory) {

            $scope.$route = $route;
            $scope.$location = $location;
            $rootScope.documentTitle = 'Cargo management';
            // show header and max-sidebar
            $rootScope.hideHeader = 'showHeader';

            $scope.cargoDocuments   = [];
            $scope.factories        = [];

            RestFactory.request(config.API.host + "factory/load")
                .then(function(response){
                    for( var i in response ){
                        $scope.factories[response[i].factory.id] = { id: response[i].factory.id, name: response[i].factory.name };
                    }
                    $scope.loadCargos();
                });

            $scope.loadCargos = function(){
                RestFactory.request(config.API.host + "cargo/load")
                    .then(function(response){

                        $scope.cargoDocumentsHeader = [
                            { name: "id", title: 'ID' },
                            { name: "factory", title: 'Factory' },
                            { name: "document", title: 'Cargo document' },
                            { name: "createDate", title: 'Create date' },
                            { name: "status", title: 'Status' }
                        ];
                        for(var i in response){
                            var factoryName = ( $scope.factories[response[i].factoryId] ) ? $scope.factories[response[i].factoryId].name : '';

                            $scope.cargoDocuments.push({
                                id: response[i].id,
                                factory: factoryName,
                                document: response[i].document,
                                createDate: response[i].createDate,
                                status: response[i].status
                            });
                        }
                    });

            };

            $scope.edit = function(){
                $location.path( '/buyer/cargo/id/'+ $rootScope.row.id );
            };
            /* bulding new cargo*/
            $scope.addNewCargo = function(){

                $rootScope.modalInstance = $modal.open({
                    templateUrl: "/modules/buyer/views/cargo/new_cargo.html",
                    controller: 'CargoController',
                    backdrop:'static',
                    resolve:{
                        factories: function(){
                            return $scope.factories;
                        }
                    }
                });
            };

            $scope.createCargo = function(factory){
                var cargo = {
                    'parentId' : 0,
                    'factoryId': factory.id,
                    'document': '',
                    'status': 0,
                    'employeeId': 328
                };

                RestFactory.request(config.API.host+"cargo/create" , "POST", cargo)
                    .then(function(response){
                        console.log("new cargo", response);
                        if( response.cargo.id ){
                            $rootScope.modalInstance.close();
                            $location.path( '/buyer/cargo/id/'+ response.cargo.id );
                        }
                        else{
                            console.log(response);
                        }
                    },function(error){
                        console.log(error);
                    });
            };
        }
    ]);

app.controller('CargoDocumentController',
    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",

        function ($scope, $rootScope, $modal, $location, $route, RestFactory) {

            $scope.$route = $route;
            $scope.$location = $location;

            $scope.cargo = {};
            $scope.factory = {};
            $scope.products = [];
            $scope.logisticCompanies = [];

            $rootScope.documentTitle = 'Document #' + $route.current.params.id;

            $scope.productsTableHeader = [
                { name: "photo", title: "Preview" },
                { name: "articul", title: "Articul" },
                { name: "factoryArticul", title: "Factory articul" },
                { name: "size", title: "Size" },
                { name: "count", title: "Count" },
                { name: "price", title: "Price" }
            ];

            RestFactory.request(config.API.host + "logisticCompany/load")
                .then(function(response){
                    $scope.logisticCompanies = response;
                });


            RestFactory.request(config.API.host + "cargo/get/id/"+$route.current.params.id)
                .then(function(response){
                    $scope.cargo = response.cargo;
                    $scope.cargo.logisticCompany = $scope.getLogisticCompany();
                    $scope.factory = response.factory;
                    for( var i in response.products){
                        var product = response.products[i];
                        console.log(product);
                        $scope.products[i] = {
                            photo: 'http://back95.com/f/catalogue/'+product.productId+'/'+product.product.preview[1],
                            articul: product.product.articul,
                            factoryArticul: product.product.factoryArticul,
                            size: product.size,
                            count: product.count,
                            price: product.price,
                        };
                    }
                    console.log($scope.products);
                });

            $scope.chooseOrder = function(){
                $location.path( '/buyer/cargo/id/'+ $scope.cargo.id +'/choose-order' );
            };

            $scope.getLogisticCompany = function(){
                for( var i in $scope.logisticCompanies){
                    if($scope.cargo.logisticCompanyId == $scope.logisticCompanies[i].id){
                        return $scope.logisticCompanies[i];
                    }
                }
            };
            $scope.sendCargo = function(){
                console.log($scope.cargo);
                $rootScope.modalInstance = $modal.open({
                    templateUrl: "/modules/buyer/views/cargo/send_cargo.html",
                    controller: 'CargoDocumentController',
                    backdrop:'static',
                    resolve:{
                    }
                });
            };

            $scope.sendShipment = function(){
                console.log($scope.cargo);
                $scope.cargo.logisticCompanyId = $scope.cargo.logisticCompany.id;
                RestFactory.request(config.API.host + "cargo/ship", "PUT", $scope.cargo)
                    .then(function(response){
                        if(response.status == true ){
                            $rootScope.modalInstance.close();
                        }else {
                            console.log(response);
                        }
                    });

            };
        }
    ]);

app.controller('CargoOrderController',
    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",

        function ($scope, $rootScope, $modal, $location, $route, RestFactory) {

            $scope.$route = $route;
            $scope.$location = $location;

            $scope.cargo    = {};
            $scope.factory  = {};
            $scope.products = [];
            $scope.orders   = [];

            $rootScope.documentTitle = 'Loading...';

            RestFactory.request(config.API.host + "cargo/get/id/"+$route.current.params.id)
                .then(function(response){
                    $scope.cargo = response.cargo;
                    $scope.factory = response.factory;
                    $scope.products = response.products;

                    $rootScope.documentTitle = 'Choose order: cargo #' + $scope.cargo.id + ' ('+ $scope.factory.name +')';

                    RestFactory.request(config.API.host + "cargo/get-orders/cargoId/"+$scope.cargo.id+'/factoryId/'+$scope.cargo.factoryId)
                        .then(function(response){
                            if(response.length > 0){
                                $scope.orders = response;
                            }
                        });

                });

            $scope.selectOrder = function(orderId){
                // Attaching orderId to cargo
                $location.path( '/buyer/cargo/id/'+ $scope.cargo.id +'/order/'+orderId );
            };
        }
    ]);

app.controller('CargoOrderProductsController',
    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",

        function ($scope, $rootScope, $modal, $location, $route, RestFactory) {

            $scope.$route = $route;
            $scope.$location = $location;

            $scope.cargo            = {};
            $scope.factory          = {};
            $rootScope.products         = [];
            $scope.orders           = [];
            $scope.cargoProducts    = {};
            $scope.orderId = $scope.$route.current.params.orderId;

            $scope.productsHeader = [
                { name: "preview", title: 'Preview' },
                { name: "articul", title: 'Articul' },
                { name: "sizes", title: 'Sizes' },
            ];
            $rootScope.documentTitle = 'Loading...';


            RestFactory.request(config.API.host + "cargo/get/id/"+$route.current.params.id)
                .then(function(response){
                    $scope.cargo = response.cargo;
                    $scope.factory = response.factory;

                    $rootScope.documentTitle = 'Add products to cargo #' + $scope.cargo.id + ' ('+ $scope.factory.name +')';

                    $scope.loadProductsByOrder();
                });

            $scope.loadProductsByOrder = function(new_product){
                RestFactory.request(config.API.host + "cargo/get-order-products/cargoId/" + $scope.cargo.id + "/orderId/" + $scope.$route.current.params.orderId)
                    .then(function (response) {
                        if (response.length > 0) {
                            $rootScope.products = $scope.groupByProductId(response);
                            console.log($rootScope.products);
                        }
                    });
            };

            $scope.groupByProductId = function(productsArray){
                var products = {};
                for( var i in productsArray){
                    var product = productsArray[i];
                    if(products[product.productId] == undefined ){
                        products[product.productId] = {
                            id: product.productId,
                            articul: product.product.articul,
                            factoryArticul: product.product.factoryArticul,
                            title: product.product.title,
                            brand: product.product.brand,
                            preview: product.product.preview,
                            price: product.price,
                            sizes: {}
                        };
                    }
                    products[product.productId].sizes[product.size] = {
                        size: product.size,
                        count: product.count,
                        price: product.price,
                        custom: 0
                    };
                }
                return products;
            };

            $scope.addProductSize = function(productId, size, count, price, custom) {
                var key = productId + '.' + size;
                $scope.cargoProducts[key] = {
                    productId: productId,
                    size: size,
                    count: count
                };
                if(custom){
                    $rootScope.products[productId].sizes[size] = {
                        size: size,
                        count: count,
                        price: price,
                        custom: 0
                    };
                    delete $rootScope.products[productId].sizes[''];
                }
                var product = {
                    cargoId: $scope.cargo.id,
                    orderId: $scope.orderId,
                    productId: productId,
                    size: size,
                    count: count,
                    price: price
                };
                RestFactory.request(config.API.host + "cargo/add-to-cargo", "POST", product)
                    .then(function (response) {

                    });
            };

            $scope.addProductCustomSize = function(productId){
                $rootScope.products[productId].sizes[''] = {
                    size: '',
                    count: 0,
                    price: $rootScope.products[productId].price,
                    custom: 1
                };
            };
            $scope.deleteProductSize = function(product){
                var key = product.productId+'.'+product.size;
                delete $scope.cargoProducts[key];
            };

            $scope.addCustomProducts = function(){

                $rootScope.modalInstance = $modal.open({
                    templateUrl: "/modules/buyer/views/cargo/product_search.html",
                    controller: 'CargoOrderProductsController',
                    backdrop:'static',
                    resolve:{
                        factories: function(){
                            return $scope.factories;
                        }
                    }
                });
            };

            $scope.done = function(){
                // Attaching orderId to cargo
                $location.path( '/buyer/cargo/id/'+ $scope.cargo.id );
            };

            $scope.search = function(query){
                $rootScope.query = query;
                RestFactory.request(config.API.host + "product/search/query/"+query)
                    .then(function(response){
                        $rootScope.modalInstance.close();
                        $rootScope.searchResult = response;

                        if(response.length > 0){

                            $rootScope.modalInstance = $modal.open({
                                templateUrl: "/modules/buyer/views/cargo/product_search_result.html",
                                controller: 'CargoOrderProductsController',
                                backdrop:'static',
                                size: 'lg',
                                resolve:{
                                }
                            });
                        }else{
                            $scope.createNewProductConfirm();
                        }
                    });
            };

            $scope.selectProduct = function(product){

                $rootScope.modalInstance.close();
                $rootScope.products[product.id] = {
                    id: product.id,
                    articul: product.articul,
                    factoryArticul: product.factoryArticul,
                    title: product.title,
                    brand: product.brand,
                    preview: product.preview,
                    price: product.price,
                    sizes: {}
                };
            };

            $scope.createNewProductConfirm = function(){
                $rootScope.modalInstance = $modal.open({
                    templateUrl: "/modules/buyer/views/cargo/new_product_create_confirm.html",
                    controller: 'CargoOrderProductsController',
                    backdrop:'static',
                    resolve:{
                        factories: function(){
                            return $scope.factories;
                        }
                    }
                });
            };

            $scope.createNewProductForm = function(){
                $rootScope.newProduct = {
                    factoryArticul: $rootScope.query,
                    price: 0
                };

                RestFactory.request(config.API.host + "cargo/get/id/"+$scope.$route.current.params.id)
                    .then(function(response){
                        if(response.cargo){

                            $rootScope.modalInstance.close();

                            $scope.newProduct.factoryId = response.cargo.factoryId;

                            $rootScope.modalInstance = $modal.open({
                                templateUrl: "/modules/buyer/views/cargo/new_product_create.html",
                                controller: 'CargoOrderProductsController',
                                backdrop:'static',
                                resolve:{
                                    newProduct: function(){
                                        return $rootScope.newProduct;
                                    }
                                }
                            });

                        }else{
                            console.log(response);
                        }
                    });
            };
            $scope.createNewProduct = function(newProduct){

                RestFactory.request(config.API.host + "product/create")
                    .then(function(response){
                        //$scope.search(newProduct.factoryArticul);
                        $scope.search("1234");
                        if(response.cargo){
                            console.log(response);
                        }else{
                            console.log(response);
                        }
                    });
            };
            $scope.cancelCreate = function(){
                $rootScope.modalInstance.close();
                $location.path( '/buyer/cargo/id/'+ $scope.$route.current.params.id );
            };
        }
    ]);

app.controller("CargoManagementController",
    [
        "$scope",
        "$rootScope",
        "RestFactory",
        "messageCenterService",
        "$modal",
        "$location",

        function($scope,$rootScope,RestFactory,messageCenterService,$modal,$location){

            $rootScope.documentTitle="Cargo management";



            RestFactory.request(config.API.host + "logisticCompany/load")
                .then(function(response){
                    if(response!=undefined && response!='null'){
                        $scope.logisticCompanies = response;
                        console.log(response);
                    }
                });

            RestFactory.request(config.API.host + "status/load/type/cargo")
                .then(function(response){


                    for(var i=0;i<response.length;i++){
                        if(response[i].statusId==3){
                            response[i].ticked=true;
                        }
                    }
                    console.log(response);
                    $scope.statuses = response;

                });

            $scope.cargoCheckbox={};

            function _getCargo(url){
                RestFactory.request(url).then(//cargo/load/status/3

                    function(response){

                        console.log(response);
                        if(_.isArray(response) && response.length!=0){

                            /*mocks begin*/
                            /*response[0].cargo.deliveryPrice=1.00;
                             response[1].cargo.deliveryPrice=1.50;
                             response[0].cargo.document="Cargo doc.";
                             response[1].cargo.document="Test";
                             response[0].cargo.arriveWeight=1234;
                             response[1].cargo.arriveWeight=315;
                             response[0].cargo.arrivePlaces=25;
                             response[1].cargo.arrivePlaces=123;
                             response[0].cargo.incomeWeight=1127;
                             response[1].cargo.incomeWeight=234;
                             response[0].cargo.incomePlaces=21;
                             response[1].cargo.incomePlaces=101;
                             response[0].cargo.deliveryPaid=500;
                             response[1].cargo.deliveryPaid=345;*/
                            /*Mocks end*/

                            _parseCargo(response);
                        }
                        else{

                            if(_.isArray(response) && response.length==0){
                                messageCenterService.add('danger',"No shipped cargos",{timeout:3000});
                            }
                            else{
                                messageCenterService.add('danger',"Error: cargos are not loaded",{timeout:3000});
                            }
                        }
                    }
                );
            }




            function _parseCargo(response){
                var length=response.length,
                    index,
                    productsLength;
                /*total scopes*/
                $scope.totalArriveWeight=0;
                $scope.totalArrivePlaces=0;
                $scope.totalIncomeWeight=0;
                $scope.totalIncomePlaces=0;
                $scope.totalCost=0;
                $scope.totalPaid=0;
                $scope.totalGoodsCost=0;
                for(var i=0;i<length;i++){

                    $scope.cargoCheckbox[i]=false;

                    index=_.findIndex($scope.statuses,'statusId',response[i].cargo.status);

                    if(index!=-1){
                        response[i].cargo.statusName=$scope.statuses[index].name;
                    }

                    productsLength=response[i].products.length;

                    response[i].goodsCost=0;

                    if(productsLength!=0){

                        for(var j=0;j<productsLength;j++){

                            response[i].goodsCost+=parseFloat(response[i].products[j].price);
                        }
                    }

                    /*total counter*/
                    $scope.totalArriveWeight+=parseFloat(response[i].cargo.arriveWeight);
                    $scope.totalArrivePlaces+=parseFloat(response[i].cargo.arrivePlaces);
                    $scope.totalIncomeWeight+=parseFloat(response[i].cargo.incomeWeight);
                    $scope.totalIncomePlaces+=parseFloat(response[i].cargo.incomePlaces);
                    $scope.totalCost+=parseFloat(response[i].cargo.deliveryPrice);
                    $scope.totalPaid+=parseFloat(response[i].cargo.deliveryPaid);
                    $scope.totalGoodsCost+=response[i].goodsCost;
                }
                if($scope.data==undefined){
                    $scope.data=response;
                    $scope.cargo=$scope.data;
                }
                else{
                    $scope.cargo=response;
                }

            }






            var filter={},url;
            $scope.$watchCollection('result',function(value) {

                if(value){

                    //console.log(value);

                    for( item in value){
                        var array=[];

                        if($.isEmptyObject(value[item])){

                            delete filter[item];
                        }
                        else{

                            angular.forEach(value[item],function(val,key){

                                if(val.ticked === true && item!='status'){

                                    array.push(val.id);
                                    filter[item]=array;
                                }
                                else{
                                    array.push(val.statusId);
                                    filter[item]=array;
                                }
                            })
                        }

                    }
                    /*console.log(filter);*/

                    if(!$.isEmptyObject(filter)){

                        url=config.API.host+"cargo/load/";

                        if(filter.status){
                            console.log(filter.status);
                            url+="status/"+filter.status.join()+"/";
                        }

                        if(filter.suppliers){

                            url+="logisticCompanyId/"+filter.suppliers.join()+"/";
                        }
                        if(filter.factory){

                            url+="factoryId/"+filter.factory.join()+"/";
                        }

                        console.log(url);

                        _getCargo(url);
                    }
                    else{
                        $scope.cargo=$scope.data;
                    }
                }
            });

            /**
             * checkboxs
             */
            $scope.selectCargos=function(){

                    for(key in $scope.cargoCheckbox){
                        $scope.cargoCheckbox[key]=$scope.allCheck;
                    }
            };
           /* $scope.$watchCollection('cargoCheckbox',function(val){
                console.log(val);s
            });*/


            $scope.makePayment=function(){

                var array=[];
                for(key in $scope.cargoCheckbox){
                    if($scope.cargoCheckbox[key]==true){
                        array.push($scope.cargo[key]);
                    }
                }

                if(array.length==0){

                    messageCenterService.add("danger","You are not choose cargo documents",{timeout:3000});
                    return;
                }


                var modalInstance=$modal.open({
                    templateUrl:"/modules/buyer/views/cargo/make_payment.html",

                    controller:function($scope,messageCenterService){

                        $scope.title="Make payment";

                        $scope.make=function(payment){

                            if(payment==undefined){
                                messageCenterService.add("danger", "Not entered fields",{timeout:3000});
                                return;
                            }


                            if(payment.amount==undefined || payment.amount==""){
                               messageCenterService.add("danger", "Not entered amount",{timeout:3000});
                                return;
                            }
                            if(payment.note==undefined || payment.note==""){
                                messageCenterService.add("danger", "Not entered note",{timeout:3000});
                                return;
                            }
                            modalInstance.close(payment);
                        }
                    },
                    size:"sm",
                    backdrop:"static"
                });

                modalInstance.result.then(function(payment){
                    var CO,
                        cashierId,
                        i,
                        length,
                        url,
                        data;
                    CO=JSON.parse(localStorage['user']).settings.cashierOffice;

                    cashierId=JSON.parse(localStorage['user']).id;
                    url=config.API.host+"payment/create";

                    console.log(payment,CO,cashierId,array);

                    length=array.length;

                    for(i=0;i<length;i++){

                        data={
                            'currencyId'        :   array[i].factory.currencyId,
                            'cashierId'         :   cashierId,
                            'cashierOfficeId'   :   CO,
                            /*'orderId'           :   $scope.orders[index].order.id,*/
                            documentId          :   array[i].cargo.id,
                            'paymentMethod'     :   "bank",
                            'paymentType'       :   'payment',
                            'amount'            :   array[i].cargo.deliveryPrice,
                            'note'              :   payment.note

                        };
                        console.log(data);
                        payment.amount=payment.amount-parseFloat(array[i].cargo.deliveryPrice);
                        console.log(payment.amount);


                        RestFactory.request(url,"POST",data).then(
                             function(response){
                                 if(_.isObject(response)&&response.id>0){
                                    messageCenterService.add('success', 'Payment created', {timeout: 3000});
                                 }else{
                                    messageCenterService.add('danger', 'Payment is not created', {timeout: 3000});
                                 }
                             }
                         );


                    }
                })
            };

            $scope.edit=function(item){
                $location.path("/buyer/cargo/management/id/"+item.cargo.id);
            }
        }]);

app.controller("DocumentCargoController",
    [
        "$scope",
        "$rootScope",
        "$route",
        "RestFactory",
        "$location",
        "messageCenterService",
        "$modal",

        function($scope,$rootScope,$route,RestFactory,$location,messageCenterService,$modal){

            $scope.$route = $route;
            $scope.$location = $location;

            $scope.cargo = {};
            $scope.factory = {};
            $scope.products = [];
            $scope.logisticCompanies = [];

            $rootScope.documentTitle = 'Document #' + $route.current.params.id;

            $scope.productsTableHeader = [
                { name: "photo", title: "Preview" },
                { name: "articul", title: "Articul" },
                { name: "factoryArticul", title: "Factory articul" },
                { name: "size", title: "Size" },
                { name: "count", title: "Count" },
                { name: "price", title: "Price" }
            ];

            RestFactory.request(config.API.host + "logisticCompany/load")
                .then(function(response){
                    $scope.logisticCompanies = response;
                });


            RestFactory.request(config.API.host + "cargo/get/id/"+$route.current.params.id)
                .then(function(response){
                   /* console.log(response);*/
                    $scope.cargo = response.cargo;
                    $scope.cargo.logisticCompany = $scope.getLogisticCompany();
                    $scope.factory = response.factory;
                    for( var i in response.products){
                        var product = response.products[i];
                        /*console.log(product);*/
                        $scope.products[i] = {
                            photo: 'http://back95.com/f/catalogue/'+product.productId+'/'+product.product.preview[1],
                            articul: product.product.articul,
                            factoryArticul: product.product.factoryArticul,
                            size: product.size,
                            count: product.count,
                            price: product.price
                        };
                    }
                    /*console.log($scope.products);*/
                });

            $scope.getLogisticCompany = function(){
                for( var i in $scope.logisticCompanies){
                    if($scope.cargo.logisticCompanyId == $scope.logisticCompanies[i].id){
                        return $scope.logisticCompanies[i];
                    }
                }
            };

            $scope.receiveCargo=function(){

                var modalInstance=$modal.open({
                    templateUrl:"/modules/buyer/views/cargo/receive_cargo.html",
                    controller:function($scope,messageCenterService,cargo){
                        $scope.cargo=cargo;

                        $scope.title="Cargo #"+$scope.cargo.id;


                        $scope.closeModal=function(){

                            modalInstance.close($scope.cargo);
                        }
                    },
                    size:"sm",
                    backdrop:"static",
                    resolve:{
                        cargo:function(){
                            return $scope.cargo;
                        }
                    }
                });
                modalInstance.result.then(
                    function(cargo){
                        console.log(cargo);
                        var url=config.API.host+"cargo/update";

                        var data={
                            id          :cargo.id,
                            arriveWeight:cargo.arriveWeight,
                            arrivePlaces:cargo.arrivePlaces,
                            status:4
                        };
                        console.log(data);

                        RestFactory.request(url,"PUT",data).then(
                            function(response){
                                console.log(response);
                                if(response){
                                    messageCenterService.add("success","Cargo received",{timeout:3000});
                                }
                                else{
                                    messageCenterService.add("danger","Cargo id not received",{timeout:3000});
                                }
                            }
                        )
                    }
                )




            }

        }]);