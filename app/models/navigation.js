angular.module('models.navigation', [

])
	.service('NavigationModel', function($http){
		var model = this,
			navigation;
		model.getNavigation = function(){
			return $http.get('/mock/navigation.json');
		}
	})
;
