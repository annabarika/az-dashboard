var app = angular.module("modules.buyer.collection", [

]);

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

        // get factories to filter
        CollectionService.getFactories();

        $scope.edit = function(){
            localStorageService.set('id', $rootScope.row.id);
            $location.path('/buyer/collection/id/'+$rootScope.row.id)
        };
    }]
)

app.controller('CollectionCardController', ['$scope','$rootScope','CollectionService', 'localStorageService',
        function ($scope, $rootScope, CollectionService, localStorageService) {

            CollectionService.getCollectionCard(localStorageService.get('id'));

            // set title
            //$rootScope.documentTitle = 'Collection Card "'+$rootScope.collection.name+'"';


        }]
);