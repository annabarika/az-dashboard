(function(){

    var app = angular.module('BuyingOffice', ['multi-select']);

    app.config(function($routeProvider){

        $routeProvider

            .when('/buyingOffice/orders',
            {
                //templateUrl:"/views/pages/BuyingOffice/orders.html",
                templateUrl:"/app/modules/BuyingOffice/views/orders.html",
                controller:"OrdersController"
            }
        )
            .when('/buyingOffice/bestsellers',
            {
                //templateUrl:"/views/pages/BuyingOffice/bests.html",
                templateUrl:"/app/modules/BuyingOffice/views/bests.html",
                controller:"BestsController"
            }
        )
            .when("/buyingOffice/cargo",
            {
                //templateUrl:"/views/pages/BuyingOffice/cargo.html",
                templateUrl:"/app/modules/BuyingOffice/views/cargo.html",
                controller:"CargoController"
            }
        )
    });





        app.factory("orderService",["$http","$q",
                function($http,$q){

                    var service={};

                    service.getData=function(url){

                        var deferred = $q.defer();

                        $http.get(url)
                            .success(function (response) {
                                if(response)
                                {
                                    deferred.resolve(response);
                                }
                                else
                                {
                                    deferred.resolve(response);
                                }

                            })
                            .error(function (error) {
                                deferred.reject(error);
                            });

                        return deferred.promise;
                    };




                    return service;
                }]
        );
    /**
     * Order controller
     */
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
                //rows=0;


            orderService.getData("/mock/order.json")
                .then(function(response){

                    $scope.orders=response;


                    //console.log($scope.rowsCount);
                });

            orderService.getData("/mock/factory.json")
                .then(function(response){

                    $scope.factory_list=response;
                    //console.log($scope.factory_list);

                    $scope.factoryModel = $scope.factory_list[0];
                });

            orderService.getData("/mock/orderstatus.json")
                .then(function(response){

                    $scope.status_list=response;

                    $scope.statusModel = $scope.status_list[0];
                });


            $scope.Factory = [
                { name: "Factory1 (Tiger Nixon)",        ticked: false },
                { name: "Factory2 (Garrett Winters)",    ticked: false },
                { name: "Factory3 (Garrett Winters)",    ticked: false },
                { name: "Factory4 (Airi Satou)",         ticked: false },
                { name: "Factory5 (Colleen Hurst)",      ticked: false }
            ];

            //$scope.Factorytrim = function (){
            //     //var array = {};
            //     angular.forEach($scope.Factory, function(v,k){
            //
            //         v.name= $filter("limitTo")(v.name,7);
            //         v.name= v.name+"...";
            //         //console.log("test", v.name);
            //
            //     });
            //    console.log($scope.Factory);
            //    return $scope.Factory;
            // };
            //
            // $scope.Factorytrim();






            $scope.Status = [
                { name: "Complete",     ticked: false },
                { name: "In Complete",  ticked: false },
                { name: "On Hold",      ticked: false }
            ];

            $scope.sort = function(predicate, reverse) {
                //console.log(typeof $scope.orders[1].number);
                /* angular.forEach($scope.orders,function(value,key){
                 console.log(key,predicate);
                 if(key==predicate){
                 console.log(value)
                 }

                 });*/

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


    app.controller('BestsController',

        [
            '$http',
            '$scope',
            "$rootScope",


            function($http, $scope,$rootScope){

                $scope.test="bestsellers routing is work!";

    }]);



    app.controller('CargoController',

        [
            '$http',
            '$scope',
            "$rootScope",

            function($http, $scope,$rootScope){

                $scope.test="cargo routing is work!";

    }]);


})();

