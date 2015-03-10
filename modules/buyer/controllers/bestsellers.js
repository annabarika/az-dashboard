var app = angular.module("modules.buyer.bestsellers", [

]);

app.controller('BestsellerItemController',
    [
        '$scope', '$rootScope', '$route', '$location', 'RestFactory',

        function($scope, $rootScope, $route, $location, RestFactory){
    $scope.$route = $route;
    $scope.$location = $location;

    $rootScope.documentTitle = "Item";

    var url = config.API.host+"bestseller/get/id/"+$route.current.params.bestsellerId;

    RestFactory.request( url )
        .then(function(response){

            $scope.product = response;
            $scope.sizes = { add: [{size:'XS', count:1}], L: {count:2}, M:{count:3}};
            $rootScope.documentTitle = $scope.product.brand + ' ('+ $scope.product.articul +')';

        },
        function(error){
            console.log(error);
        });

    $scope.createOrder = function( sizes ){
        // Preparing order rows
        //console.log( Object.keys(sizes).length );
        if( Object.keys(sizes).length == 0 ) return false;

        var products = [];
        var size = '';
        if( sizes.add ){
            for( var i in sizes.add ){
                size = sizes.add[i].size;
                sizes[size] = { count : sizes.add[i].count };
            }
        }


        for( var size in sizes){
            if( size != 'add' ){
                products.push({
                    size: size,
                    productId: $scope.product.id,
                    count: sizes[size].count,
                    price: $scope.product.price,
                    factoryArticul: $scope.product.factoryArticul,
                    bestsellerId: $scope.$route.current.params.bestsellerId
                });
            }
        }
        console.log($scope.product);
        console.log(products);

        // Creating order
        var url=config.API.host+"order/create";
        var order = {
            factoryId: $scope.product.factoryId,
            buyerId: 328,
            type: 1
        };
/*
        RestFactory.request(url, 'POST', order)
            .then(function(response){
                if(response.id){

                }
            });*/
        var orderId = 9;
        var addProductUrl = config.API.host+"order/create-bestseller-row";
        for( i in products){
            products[i].orderId = orderId;
            RestFactory.request(addProductUrl, 'POST', products[i])
                .then(function(response){
                    console.log(response);
                    if(response.id){

                    }
                });
        }
    }
}]);