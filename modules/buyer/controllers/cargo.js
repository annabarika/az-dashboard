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


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){

            $scope.$route = $route;
            $scope.$location = $location;

            /* Getting cargo */
            $rootScope.documentTitle = "Cargo";
            $scope.tableHeader = [
                { name: "photo", title: 'Photo' },
                { name: "article", title: 'Article/Name' },
                { name: "size", title: 'Size' },
                { name: "count", title: 'Count' },
                { name: "factory", title: 'Factory' }
            ];
            

            $scope.cargo = [
                {
                    "photo":"product.jpg",
                    "article":"3234555",
                    "size":"M",
                    "count":"2323",
                    "factory":"factory #1"
                },

                {
                    "photo":"product.jpg",
                    "article":"8676",
                    "size":"S",
                    "count":"134",
                    "factory":"factory #1"
                },

                {
                    "photo":"product.jpg",
                    "article":"4435",
                    "size":"L",
                    "count":"87875",
                    "factory":"factory #1"
                },

                {
                    "photo":"product.jpg",
                    "article":"35356",
                    "size":"M",
                    "count":"989",
                    "factory":"factory #1"
                },
                {
                    "photo":"product.jpg",
                    "article":"995453",
                    "size":"M",
                    "count":"783",
                    "factory":"factory #1"
                },
                {
                    "photo":"product.jpg",
                    "article":"344657",
                    "size":"M",
                    "count":"343",
                    "factory":"factory #1"
                },
                {
                    "photo":"product.jpg",
                    "article":"233567",
                    "size":"M",
                    "count":"23",
                    "factory":"factory #1"
                },
                {
                    "photo":"product.jpg",
                    "article":"9799898",
                    "size":"M",
                    "count":"3253",
                    "factory":"factory #1"
                }
            ];
            $scope.addNewItems = function(){
                $location.path( '/buyer/cargo/cargo_items');
            };

            $scope.edit = function () {
               $location.path( '/buyer/cargo/cargo_cart');
            };

        }]);

app.controller('CargoCartController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){

            $scope.$route = $route;
            $scope.$location = $location;

            /* Loading factories */
            RestFactory.request(config.API.host + "factory/load")
                .then(function(response){
                    var factory = [];
                    for( var i in response ){
                        factory.push( { id: response[i].factory.id, name: response[i].factory.name } );
                    }
                    $scope.Factory=factory;
                });

            /* Loading statuses */
            RestFactory.request(config.API.host + "status/load")
                .then(function(response){
                    var statusByType = [];
                    for( var i in response ){
                        if( ! statusByType[response[i].type]) statusByType[response[i].type] = [];
                        statusByType[response[i].type].push({ statusId: response[i].statusId, name: response[i].name });
                    }
                    $scope.orderStatus = statusByType['order'];
                    $scope.orderPaymentStatus = statusByType['orderPayment'];
                });

            /* Getting cargo */
            $rootScope.documentTitle = "Cargo cart";
            $scope.tableHeader = [
                { name: "document", title: 'Document' },
                { name: "cargoDoc", title: 'Cargo Document' },
                { name: "createDate", title: 'Create date' },
                { name: "paymentStatus", title: 'Status' },
                { name: "factory", title: 'Factory' }
            ];
            $scope.cargo_cart = [
                {
                    "document":"",
                    "cargoDoc":"",
                    "createDate":"22.01.2015",
                    "paymentStatus":"Complete",
                    "factory":"factory #1"
                },

                {
                    "document":"",
                    "cargoDoc":"",
                    "createDate":"22.01.2015",
                    "paymentStatus":"In complete",
                    "factory":"factory #1"
                },

                {
                    "document":"",
                    "cargoDoc":"",
                    "createDate":"22.01.2015",
                    "paymentStatus":"Hold",
                    "factory":"factory #1"
                }
            ];
        }]);

app.controller('CargoItemsController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){

            $scope.$route = $route;
            $scope.$location = $location;


            /* Getting cargo */
            $rootScope.documentTitle = "Cargo cart";
            $scope.tableHeader = [
                { name: "photo", title: 'Photo' },
                { name: "article", title: 'Articul/name' },
                { name: "size", title: 'Size' },
                { name: "count", title: 'Count' },
                { name: "add", title: '' }
            ];
            $scope.cargo_items = [
                {
                    "photo":"product.jpg",
                    "article":"995453",
                    "size":"M",
                    "count":"783",
                    "add":""
                },

                {
                    "photo":"product.jpg",
                    "article":"995453",
                    "size":"M",
                    "count":"783",
                    "add":""
                },

                {
                    "photo":"product.jpg",
                    "article":"995453",
                    "size":"M",
                    "count":"783",
                    "add":""
                }
            ];
        }]);