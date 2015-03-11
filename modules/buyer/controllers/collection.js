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

        /*
         * Add new collection*/
        $scope.newCollection=function(){
            var modalInstance=CollectionService.showModal('NEW',$scope.factories);

            modalInstance.result.then(function(factory){

                $rootScope.factoryId=factory.id;

                CollectionService.getFactoryCollections(factory.id);

                var modalInstance=CollectionService.showModal("CHOOSE");

                modalInstance.result.then(function(collection){

                    $rootScope.collection=collection;
                    $location.path("buyer/collection/upload");
                })
            });
        };

        $scope.$watch("photo",function(value){
            $rootScope.photo=value;
        });
        
    }]
);

/**
 * Add new products, create collection controllers
 */

app.controller("UploadController",['$scope','$rootScope','$location','CollectionService',"$modal",
    function ($scope, $rootScope, $location, CollectionService,$modal) {
        var fileinput;

        if($rootScope.collection==undefined){
            $location.path("/buyer/collection");
        }

        $scope.collectionTemplates = [
            "modules/buyer/views/collection/upload.html",
            "modules/buyer/views/collection/prepare.html",
            "modules/buyer/views/collection/finish.html"
        ];

        $scope.step=0;

        $scope.stepIcons=document.getElementsByClassName('steps');

        $scope.$watch('step',function(newVal){
            $scope.stepIcons[newVal].classList.add('active');
        });

        /* Getting collection */
        $rootScope.documentTitle = "Collection";
        /*$('#sort1, #sort2, #sort3, #sort4').sortable({
         connectWith: ".sort",
         opacity: 0.5,
         dropOnEmpty: true
         }).disableSelection();*/

        $scope.upload=function(){
            fileinput = document.getElementById("fileUpload");
            fileinput.click();

        };

        //$scope.count=321;

        $scope.back=function(){

            if($scope.step==2){
                console.log("finish",$scope.step);
                $scope.step=0;
                for(i=0;i<$scope.stepIcons.length;i++){
                    $scope.stepIcons[i].classList.remove('active');
                }
            }

            else{
                if($scope.step>0) {
                    console.log($scope.step);
                    $scope.step--;
                }
                else{
                    $location.path('/');
                }
            }
        };

        $scope.nextStep=function(){

            if($rootScope.photo==undefined){

                $rootScope.message="You are forgot upload photo";
                $modal.open({
                    templateUrl: '/app/views/error.html',
                    controller: 'BsAlertCtrl',
                    size: 'lg'
                });
                return;
            }

            if($scope.step==0){

                CollectionService.uploadFiles();
            }

            if($scope.step==1){
                console.log("this",$scope.step);
            }

            if($scope.step==2){
                console.log("this",$scope.step);
            }
        };


        /*$scope.nextStep=function(){
         if( $rootScope.collection){
         console.log($rootScope.collection);
         $scope.step++;
         }
         else{
         $rootScope.message="You are forgot upload photo";
         $modal.open({
         templateUrl: '/app/views/error.html',
         controller: 'BsAlertCtrl',
         size: 'lg'
         });

         }

         }*/

}]);

app.controller("ModalController",function($scope,$rootScope,data,CollectionService,$modalInstance){
    $scope.data=data;
    $scope.cancel=function(){
        $modalInstance.dismiss();
    };
    $scope.chooseFactory=function(factory){
        $modalInstance.close(factory);
    };
    $scope.chooseCollection=function(collection){
        $modalInstance.close(collection);
    };
    $scope.createNew=function(){
        console.log("newCollection",$rootScope.factoryId);
        CollectionService.createCollection($rootScope.factoryId);

    }

});

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