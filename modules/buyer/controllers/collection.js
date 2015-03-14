var app = angular.module("modules.buyer.collection", []);

/**
 * Get collection representation
 */
app.controller('CollectionsController', ['$scope','$rootScope','CollectionService', '$location',
    function ($scope, $rootScope, CollectionService, $location) {

        CollectionService.loadSizes().then(function(response){
            $rootScope.all_sizes=response;
        });

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

        
    }]
);

/**
 * Add new products, create collection controllers
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

        $scope.dropSuccessHandler = function($event,index,object){

            object.photos.splice(index,1);

            if(object.photos.length==0){

                angular.forEach($scope.items,function(item,i){
                    if(item.$$hashKey==object.$$hashKey){

                        $scope.items.splice(i,1);
                    }
                })
            }
        };

        $scope.onDrop = function($event,$data,array){
            array.push($data);
        };

        $scope.upload=function(){
            fileinput = document.getElementById("fileUpload");
            fileinput.click();

        };

        $scope.back=function(){

            if($scope.step==2){
                $scope.step=0;
                $rootScope.photo=undefined;
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
                    $location.path('/buyer/collection');
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

                    if(_.isArray(data)){
                        $scope.items=[];

                        angular.forEach(data,function(value,index){
                            this.push({
                                photos:[value]
                            })
                        },$scope.items);

                        $scope.imagePath = CollectionService.getImagePath();
                        $scope.step++;

                    }
                });
            }

            if($scope.step==1){

                $scope.products=CollectionService.buildProductsArray($scope.items,$rootScope.collection,$rootScope.all_sizes);
                console.log($scope.products);

                if(_.isEmpty($scope.products)== false){

                    CollectionService.loadProducts($scope.products).then(
                        function(response){

                            console.log("loading prod",response);

                            $scope.count=response.length;
                            $scope.step++;
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
                $rootScope.photo=undefined;
                $scope.step=0;
            }
        };

}]);

app.controller("ModalController",function($scope,$rootScope,CollectionService,$location,$modalInstance){

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

        CollectionService.createCollection($rootScope.factoryId).then(function(response){

                if(response){
                    $modalInstance.close(response);
                }

            });
    };
    $scope.chooseSize=function(size){
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

            CollectionService.getCollectionCard($routeParams.collectionId).then(function(response) {

                $scope.items = [], $scope.imagePath = CollectionService.getImagePath();

                if(_.isUndefined(response) == false) {

                    $scope.items = CollectionService.extractProducts(response);
                }
            });



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
            };

            $scope.addToOrder = function(product) {

                var i = CollectionService.compareProduct($scope.items, product);

                if(_.isUndefined(product) == false) {
                    console.log(product);
                }
                else {
                    console.log(product);
                }
            };
            $scope.updateCollection = function(product){

                var i = CollectionService.compareProduct($scope.items, product);

                if(_.isUndefined(product) == false) {

                }
                else {

                }
            };
            $scope.deleteCollection = function(product){

                var i = CollectionService.compareProduct($scope.items, product);

                if(_.isUndefined(product) == false) {

                }
                else {

                }
            };

        }
]);


