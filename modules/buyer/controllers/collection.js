var app = angular.module("modules.buyer.collection", [

]);

app.controller('NewCollectionController', ['$scope','$rootScope','$location','CollectionService',
    function ($scope, $rootScope, $location, CollectionService) {

        // set title
        $rootScope.documentTitle = "Collection";
        CollectionService.debug();
    }]
);