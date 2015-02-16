angular.module('models.navigation', [

])
	.service('NavigationModel', function($http){
		var model = this,
			navigation;
		model.get = function(){
			return $http.get('/mock/navigation.json');
		}
	})
;
