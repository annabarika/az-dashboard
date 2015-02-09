(function(){

	var app = angular.module('core', ['directives']);

	app.controller('LayoutController', ['$http', '$scope', function($http, $scope){
		$scope.Navigation = [];
		$http.get('/mock/navigation.json').success(function(data){
			$scope.Navigation = data;
		});
	}]);

})();