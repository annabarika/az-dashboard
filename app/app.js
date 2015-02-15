
(function(){

	angular.module('Azimuth', [
		"ui.router",
		"directives",
		"models.navigation",
		"modules.buyer"

	])
	.config(function ($stateProvider, $urlRouterProvider) {
			$stateProvider
				//abstract state serves as a PLACEHOLDER or NAMESPACE for application states
				.state('azimuth', {
					url: '',
					abstract: true
				})
			;
			$urlRouterProvider.otherwise('/');
		})
		.controller("MainController", function($scope, $state, NavigationModel){
			NavigationModel.getNavigation().then(function(result){ $scope.Navigation = result.data; });
		})
	;
})();