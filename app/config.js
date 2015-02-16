angular.module('BaseConfig', [

]).service('load', function($rootScope){
	var config = {
		API: "http://azimuth/proxy/",
		URLS: {
			APP: "/app/",
			MODULES: "/modules/",
			WIDGETS: "/app/widgets/"
		}
	};
	$rootScope.config = config;

	return $rootScope.config;


});