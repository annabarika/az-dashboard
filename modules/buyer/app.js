var app = angular.module('modules.buyer', [
    "modules.buyer.orders",
    "modules.buyer.payments",
    "modules.buyer.bestsellers",
    "modules.buyer.collection",
    "modules.buyer.cargo",
    "modules.buyer.factory",
    "daterangepicker"
]);

app.config(function($routeProvider){

    $routeProvider
        .when('/buyer/orders',
        {
            templateUrl:"/modules/buyer/views/orders/index.html",
            controller:"OrderListController",
            //TODO при роутинге нужно будет проверять наличие прав
            authRequired: ['developer','admin']
        }
    )
        .when('/buyer/orders/orders_registry.html',
        {
            templateUrl:"/modules/buyer/views/orders/orders_registry.html",
            controller:"OrderController",
            authRequired: 'developer'
        }
    )
        .when('/buyer/orders/id/:orderId',
        {
            templateUrl:"/modules/buyer/views/orders/id.html",
            controller:"OrderController",
            authRequired: 'developer'
        }
    )
        .when('/buyer/bestsellers',
        {
            templateUrl:"/modules/buyer/views/bestsellers/ordered.html",
            controller:"BestsellersOrderedController",
            authRequired: 'developer'
        })

        .when('/buyer/bestsellers/ordered',
        {
            templateUrl:"/modules/buyer/views/bestsellers/index.html",
            controller:"BestsellersController",
            authRequired: 'developer'
        }
    )
        .when('/buyer/bestsellers/item/:bestsellerId',
        {
            templateUrl:"/modules/buyer/views/bestsellers/item.html",
            controller:"BestsellerItemController",
            authRequired: 'developer'
        }
    )
        .when('/buyer/payments',
        {
            templateUrl:"/modules/buyer/views/payments/index.html",
            controller:"PaymentListController",
            authRequired: 'developer'
        }
    )
        .when('/buyer/payments/payment_order/:id',
        {
            templateUrl:"/modules/buyer/views/payments/payment_order.html",
            controller:"PaymentOrderController",
            authRequired: 'developer'
        }
    )
        .when("/buyer/payments/id/:id",
        {
            templateUrl:"/modules/buyer/views/payments/id.html",
            controller:"PaymentCartController",
            authRequired: 'developer'
        }
    )
        .when('/buyer/collection',
        {
            templateUrl:"/modules/buyer/views/collection/index.html",
            controller:"CollectionsController",
            authRequired: 'developer'
        })
        .when('/buyer/collection/ready',
        {
            templateUrl:"/modules/buyer/views/collection/ready.html",
            controller:"CollectionsReadyController",
            authRequired: 'developer'
        })
        .when('/buyer/collection/upload',
        {
            templateUrl:"/modules/buyer/views/collection/collection.html",
            controller:"UploadController",
            authRequired: 'developer'
        })
        .when('/buyer/collection/id/:collectionId',
        {
            templateUrl:"/modules/buyer/views/collection/id.html",
            controller:"CollectionCardController",
            authRequired: 'developer'
        })
        .when('/buyer/cargo',
        {
            templateUrl:"/modules/buyer/views/cargo/index.html",
            controller:"CargoController",
            authRequired: 'developer'
        }
    )
        .when('/buyer/cargo/id/:id',
        {
            templateUrl:"/modules/buyer/views/cargo/cargo_document.html",
            controller:"CargoDocumentController",
            authRequired: 'developer'
        }
    )
        .when('/buyer/cargo/id/:id/choose-order',
        {
            templateUrl:"/modules/buyer/views/cargo/choose_order.html",
            controller:"CargoOrderController",
            authRequired: 'developer'
        }
    )
        .when('/buyer/cargo/id/:id/order/:orderId',
        {
            templateUrl:"/modules/buyer/views/cargo/cargo_order_products.html",
            controller:"CargoOrderProductsController",
            authRequired: 'developer'
        }
    )
        .when("/buyer/cargo/management",
        {
            templateUrl:"/modules/buyer/views/cargo/management.html",
            controller:"CargoManagementController",
            authRequired:"admin"
        }
    )
        .when("/buyer/cargo/management/id/:id",
        {
            templateUrl:"/modules/buyer/views/cargo/doc_cargo.html",
            controller:"DocumentCargoController",
            authRequired:"admin"
        }
    )
        .when("/buyer/factory/:id",
        {
            templateUrl:"/modules/buyer/views/factory/index.html",
            controller:"FactoryController",
            authRequired:"admin"
        })
});

app.run( function($rootScope, $location ,$http) {

    $rootScope.$on( "$routeChangeStart", function() {
        if ( $rootScope.row == null ) {

            //$location.path('/buyer/orders');

        }});
    /**
     * get types
     */
    $http.get(config.API.host+"/type/load")
        .success(function(data){
            $rootScope.types=data;
           /* console.log("run types",$rootScope.types);*/
        });
    /**
    * get factories
    */
    $http.get(config.API.host + "factory/load")
        .success(function(data){
        //console.log(data);
        $rootScope.fullFactories=data;
        //console.log("full",$rootScope.fullFactories);
        var factories = [];
        angular.forEach(data, function (value,i) {

            /*if(i=='debug'){
                console.log(value);
            }
            else{*/
                var files=value.factoryFiles;
                this.push(value.factory);
            //}
            },factories);
        $rootScope.factories = factories;
            /*console.log("success factory", $rootScope.factories);*/
    });



});

app.controller('DatepickerCtrl', function ($scope) {
    $scope.today = function() {
        $scope.dt = new Date();
    };
    $scope.today();

    $scope.clear = function () {
        $scope.dt = null;
    };

    // Disable weekend selection
    $scope.disabled = function(date, mode) {
        return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
    };


    /*$scope.$watch('dtMin',function(newVal){
     console.log(newVal);
     });

     $scope.$watch('dtMax',function(newVal){
     console.log(newVal);
     });*/

    /* $scope.$watch('dt',function(newVal){
     console.log('dt',newVal);
     });*/

    $scope.open = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.opened = true;
    };


    $scope.openMin = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedMin = true;
    };

    $scope.openMax = function($event) {
        $event.preventDefault();
        $event.stopPropagation();

        $scope.openedMax = true;
    };


    $scope.dateOptions = {
        formatYear: 'yy',
        startingDay: 1
    };

    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
});

