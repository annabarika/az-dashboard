(function(){

	var app = angular.module('core',
		[
			'directives',
			"ngRoute",
			"BuyingOffice",
			"widgtable",
			"multi-select",
			"widgtoolbar",
			"widgmodal",
            "mgcrea.ngStrap",

		]);

		app.config(function($routeProvider, $locationProvider, $httpProvider){

			$httpProvider.defaults.useXDomain = true;
			delete $httpProvider.defaults.headers.common['X-Requested-With'];

			$locationProvider.html5Mode(true);

			$routeProvider

				.when("/",
					{
						templateUrl:"/views/pages/startpage.html",
						controller:"LayoutController"
					}
				)
				.otherwise(
					{
						redirectTo:'/'
					}
				);
		});



	app.controller('LayoutController',
		[
			'$http',
			'$scope',
			"$rootScope",
			"$location",

		function($http, $scope,$rootScope,$location){

		$scope.Navigation = [];

		$http.get('/mock/navigation.json').success(function(data){
			$scope.Navigation = data;
		});

		$scope.test="angular 1.3.13";

		$scope.back=function(){
			$location.path("/");
		};

		$scope.module_route=function(url){

			$location.path(url);
		};



	}]);

})();