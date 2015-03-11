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
                    var fFilter = [];
                    for(var i in filter) {
                        if(filter[i].ticked === true) {
                            fFilter.push(filter[i].id)
                        }
                    };

                    $scope.filteredFactory = _.uniq(fFilter, true);
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
app.controller('CollectionCardController', ['$scope','$rootScope','CollectionService', '$routeParams', 'messageCenterService',
        function ($scope, $rootScope, CollectionService, $routeParams, messageCenterService) {

            // set title
            $rootScope.documentTitle = 'Collection Card #'+$routeParams.collectionId;

            $scope.productsHeader = [
                { name: "preview", title: 'Preview' },
                { name: "articul", title: 'Articul' },
                { name: "name", title: 'Name' },
                { name: "price", title: 'Price' },
                { name: "factory", title: 'Factory' },
                { name: "sizes", title: 'Sizes' },
                { name: "manage", title: 'Manage' },
            ];

            CollectionService.getCollectionCard($routeParams.collectionId).then(function(response) {

                $scope.items = [], $scope.imagePath = CollectionService.getImagePath();

                if(_.isUndefined(response) == false) {

                    $scope.items=CollectionService.extractProducts(response);

                }
            });

            $scope.addSize=function(product) {

                //show modal
                modalWindow = $modal.open({
                    templateUrl: "/modules/buyer/views/collection/add_size.html",
                    controller: 'CollectionCardController',
                    backdrop:'static',
                    size:'sm'
                });

            };

            $scope.addToOrder = function(product) {

                // messageCenterService.add('success', 'The cargo has been successfully saved', { timeout: 3000 });
                if(_.isUndefined(product) == false) {
                    console.log(product);
                }
                else {
                    console.log(product);
                }
            };
            $scope.updateCollection = function(product){
                if(_.isUndefined(product) == false) {

                }
                else {

                }
            };
            $scope.deleteCollection = function(product){

                if(_.isUndefined(product) == false) {

                }
                else {

                }
            };

        }]
);