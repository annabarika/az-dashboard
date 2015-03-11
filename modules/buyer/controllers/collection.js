var app = angular.module("modules.buyer.collection", []);

/**
 * Get collection representation
 */
app.controller('CollectionsController', ['$scope','$rootScope','CollectionService', 'localStorageService', '$location',
    function ($scope, $rootScope, CollectionService, localStorageService, $location) {

        // set title
        $rootScope.documentTitle = "Collection";

        // set table header
        $scope.tableHeader = [
            { name: "id", title: 'ID' },
            { name: "name", title: 'Collection' },
            { name: "factoryName",title:"Factory"},
            { name: "createDate", title: 'Create date'}
        ];
        $scope.filteredFactory = [];

        // Watch factory filters
        $scope.$watch('filter',function(filter) {

            if(_.isUndefined(filter) == false) {

                if(_.isEmpty(filter) == false) {

                    for(var i in filter) {
                        if(filter[i].ticked === true) {
                            $scope.filteredFactory.push(filter[i].id)
                        }
                    };
                    CollectionService.getCollections('/factoryId/'+$scope.filteredFactory.join())
                }
            }
            else {
                // get factories to filter
                CollectionService.getCollections();
            }
        });

        $scope.edit = function(){
            localStorageService.set('id', $rootScope.row.id);
            $location.path('/buyer/collection/id/'+$rootScope.row.id)
        };
    }]
)

/**
 * Get collection card
 */
app.controller('CollectionCardController', ['$scope','$rootScope','CollectionService', '$routeParams',
        function ($scope, $rootScope, CollectionService, $routeParams) {

            // set title
            $rootScope.documentTitle = 'Collection Card #'+$routeParams.collectionId;

            CollectionService.getCollectionCard($routeParams.collectionId).then(function(response) {

                $rootScope.collection = {};

                if(_.isUndefined(response) == false) {

                    $rootScope.collection.push(CollectionService.extractProducts(response));
                }
            });
        }]
);