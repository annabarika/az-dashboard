var app = angular.module("modules.buyer.collection", [

]);

app.controller('NewCollectionController', ['$scope','$rootScope','$location','CollectionService',
    function ($scope, $rootScope, $location, CollectionService) {

        console.log('SSSS');
        // set title
        $scope.documentTitle = "Collection";
        CollectionService.debug();
    }]
);