(function(){

    var app = angular.module('BuyingOffice', ['multi-select']);

    app.config(function($routeProvider){

        $routeProvider

            .when('/buyingOffice/orders',
            {
                templateUrl:"/app/modules/BuyingOffice/views/orders.html",
                controller:"OrdersController"
            }
        )
            .when('/buyingOffice/bestsellers',
            {
                templateUrl:"/app/modules/BuyingOffice/views/bests.html",
                controller:"BestsController"
            }
        )
            .when("/buyingOffice/cargo",
            {
                templateUrl:"/app/modules/BuyingOffice/views/cargo.html",
                controller:"CargoController"
            }
        )
    });


    /** factory for orders
     * @Param: $http
     * @param:$q
     */

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
            '$scope',
            "orderService",
            "$filter",

            function($scope,orderService,$filter){

                /* get orders */
                orderService.getData("/mock/order.json")
                    .then(function(response){

                        $scope.dataOrders=response;

                        $scope.orders=$scope.dataOrders;
                    });
                /*get factories*/
                orderService.getData("/mock/factory.json")
                    .then(function(response){

                        $scope.FactoryList=response;
                    });
                /*get statuses*/
                orderService.getData("/mock/orderstatus.json")
                    .then(function(response){

                        $scope.status_list=response;
                    });


                //$scope.Factory = [
                //    { name: "Factory1 (Tiger Nixon)",        ticked: false },
                //    { name: "Factory2 (Garrett Winters)",    ticked: false },
                //    { name: "Factory3 (Garrett Winters)",    ticked: false },
                //    { name: "Factory4 (Airi Satou)",         ticked: false },
                //    { name: "Factory5 (Colleen Hurst)",      ticked: false }
                //];
                //
                //$scope.Status = [
                //    { name: "Complete",     ticked: false },
                //    { name: "In Complete",  ticked: false },
                //    { name: "On Hold",      ticked: false }
                //];


                $scope.$watch('orders',function(newVal,oldVal){

                    // console.log(oldVal,newVal);

                    if(newVal!=undefined){

                        var length= newVal.length,
                            date=/date/i,
                            num;
                        // console.log(length);
                        for(var i=0;i<length;i++){

                            angular.forEach( newVal[i], function(value,key){

                                if(date .exec(key)!=null){

                                    newVal[i][key]=$filter('date')(value,"dd/MM/yyyy");

                                }
                                else{

                                    num = parseInt(value);

                                    if(num){

                                        newVal[i][key]=num;
                                        //console.log(newVal[i][key]);
                                    }
                                }
                            });
                        }

                        // $scope.orders= newVal;
                    }
                });






                /*get selected items for factory  */

                var filter={};
                $scope.$watch('resultData',function(newVal){
                    var arr=[];

                    angular.forEach( newVal, function( value, key ) {

                        if ( value.ticked === true ) {

                            filter[value.name]=value;

                            orderService.getData("/mock/orderfilter.json?"+value.name)

                                .then(function(response){

                                    for(var i=0; i<response[value.name].length;i++){
                                        arr.push(response[value.name][i]);
                                    }
                                    $scope.orders=arr;
                                });

                        }

                    });
                    console.log(filter);

                    try{
                        if(newVal.length==0){

                            $scope.orders=$scope.dataOrders;
                        }
                    }
                    catch(e){

                    }

                });


                /*get selected items for statuses */

                /* $scope.$watch('resultDataStatus',function(newVal){
                 var arr=[];
                 angular.forEach( newVal, function( value, key ) {

                 if ( value.ticked === true ) {

                 orderService.filterData("/mock/orderfilter.json", value.name)

                 .then(function(response){

                 for(var i=0; i<response[value.name].length;i++){
                 arr.push(response[value.name][i]);
                 }
                 $scope.orders=arr;
                 });

                 }
                 });

                 try{
                 if(newVal.length==0){

                 $scope.orders=$scope.dataOrders;
                 }
                 }
                 catch(e){

                 }

                 });*/


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
