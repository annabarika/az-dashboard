var config = {
	API: {
		host:"http://green.f.compass/api/",
		key: 'test'
	},
    monthNames : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"]
};

(function(){

	angular.module('Azimuth', [
		"ngRoute",
		"directives",
		"models.navigation",
		"multi-select",
		"widgets",
		"ui.bootstrap",
		"services",
		"modules.buyer",
        'MessageCenterModule'
	])

		.config(function ($routeProvider, $locationProvider, $httpProvider) {

			//$httpProvider.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded;charset=utf-8';

				// Intercept POST requests, convert to standard form encoding
				/*$httpProvider.defaults.headers.post["Content-Type"] = "application/x-www-form-urlencoded";
				$httpProvider.defaults.transformRequest.unshift(function (data, headersGetter) {
					var key, result = [];
					for (key in data) {
						if (data.hasOwnProperty(key)) {
							result.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
						}
					}
					return result.join("&");
				});*/

			$locationProvider.html5Mode(true);

			$routeProvider

				.when("/",
				{
					templateUrl: "/app/views/startpage.html",
					controller:"MainController"
				}
			)
				.otherwise(
				{
					redirectTo:'/'
				}
			);
		})

		.controller("MainController", function($scope, NavigationModel){
			NavigationModel.get().then(function(result){ $scope.Navigation = result.data; });
		})

		.controller('BsAlertCtrl', ["$rootScope","$scope", function ($rootScope,$scope) {
			var alerts = [
				{
					type: 'danger',
					msg: 'Oh snap! Change a few things up and try submitting again.'
				},
				{
					type: 'success',
					msg: 'Well done! You successfully read this important alert message.'
				},
				{
					type: 'info',
					msg: 'Heads up! This alert needs your attention, but it\'s not super important.'
				},
				{
					type: 'warning',
					msg: 'Warning! Better check yourself, you\'re not looking too good.'
				}];

		/*	$scope.$watch('message',function(value){
				$scope.msg=value;
			});*/
			/*$rootScope.addAlert = function() {
			 $rootScope.alerts.push({
			 msg: 'Another alert!'
			 });
			 };*/
			$rootScope.changeAlert=2;

			$scope.$watch('changeAlert',function(newVal){

				$scope.alert=alerts[newVal];
				$scope.alertFlag=false;
			});

			$scope.alertFlag=true;

			$scope.alert=alerts[$rootScope.changeAlert];

			/*$rootScope.closeAlert = function(index) {
			 $scope.alert=null;
			 };*/
		}]);

})();
