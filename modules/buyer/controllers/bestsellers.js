var app = angular.module("modules.buyer.bestsellers", [

]);

app.controller('BestsellerItemController',
    [
        '$scope', '$rootScope', '$route', '$location', 'RestFactory',

        function($scope, $rootScope, $route, $location, RestFactory){
    $scope.$route = $route;
    $scope.$location = $location;

    $rootScope.documentTitle = "Item";

    var url=config.API.host+"bestseller/get/id/"+$route.current.params.bestsellerId;

    RestFactory.request( url )
        .then(function(response){

            $scope.product = response;
            $scope.sizes = {};
            $rootScope.documentTitle = $scope.product.brand + ' ('+ $scope.product.articul +')';

        },
        function(error){
            console.log(error);
        });

    $scope.createOrder = function(sizes){
        console.log($scope.product);
        console.log(sizes);
    }
}]);