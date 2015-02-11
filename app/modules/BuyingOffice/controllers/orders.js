/*
(function(){


    app.controller('OrdersController',

        [
            '$http',
            '$scope',
            "$rootScope",
            "$filter",
            "orderService",


            function($http, $scope,$rootScope,$filter,orderService){

                $scope.test="orders routing work!";

                var orderBy = $filter('orderBy');


                orderService.getData("/data/order.json")
                    .then(function(response){

                        $scope.orders=response;

                    });

                orderService.getData("/data/factory.json")
                    .then(function(response){

                        $scope.factory_list=response;
                        //console.log($scope.factory_list);

                        $scope.factoryModel = $scope.factory_list[0];
                    });

                orderService.getData("/data/orderstatus.json")
                    .then(function(response){

                        $scope.status_list=response;

                        $scope.statusModel = $scope.status_list[0];
                    });

                //$scope.new_order=function(){
                //    $location.path("order/new");
                //};
                //$scope.buyer=function(){
                //    $location.path("buyer");
                //};

                //$scope.$watch('date',function(val){
                //    console.log($scope.date);
                //});
                $scope.sort = function(predicate, reverse) {
                    //console.log(typeof $scope.orders[1].number);
                    */
/* angular.forEach($scope.orders,function(value,key){
                     console.log(key,predicate);
                     if(key==predicate){
                     console.log(value)
                     }

                     });*//*


                    var length=$scope.orders.length,
                        reg='/[^a-z]/i';

                    for(i=0;i<length;i++){

                        angular.forEach($scope.orders[i], function(value,key){

                            if(key==predicate){
                                //console.log(value, typeof value)

                            }
                        });
                    }



                    $scope.orders = orderBy($scope.orders, predicate, reverse);
                };










            }]);
})();*/
