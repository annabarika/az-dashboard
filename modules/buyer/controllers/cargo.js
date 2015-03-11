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

                var modalInstance =$modal.open({
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
                console.log(factory);
                //console.log(obj.id);
                $modalInstance.close();

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
                        if( typeof response == 'object'){
                            console.log(response);
                            $rootScope.cart=response;
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