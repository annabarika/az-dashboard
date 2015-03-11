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

            RestFactory.request(config.API.host + "factory/load")
                .then(function(response){
                    var factory = [];
                    for( var i in response ){
                        factory.push( { id: response[i].factory.id, name: response[i].factory.name } );
                    }
                    $scope.Factory=factory;
                });
            /* bulding new cargo*/
            $scope.addNewCargo = function(){

                $rootScope.modalInstance =$modal.open({
                    templateUrl: "/modules/buyer/views/cargo/new_cargo.html",
                    controller: 'CargoController',
                    backdrop:'static',
                    resolve:{
                        Factory:function(){
                            return $scope.Factory;
                        }
                    }
                });
            };

            $scope.createCargo = function(factory){
                var cargo = {
                    'parentId' : 0,
                    'factoryId': factory.id,
                    'document': 0,
                    'status': 0,
                    'employeeId': 328
                };

                RestFactory.request(config.API.host+"cargo/create" , "POST", cargo)
                    .then(function(response){
                        //console.log("new cargo",response);
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
            $rootScope.documentTitle = 'Document #' + $route.current.params.id;
        }
    ]);