var app = angular.module('modules.buyer', [
	"modules.buyer.orders",
	"modules.buyer.payments",
	"modules.buyer.bestsellers",
    "modules.buyer.collection"
]);

app.config(function($routeProvider){

	$routeProvider
		.when('/buyer/orders',
		{
			templateUrl:"/modules/buyer/views/orders/index.html",
			controller:"OrderListController"
		}
	)
		.when('/buyer/orders/id/:orderId',
		{
			templateUrl:"/modules/buyer/views/orders/id.html",
			controller:"OrderController"
		}
	)
		.when('/buyer/bestsellers',
		{
			templateUrl:"/modules/buyer/views/bestsellers/index.html",
			controller:"BestCalendarController"
		}
	)
		.when('/buyer/payments',
		{
			templateUrl:"/modules/buyer/views/payments/index.html",
			controller:"PaymentListController"
		}
	)
        .when('/buyer/collection',
        {
            templateUrl:"/modules/buyer/views/collection/index.html",
            controller:"NewCollectionController"
        }
    );
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
	});

	$scope.$watch('dt',function(newVal){
		console.log(newVal);
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

