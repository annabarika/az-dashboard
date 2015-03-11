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
                    templateUrl: "/modules/buyer/views/cargo/new_cargo2.html",
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
                console.log(orderId);
                // Attaching orderId to cargo

            };
        }
    ]);