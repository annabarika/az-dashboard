var app = angular.module("modules.buyer.collection", []);

/**
 * Get collection representation
 */
app.controller('CollectionsController', ['$scope','$rootScope','CollectionService', '$location',
    function ($scope, $rootScope, CollectionService, $location) {

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
                    CollectionService.getCollections('/factoryId/'+$scope.filteredFactory.join()).then(function(response) {

                        $rootScope.collections = CollectionService.filterCollections(response, $rootScope.factories);

                    });
                }
            }
            else {
                // get all collections
                CollectionService.getCollections().then(function(response) {

                    $rootScope.collections = CollectionService.filterCollections(response, $rootScope.factories);

                });
            }
        });

        // get factories to filter
        CollectionService.getFactories().then(function(response) {

            var factories = [];
            angular.forEach(response, function(value) {
                factories.push(value.factory);
            });

            $rootScope.factories = factories;

        });

        $scope.edit = function(){
            $location.path('/buyer/collection/id/'+$rootScope.row.id)
        };

        /*
         * Add new collection*/
        $scope.newCollection = function(){
            var modalInstance=CollectionService.showModal('NEW',$scope.factories);

            modalInstance.result.then(function(factory){

                $rootScope.factoryId=factory.id;

                CollectionService.getFactoryCollections(factory.id).then(function(response) {

                    $rootScope.factoryCollections=response;

                });

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

app.controller("ModalController",function($scope,$rootScope,CollectionService,$modalInstance){
   // $scope.data=data;
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
    $scope.chooseSize=function(size,count){
       //console.log(size,count);
        size.count=count;
        $modalInstance.close(size);
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

            // Get collection card
            CollectionService.getCollectionCard($routeParams.collectionId).then(function(response) {

                $scope.items = [], $scope.imagePath = CollectionService.getImagePath();

                if(_.isUndefined(response) == false) {

                    $scope.items = CollectionService.extractProducts(response);

                }
            });

            // Load scope sizes
            CollectionService.loadSizes().then(function(response){
                $rootScope.all_sizes=response;
            });

            //Cancel collection
            $scope.cancelCollection = function(){

                console.log('CollectionId:', $routeParams.collectionId);
                return false;
                CollectionService.cancelCollection($routeParams.collectionId);
            };

            // Delete product row
            $scope.deleteProduct = function(productId){

                console.log('CollectionId:', $routeParams.collectionId, 'ProductId:', productId);
                return false;
                CollectionService.deleteProduct($routeParams.collectionId, productId);

            };

            // Add product(s) to order
            $scope.addToOrder = function(product) {

                console.log('ProductId:', product);
                return false;

                if(_.isUndefined(product) == false) {
                    var i = CollectionService.compareProduct($scope.items, product.catalogueProduct);
                    console.log(i);
                    CollectionService.addToOrder($scope.items[i]);
                }
                else {
                    console.log(product);
                    CollectionService.addToOrder($scope.items);
                }

            };

            //Add sizes to product
            $scope.addSize = function(product) {
                var flag=true;

                var i = CollectionService.compareProduct($scope.items, product);

                var modalInstance = CollectionService.showModal("ADDSIZE");
                modalInstance.result.then(function(size){
                    if(_.isUndefined(i) == false) {

                        if(!$scope.items[i].hasOwnProperty('sizes')) {
                            $scope.items[i].sizes=[];
                        }
                        angular.forEach($scope.items[i].sizes,function(value) {

                            if(value.id==size.id) {
                                messageCenterService.add('warning', 'Size already added', { timeout: 3000 });
                                flag=false;
                            }
                        });
                        if(flag){
                            $scope.items[i].sizes.push(size);
                        }
                    }

                });
            }
        }
]);


