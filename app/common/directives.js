(function() {
	var app = angular.module('directives', []);

	app.directive("sidebar", function () {
		return {
			restrict: 'E',
			templateUrl: "/views/pages/Elements/sidebar.html"
		};
	});
	app.directive("header", function () {
		return {
			restrict: 'E',
			templateUrl: "/views/pages/Elements/header.html"
		};
	});
	app.directive("footer", function () {
		return {
			restrict: 'E',
			templateUrl: "/views/pages/Elements/footer.html"
		};
	});
})();