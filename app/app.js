(function(){

	angular.module('Azimuth', [
		"ui.router",
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
	;
})();