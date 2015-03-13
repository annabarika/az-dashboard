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

        
    }
]);

/**
 * Upload photos controller
 */
app.controller("UploadController",['$scope','$rootScope','$location','CollectionService',"$modal",
    function ($scope, $rootScope, $location, CollectionService,$modal) {
        var fileinput;

        $scope.$watch("photo",function(value){
            $rootScope.photo=value;
        });


        if($rootScope.collection==undefined){
            $location.path("/buyer/collection");
        }

        $scope.collectionTemplates = [
            "modules/buyer/views/collection/upload_files.html",
            "modules/buyer/views/collection/prepare.html",
            "modules/buyer/views/collection/finish.html"
        ];

        $scope.step=0;

        $scope.stepIcons=document.getElementsByClassName('steps');

        $scope.$watch('step',function(newVal){
            $scope.stepIcons[newVal].classList.add('active');
        });

        /* Getting collection */
        $rootScope.documentTitle = "Create New Collection";
        /*$('#sort1, #sort2, #sort3, #sort4').sortable({
         connectWith: ".sort",
         opacity: 0.5,
         dropOnEmpty: true
         }).disableSelection();*/

        $scope.upload=function(){
            fileinput = document.getElementById("fileUpload");
            fileinput.click();

        };



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
        /**
         * include templates and upload photos,products
         */
        $scope.nextStep=function(){
            //show error window
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

                CollectionService.uploadFiles($rootScope.photo).success(function(data){
                    console.log("upload",data);
                    if(_.isArray(data)){
                        $scope.items=data;
                        $scope.imagePath = CollectionService.getImagePath();
                        $scope.step++;

                    }
                });
            }

            if($scope.step==1){

                $scope.products=CollectionService.buildProductsArray($scope.items,$rootScope.collection, $rootScope.all_sizes);
                console.log($scope.products);

                if(_.isEmpty($scope.products)== false){

                    CollectionService.loadProducts($scope.products).then(
                        function(response){

                            console.log("loading prod",response);


                            //$scope.count=response.length;
                            //$scope.step++;
                        }
                    )
                }

            }

            if($scope.step==2){
                console.log("this",$scope.step);
            }
        };
        /**
         *
         * @param index
         */
        $scope.delete=function(index){
            $scope.items.splice(index,1);
            if(_.isEmpty($scope.items)){
                $scope.step=0;
            }
        };

}]);

/**
 * Modal window controller
 */
app.controller("ModalController",function($scope,$rootScope,CollectionService,$modalInstance, $routeParams, $location, messageCenterService, $timeout){

    $scope.cancel = function(){
        $modalInstance.dismiss();
    };
    $scope.chooseFactory = function(factory){
        $modalInstance.close(factory);
    };

    /**
     * Apply collection canceled (deleted)
     */
    $scope.applyCancelCollection = function() {

        CollectionService.cancelCollection($routeParams.collectionId).then(function(response) {

            if(response) {

                $rootScope.collections = CollectionService.filterCollections(response, $rootScope.factories);
                messageCenterService.add('success', 'The collection has been successfully removed', { timeout: 2000 });

                $timeout(function() {
                    $location.path("buyer/collection");
                }, 2000);
            }
            else {
                messageCenterService.add('danger', 'Failed', { timeout: 3000 });
            }
        });

        $modalInstance.close();
    };

    /**
     * Apply product canceled (deleted)
     */
    $scope.applyDeleteProduct = function() {

        CollectionService.deleteProduct($routeParams.collectionId, $rootScope.productId).then(function(response) {

            if(response.hasOwnProperty('status') && _.isUndefined(response.status) === false) {

                $rootScope.items.splice($rootScope.row, 1);

                messageCenterService.add('success', 'Product have been removed from existing collection', { timeout: 3000 });
            }
            else {
                messageCenterService.add('danger', 'Failed', { timeout: 3000 });
            }
        });

        $modalInstance.close();
    };

    $scope.chooseCollection=function(collection){
        $modalInstance.close(collection);
    };

    $scope.createNew=function(){

        CollectionService.createCollection($rootScope.factoryId).then(function(response){

                if(response){
                    $modalInstance.close(response);
                }

            });
    };

    $scope.chooseSize=function(size,count){

        size.count=count;
        $modalInstance.close(size);

    }

});

/**
 * Get collection checkout card
 */
app.controller('CollectionCardController', ['$scope','$rootScope','CollectionService', '$routeParams', 'messageCenterService', 'localStorageService',
        function ($scope, $rootScope, CollectionService, $routeParams, messageCenterService, localStorageService) {
            console.log('This controller');
            // set title
            $rootScope.documentTitle = 'Collection Checkout Card #'+$routeParams.collectionId;

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

                $rootScope.items = [], $scope.imagePath = CollectionService.getImagePath();

                if(_.isUndefined(response) == false) {

                    $rootScope.items = CollectionService.extractProducts(response);
                    localStorageService.set('items', $rootScope.items);
                }
            });

            // Load scope sizes
            CollectionService.loadSizes().then(function(response){
                $rootScope.all_sizes=response;
            });


            //Cancel collection
            $scope.cancelCollection = function(){
                CollectionService.showModal("CANCEL_COLLECTION");
            };

            // Delete product row
            $scope.deleteProduct = function(productId, row) {

                $rootScope.productId = productId;
                $rootScope.row = row;
                CollectionService.showModal("CANCEL_PRODUCT");
            };

            // Add product(s) to order
            $scope.addToOrder = function(product) {

                console.log('ProductId:', product);
                return false;

                if(_.isUndefined(product) == false) {
                    var i = CollectionService.compareProduct($rootScope.items, product.catalogueProduct);
                    console.log(i);
                    CollectionService.addToOrder($rootScope.items[i]);
                }
                else {
                    console.log(product);
                    CollectionService.addToOrder($rootScope.items);
                }

            };

            //Add sizes to product
            $scope.addSize = function(product) {
                var flag=true;

                var i = CollectionService.compareProduct($rootScope.items, product);

                var modalInstance = CollectionService.showModal("ADDSIZE");
                modalInstance.result.then(function(size){
                    if(_.isUndefined(i) == false) {

                        if(!$rootScope.items[i].hasOwnProperty('sizes')) {
                            $rootScope.items[i].sizes=[];
                        }
                        angular.forEach($rootScope.items[i].sizes,function(value) {

                            if(value.id==size.id) {
                                messageCenterService.add('warning', 'Size already added', { timeout: 3000 });
                                flag=false;
                            }
                        });
                        if(flag){
                            $rootScope.items[i].sizes.push(size);
                        }

                        localStorageService.set('items', $rootScope.items);
                    }
                });
            }
        }
]);