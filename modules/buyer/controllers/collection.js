var app = angular.module("modules.buyer.collection", [

]);

app.controller('NewCollectionController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){

            $scope.$route = $route;
            $scope.$location = $location;

            /* Getting collection */
            $rootScope.documentTitle = "Collection";
            $('#sort1, #sort2, #sort3, #sort4').sortable({
                connectWith: ".sort",
                opacity: 0.5,
                dropOnEmpty: true
            }).disableSelection();

        }]);