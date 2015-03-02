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
            $rootScope.documentTitle = "Cargo";
            $scope.tableHeader = [
                { name: "document", title: 'Document' },
                { name: "cargoDoc", title: 'Cargo Document' },
                { name: "createDate", title: 'Create date' },
                { name: "paymentStatus", title: 'Status' },
                { name: "factory", title: 'Factory' }
            ];
            $scope.cargo = [
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

            /* Getting cargo */
            $rootScope.documentTitle = "Cargo cart";
            $scope.tableHeader = [
                { name: "photo", title: 'Photo' },
                { name: "article", title: 'Article/Name' },
                { name: "size", title: 'Size' },
                { name: "count", title: 'Count' },
                { name: "factory", title: 'Factory' }
            ];
            

            $scope.cargo_cart = [
                {
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "article":"3234555",
                    "size":"M",
                    "count":"2323",
                    "factory":"factory #1",
                    "active":'complete'
                },

                {
                    "photo":"/assets/images/avatar/avatar17.jpg",
                    "article":"8676",
                    "size":"S",
                    "count":"134",
                    "factory":"factory #1",
                    "active":'in_complete'
                },

                {
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "article":"4435",
                    "size":"L",
                    "count":"87875",
                    "factory":"factory #1",
                    "active":'inactive'
                },

                {
                    "photo":"/assets/images/avatar/avatar3.jpg",
                    "article":"35356",
                    "size":"M",
                    "count":"989",
                    "factory":"factory #1",
                    "active":'hold'
                },
                {
                    "photo":"/assets/images/avatar/avatar8.jpg",
                    "article":"995453",
                    "size":"M",
                    "count":"783",
                    "factory":"factory #1",
                    "active":'inactive'
                },
                {
                    "photo":"/assets/images/avatar/avatar1.jpg",
                    "article":"344657",
                    "size":"M",
                    "count":"343",
                    "factory":"factory #1",
                    "active":'inactive'
                },
                {
                    "photo":"/assets/images/avatar/avatar16.jpg",
                    "article":"233567",
                    "size":"M",
                    "count":"23",
                    "factory":"factory #1",
                    "active":'inactive'
                },
                {
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "article":"9799898",
                    "size":"M",
                    "count":"3253",
                    "factory":"factory #1",
                    "active":'process'
                }
            ];
            $scope.addNewItems = function(){
                $location.path( '/buyer/cargo/cargo_items');
            };

            $scope.sendShipment = function(){
                modalWindow=$modal.open({
                    templateUrl: "/modules/buyer/views/cargo/send_shipment.html",
                    controller: 'CargoController',
                    backdrop:'static',
                    size:'sm'
                });
            };



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
                { name: "size_list", title: 'Size' },
                { name: "count_list", title: 'Count' }
            ];

            $scope.buttons=[{
                 class:"btn btn-success",
                 value:"add",
                 icon:"fa fa-plus"
            }];
            $scope.buttonAction=function(){
                alert("work");
            };
            $scope.cargo_items = [
                {
                    "article":"995453",
                    "size_list":[
                        { value: 'S' },
                        { value: 'M' },
                        { value: 'L' }
                    ],
                    "count_list":[
                        { value: '231' },
                        { value: '12' },
                        { value: '24' }
                    ],
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "active":'complete'
                },

                {
                    "article":"995453",
                    "size_list":[
                        { value: 'S' }
                    ],
                    "count_list":[
                        { value: '14' }
                    ],
                    "photo":"/assets/images/avatar/avatar8.jpg",
                    "active":'process'
                },

                {
                    "article":"995453",
                    "size_list":[
                        { value: 'M' },
                        { value: 'L' }
                    ],
                    "count_list":[
                        { value: '12' },
                        { value: '24' }
                    ],
                    "photo":'/assets/images/avatar/avatar7.jpg',
                    "active":'inactive'
                },

                {
                    "article":"995453",
                    "size_list":[
                        { value: 'S' },
                        { value: 'L' }
                    ],
                    "count_list":[
                        { value: '2' },
                        { value: '43' }
                    ],
                    "photo":"/assets/images/avatar/avatar15.jpg",
                    "active":'hold'
                },

                {
                    "article":"995453",
                    "size_list":[
                        { value: 'S' },
                        { value: 'M' },
                        { value: 'L' }
                    ],
                    "count_list":[
                        { value: '11' },
                        { value: '6' },
                        { value: '2' }
                    ],
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "active":'in_complete'
                }
            ];

        }]);