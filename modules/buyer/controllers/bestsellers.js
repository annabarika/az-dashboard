var app = angular.module("modules.buyer.bestsellers", [

]);

app.controller('BestsellerItemController',
    [
        '$scope', '$rootScope', '$route', '$location', 'RestFactory',

        function($scope, $rootScope, $route, $location, RestFactory){
            $scope.$route = $route;
            $scope.$location = $location;

            $rootScope.documentTitle = "Item";


            $scope.load = function() {
                var url = config.API.host + "bestseller/get/id/" + $route.current.params.bestsellerId;

                RestFactory.request(url)
                    .then(function (response) {

                        $scope.product = response.product;
                        $scope.bestseller = response.bestseller;
                        $scope.order = response.order;
                        $scope.factory = response.factory;

                        $scope.sizes = {add: [{size: 'XS', count: 1}], L: {count: 2}, M: {count: 3}};
                        $rootScope.documentTitle = $scope.product.brand + ' (' + $scope.product.articul + ')';

                    },
                    function (error) {
                        console.log(error);
                    });
            };

            $scope.load();

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
                // Creating order
                var createOrderUrl = config.API.host+"order/create";
                var order = {
                    factoryId: $scope.product.factoryId,
                    buyerId: 328,
                    type: 1
                };

                RestFactory.request(createOrderUrl, 'POST', order)
                    .then(function(response){
                        if(response.id){
                            var orderId = response.id;
                            var addProductUrl = config.API.host+"order/create-bestseller-row";
                            // Adding items to order
                            for( i in products){
                                products[i].orderId = orderId;
                                RestFactory.request(addProductUrl, 'POST', products[i])
                                    .then(function(response){
                                        //console.log(response);
                                        if( response.id ){
                                            //console.log(i);
                                            products.splice(0, 1);
                                            if(products.length == 0){
                                                $scope.load();
                                            }
                                            //console.log(products.length);
                                        }
                                    });

                            }
                        }
                    });
        }
}]);