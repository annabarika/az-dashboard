var app = angular.module("modules.buyer.bestsellers", [

]);

app.controller('BestsellerItemController', function($scope, $rootScope, $route, $location, RestFactory){
    $scope.$route = $route;
    $scope.$location = $location;

    $rootScope.documentTitle = "Item";

    var url=config.API.host+"bestseller/load/"+$route.current.params.bestsellerId;

    RestFactory.request( url )
        .then(function(response){
            console.log(response);

        },
        function(error){
            console.log(error);
        });
});