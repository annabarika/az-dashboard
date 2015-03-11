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

            $rootScope.documentTitle = 'Document #' + $route.current.params.id;

            RestFactory.request(config.API.host + "cargo/get/id/"+$route.current.params.id)
                .then(function(response){
                    console.log(response);
                    $scope.cargo = response.cargo;
                    $scope.factory = response.factory;
                    $scope.products = response.products;
                });

            $scope.chooseOrder = function(){
                $location.path( '/buyer/cargo/id/'+ $scope.cargo.id +'/choose-order' );
            }
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
            $scope.products         = [];
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
                    $scope.products = response.products;

                    $rootScope.documentTitle = 'Add products to cargo #' + $scope.cargo.id + ' ('+ $scope.factory.name +')';

                    RestFactory.request(config.API.host + "cargo/get-order-products/cargoId/"+$scope.cargo.id +"/orderId/"+$scope.$route.current.params.orderId)
                        .then(function(response){
                            if(response.length > 0){
                                $scope.products = $scope.groupByProductId(response);
                                console.log($scope.products);
                            }
                        });

                });
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
                    $scope.products[productId].sizes[size] = {
                        size: size,
                        count: count,
                        price: price,
                        custom: 0
                    };
                    delete $scope.products[productId].sizes[''];
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
                $scope.products[productId].sizes[''] = {
                    size: '',
                    count: 0,
                    price: $scope.products[productId].price,
                    custom: 1
                };
            };
            $scope.deleteProductSize = function(product){
                var key = product.productId+'.'+product.size;
                delete $scope.cargoProducts[key];
            };

            $scope.addCustomProducts = function(){
                $rootScope.modalInstance = $modal.open({
                    templateUrl: "/modules/buyer/views/cargo/add_product_search.html",
                    controller: 'CargoProductSearchController',
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
        }
    ]);

app.controller('CargoProductSearchController',
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

            $scope.search = function(query){
                RestFactory.request(config.API.host + "products/search/query/"+query)
                    .then(function(response){
                        console.log(response);
                        if(response.length > 0){

                        }
                    });
            };
        }
    ]);