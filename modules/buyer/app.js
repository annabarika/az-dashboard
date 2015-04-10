var app = angular.module('modules.buyer', [
    "modules.buyer.orders",
    "modules.buyer.payments",
    "modules.buyer.bestsellers",
    "modules.buyer.collection",
    "modules.buyer.cargo",
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
        .when('/buyer/bestsellers/calendar/ordered',
        {
            templateUrl:"/modules/buyer/views/bestsellers/ordered.html",
            controller:"BestsellersOrderedController",
            authRequired: 'developer'
        })

        .when('/buyer/bestsellers/',
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
        })
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
    ;
});

app.run( function($rootScope, $location) {

    $rootScope.$on( "$routeChangeStart", function() {
        if ( $rootScope.row == null ) {

            //$location.path('/buyer/orders');

        }})
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

