"use strict";

var app = angular.module("modules.buyer.collection", []);

/**
 * Get collection representation
 */
app.controller('CollectionsController', ['$scope', '$rootScope', 'CollectionService', '$location',
    function ($scope, $rootScope, CollectionService, $location) {

        var filter = {}, url;

        var DRAFT = 0, ACTIVE = 1 ;
        // set title
        $rootScope.documentTitle = "Collection";

        // Load scope sizes
        CollectionService.loadSizes().then(function (response) {
            $rootScope.all_sizes = response;
        });



        // set table header
        $scope.tableHeader = [
            {name: "id", title: 'ID'},
            {name: "name", title: 'Collection'},
            {name: "factoryName", title: "Factory"},
            {name: "statusName", title: "Status"},
            {name: "createDate", title: 'Create date'},
            {name:"orderId",title:"Order"}
        ];
        $scope.filteredFactory = [];

        // get statuses to filter
        CollectionService.getCollectionStatuses().then(function (response) {

            var statuses = [];
            for (var i in response) {

                if (response[i].statusId == DRAFT || response[i].statusId == ACTIVE ) {
                    statuses.push({id: response[i].statusId, name: response[i].name, ticked: true });
                }
                else {
                    statuses.push({id: response[i].statusId, name: response[i].name, ticked: false });
                }
            }

            $rootScope.statuses = statuses;

        });

        // get factories to filter
        CollectionService.getFactories().then(function (response) {

            var factories = [];
            angular.forEach(response, function (value) {
                factories.push(value.factory);
            });

            $rootScope.factories = factories;

        });

        // Watch factory filters
        $scope.$watchCollection('filter', function (newVal) {

            for (var item in newVal) {
                var arr = [];

                if ($.isEmptyObject(newVal[item])) {

                    delete filter[item];
                }
                else {
                    angular.forEach(newVal[item], function (value, key) {


                        if (value.ticked === true) {

                            arr.push(value.id);
                            filter[item] = arr;
                        }

                    });
                }
            }
            url = config.API.host + "catalogue-collection/load/status/0,1/";

            if (!$.isEmptyObject(filter)) {


                if (filter.status) {

                    url += "status/" + filter.status.join() + "/";
                }

                if (filter.factory) {

                    url += "factoryId/" + filter.factory.join() + "/";
                }

                CollectionService.getCollections(url).then(function (response) {

                    $rootScope.collections = CollectionService.filterCollections(response, $rootScope.factories, $rootScope.statuses);

                });
            }
            else {
                CollectionService.getCollections(url).then(function (response) {

                    $rootScope.collections = CollectionService.filterCollections(response, $rootScope.factories, $rootScope.statuses);
                    //console.log('All collections', $rootScope.collections);
                });
            }
        });

        $scope.edit = function () {
            $location.path('/buyer/collection/id/' + $rootScope.row.id)
        };

        /*
         * Add new collection*/
        $scope.newCollection = function () {
            var modalInstance = CollectionService.showModal('NEW', "lg");

            modalInstance.result.then(function (factory) {

                $rootScope.factoryId = factory.id;

                CollectionService.getFactoryCollections(factory.id).then(function (response) {

                    $rootScope.factoryCollections = response;

                    console.log($rootScope.factoryCollections);

                    angular.forEach($rootScope.factoryCollections, function(value){

                        if(value.status==0){

                            CollectionService.inSession(value);

                            $location.path("buyer/collection/upload");

                        }
                    });
                    var control=CollectionService.fromSession();
                    console.log(control);
                    if(control==undefined){

                        var modalInstance = CollectionService.showModal("CHOOSE", 'sm');

                        modalInstance.result.then(function (collection) {

                            //$rootScope.collection = collection;
                            CollectionService.inSession(collection);

                            $location.path("buyer/collection/upload");
                        })
                    }
                });




            });
        };

    }
]);

/**
 * Upload photos controller
 */
app.controller("UploadController", ['$scope', '$rootScope', '$location', 'CollectionService', "$modal","$timeout","messageCenterService",
    function ($scope, $rootScope, $location, CollectionService, $modal,$timeout,messageCenterService) {
        var fileinput;

        CollectionService.loadSizes().then(function (response) {
            $rootScope.all_sizes = response;
        });



        $scope.$watch("photo", function (value) {

            $rootScope.photo = value;
        });

        if ($scope.collection == undefined) {
           // $location.path("/buyer/collection");
            $scope.collection=CollectionService.fromSession();
            console.log($scope.collection);
        }
        else {
            $rootScope.documentTitle = "Collection name: " + $scope.collection.name;
        }

        $scope.collectionTemplates = [
            "modules/buyer/views/collection/upload_files.html",
            "modules/buyer/views/collection/prepare.html",
            "modules/buyer/views/collection/finish.html"
        ];

        $scope.step = 0;

        $scope.stepIcons = document.getElementsByClassName('steps');

        $scope.$watch('step', function (newVal) {
            $scope.stepIcons[newVal].classList.add('active');
        });

        /* Getting collection */

        /**
         * fill all articuls
         */
        $scope.addArticules=function(){

            var article=100000;
            angular.forEach($scope.items,function(item){
                if(item["article"]==""){
                    item["article"]=article;
                    article++;
                }

            });
        };
        /**
         * fill all sizes
         */
        $scope.addSizes=function(){
            angular.forEach($scope.items,function(item){
                if(item["sizes"]=="")
                    item["sizes"]='0';
            });
        };
        /**
         * fill all prices
         * @param price
         * @param event
         */
        $scope.addPrices=function(price,event){

            if(_.isUndefined(price) && _.isUndefined(event)){
                $scope.priceFlag=true;
                return;
            }

            if(_.isUndefined(price)){
                messageCenterService.add("danger","Please, enter price",{timeout:3000});
                return;
            }

            if(event.keyCode==13){

                angular.forEach($scope.items,function(item){

                    if(item.price==""|| _.isNull(item.price)){
                        price=price.replace(",",".");
                        item["price"]=price;
                    }

                });
                $scope.priceFlag=false;

            }

        };



        $scope.dropSuccessHandler = function ($event, index, object) {

            object.photos.splice(index, 1);

            if (object.photos.length == 0) {

                angular.forEach($scope.items, function (item, i) {
                    if (item.$$hashKey == object.$$hashKey) {

                        $scope.items.splice(i, 1);
                    }
                })
            }
        };

        $scope.onDrop = function ($event, $data, array) {
            array.push($data);
        };

        $scope.upload = function (flag) {

            fileinput = document.getElementById("fileUpload");

            var dir=fileinput.getAttribute("webkitdirectory");

            if(!_.isNull(dir) && _.isUndefined(flag)){
                fileinput.removeAttribute("webkitdirectory");
            }

            if(_.isNull(dir) && flag ){
                fileinput.setAttribute("webkitdirectory","");
            }

            fileinput.click();
        };






        $scope.back = function () {

            if ($scope.step == 2) {
                $scope.step = 0;
                $rootScope.photo = undefined;
                for (var i = 0; i < $scope.stepIcons.length; i++) {

                    $scope.stepIcons[i].classList.remove('active');
                }
            }

            else {
                if ($scope.step > 0) {

                    $scope.step--;
                }
                else {
                    $location.path('/buyer/collection');
                    $rootScope.photo = undefined;
                }
            }
        };
        /**
         * include templates and upload photos,products
         */
        $scope.nextStep = function () {

            if ($rootScope.photo == undefined) {

                messageCenterService.add("danger","You are forgot upload photo",{timeout:3000});

                return;
            }

            if ($scope.step == 0) {

                var modalInstance=$modal.open({
                        templateUrl: "/modules/buyer/views/collection/progress_to_upload.html",
                        controller: function($scope,CollectionService,photo,$timeout){
                            $scope.photo=photo;

                            $scope.max=$scope.photo.length;

                            $scope.dynamic=0;

                            $scope.items = [];

                            $scope.flagUpload=true;

                            $scope.type='success';

                            var keyArray=[],
                                image,id;

                            for (var key in $scope.photo){

                                if(key!='length' && key!='item')
                                keyArray.push(key);
                            }

                            _Upload(0);
                            /**
                             *
                             * @param i
                             * @private
                             */
                            function _Upload(i){
                                image=$scope.photo[keyArray[i]];

                                CollectionService.uploadFiles(image).success(function (data) {

                                    if (_.isArray(data)) {

                                        //console.log("data upload",data);

                                        $scope.items.push({
                                            photos:data,
                                            article:"",
                                            sizes:"",
                                            price:""
                                        });

                                        //console.log("items array",$scope.items);

                                        $timeout(function(){

                                            $scope.dynamic ++;

                                        }, 200);

                                        i++;

                                        if(i<$scope.max && $scope.flagUpload==true){

                                            _Upload(i);

                                        }else{
                                            if($scope.items.length==$scope.max){

                                                $timeout(function(){

                                                    modalInstance.close($scope.items);

                                                }, 1000);
                                            }
                                        }



                                    }
                                });
                            }

                            /**
                             *
                             * @param i
                             * @private
                             */
                            function _deleteFiles(i){
                                id=$scope.items[i].photos[0].id;
                               // console.log(id);
                                CollectionService.deleteFiles(id).then(
                                    function(response){

                                        if(response=='true'){
                                            $scope.dynamic --;
                                            i++;
                                            if(i<$scope.items.length){
                                                _deleteFiles(i);
                                            }
                                            else{

                                                $timeout(function(){

                                                    modalInstance.dismiss();

                                                }, 1000);


                                                messageCenterService.add("danger","Downloading files interrupted by the user.",{timeout:3000});
                                            }
                                        }

                                    }
                                )
                            }


                            /**
                             * cancel and delete downloads
                             */
                            $scope.cancelUpload=function(){
                                $scope.flagUpload=false;

                                $scope.type='danger';
                                //console.log($scope.items);
                                _deleteFiles(0);
                            }


                        },
                        size:"lg",
                        backdrop:"static",
                        resolve:{
                            photo:function(){
                                return $scope.photo
                            }
                        }
                });
                modalInstance.result.then(function(array){
                    $scope.items=array;

                    $scope.imagePath = CollectionService.getImagePath();

                    console.log("result",$scope.items);
                    $scope.step++;
                    $scope.priceFlag=false;
                });
            }

            if ($scope.step == 1) {

                var validation = CollectionService.validationProducts($scope.items,$rootScope.all_sizes);

                if(validation==-1){
                    $scope.products = CollectionService.buildProductsArray($scope.items, $scope.collection,$rootScope.all_sizes);

                    if (_.isEmpty($scope.products) == false) {

                        CollectionService.loadProducts($scope.products).then(
                            function (response) {
                                console.log("", response);
                                $scope.count = response.length;

                                $scope.step++;
                            }
                        )
                    }
                }
                else{
                    messageCenterService.add("danger", "Row  #"+(validation+1)+" is not a full",{timeout:3000});
                }


            }
        };
        /**
         *
         * @param index
         */
        $scope.delete = function (index) {
            $scope.items.splice(index, 1);
            if (_.isEmpty($scope.items)) {
                $rootScope.photo = undefined;
                $scope.step = 0;
            }
        };

    }]);

/**
 * Modal window controller
 */
app.controller("ModalController", function ($scope, $rootScope, CollectionService, $modalInstance, $routeParams, $location, messageCenterService, $timeout) {

    $scope.cancel = function () {
        $modalInstance.dismiss();
    };

    /**
     * Chose factory
     * @param factory
     */
    $scope.chooseFactory = function (factory) {
        if(_.isUndefined(factory)){
            messageCenterService.add("danger","You are not choose factory",{timeout:3000});
            return;
        }
        $modalInstance.close(factory);
    };

    /**
     * Check out order from compass
     *
     * @param order
     */
    $scope.checkOut = function (order, position) {

        if(CollectionService.isSizesExists(order.items) === false) {

            messageCenterService.add('danger', 'Can not create order with empty sizes count', {timeout: 3000});
            $modalInstance.close();

            return false;
        }

        CollectionService.orderCreate(order).then(function (response) {

            var orderResponse = response;

            if (orderResponse.id) {

                CollectionService.productsCreate($rootScope.order, response.orderId).then(function () {

                    if (_.isUndefined(position)) {

                        // add all positions

                        _.map($rootScope.items, function(positions) {
                            positions.inOrder = true;
                        });
                        $rootScope.isOrderedAll = true;
                    }
                    else {
                        $rootScope.items[$scope.position].inOrder=true;
                    }

                    // Send created order
                    CollectionService.sendCreatedOrder(orderResponse.orderId).then(function(response) {


                        if(response) {
                            messageCenterService.add('success', 'Order successfuly created', {timeout: 3000});
                            $modalInstance.close(orderResponse.orderId, true);
                        }
                        else {
                            messageCenterService.add('danger', 'Failed to Sent Order. Checking connection', {timeout: 3000});
                        }
                    });
                });
            }
            else {
                messageCenterService.add('danger', 'Order does not created', {timeout: 3000});
            }
        });
    };

    /**
     * Apply collection canceled (deleted)
     */
    $scope.applyCancelCollection = function () {

        CollectionService.cancelCollection($routeParams.collectionId).then(function (response) {

            if (response) {

                $rootScope.collections = CollectionService.filterCollections(response, $rootScope.factories, $rootScope.statuses);
                messageCenterService.add('success', 'The collection has been successfully removed', {timeout: 2000});

                $timeout(function () {
                    $location.path("buyer/collection");
                }, 2000);
            }
            else {
                messageCenterService.add('danger', 'Failed', {timeout: 3000});
            }
        });

        $modalInstance.close();
    };

    /**
     * Apply product canceled (deleted)
     */
    $scope.applyDeleteProduct = function () {

        CollectionService.deleteProduct($routeParams.collectionId, $rootScope.productId).then(function (response) {

            if (response.hasOwnProperty('status') && _.isUndefined(response.status) === false) {

                $rootScope.items.splice($rootScope.row, 1);

                messageCenterService.add('success', 'Product have been removed from existing collection', {timeout: 3000});
            }
            else {
                messageCenterService.add('danger', 'Failed', {timeout: 3000});
            }
        });

        $modalInstance.close();
    };

    $scope.columnHeaders=[
        {name:"name"},
        {name:"phone"},
        {name:"email"},
        {name:"docs"}
    ];


    $scope.chooseCollection = function (collection) {
        $modalInstance.close(collection);
    };

    $scope.createNew = function () {

        CollectionService.createCollection($rootScope.factoryId).then(function (response) {

            if (response) {
                $modalInstance.close(response);
            }

        });
    };

    $scope.chooseSize = function (size, count) {

        size.count = count;
        $modalInstance.close(size);

    }

});

/**
 * Get collection checkout card
 */
app.controller('CollectionCardController', ['$scope', '$rootScope', 'CollectionService', '$routeParams', 'messageCenterService', '$timeout', '$location',
    function ($scope, $rootScope, CollectionService, $routeParams, messageCenterService, $timeout, $location) {

        // set title
        $rootScope.documentTitle = 'Collection #' + $routeParams.collectionId;


        $scope.tableHeader = [
            {name: "preview", title: 'Preview'},
            {name: "articul", title: 'Articul'},
            {name: "price", title: 'Price'},
            {name: "factory", title: 'Factory'},
            {name: "sizes", title: 'Sizes'},
            {name: "manage", title: 'Manage'}
        ];

        // Get collection card
        CollectionService.getCollectionCard($routeParams.collectionId).then(function (response) {
            console.log(response);

            //

            $rootScope.items = [], $scope.imagePath = CollectionService.getImagePath();

            if (_.isUndefined(response) == false) {

                $rootScope.items = CollectionService.extractProducts(response);
                console.log($rootScope.items);

                $rootScope.documentTitle += " ("+$rootScope.items[0].factory.name + ")";

                $scope.isOrdered = CollectionService.isOrderByItems($rootScope.items);

                $scope.isOrderedAll = CollectionService.isOrderAll($rootScope.items);

                if (_.isEmpty($rootScope.items)) {
                    messageCenterService.add('warning', 'Products not found in this collection', {timeout: 3000});
                }
                else {

                    // get collection
                    CollectionService.getCurrentCollection($routeParams.collectionId).then(function (response) {

                        $scope.orderId = _.first(response).orderId;

                        //if(!_.isNull($scope.orderId)) {
                        //    CollectionService.getOrderRows($scope.orderId).then(function(response) {
                        //
                        //        //@TODO NEED Collection `productId` for compare with CollectionProduct Rows `productId`
                        //        // Resolve by connect to create - get server
                        //       CollectionService.fetchSizesCount(response, $rootScope.items);
                        //    });
                        //}
                    });
                }
            }
        });
        /**
         *
         * @param count
         * @param index
         * @param product
         */
        $scope.addCount=function(count,index,product){

            if(_.isUndefined(index) && _.isUndefined(product)){

                angular.forEach($rootScope.items,function(item){

                    jQuery.map(item.sizes, function( n) {

                        if(typeof n.count=='string') n.count=parseInt(n.count);

                        return ( n.count+=parseInt(count));
                    });
                })
            }
            else{

                if(_.isUndefined(product)){

                    jQuery.map($rootScope.items[index].sizes, function( n) {

                        if(typeof n.count=='string') n.count=parseInt(n.count);

                        return ( n.count+=parseInt(count));
                    });
                }
                else{
                    var length=$rootScope.items.length;
                    for (var i=0;i<length;i++){
                        if($rootScope.items[i].catalogueProduct.id==product.catalogueProduct.id){

                            if(typeof $rootScope.items[i].sizes[index].count=='string')
                                $rootScope.items[i].sizes[index].count=parseInt($rootScope.items[i].sizes[index].count);

                           $rootScope.items[i].sizes[index].count+=count;
                            return;
                        }
                    }
                }
            }





        };




        //Cancel collection
        $scope.cancelCollection = function () {
            CollectionService.showModal("CANCEL_COLLECTION");
        };

        // Delete product row
        $scope.deleteProduct = function (productId, row) {

            $rootScope.productId = productId;
            $rootScope.row = row;
            CollectionService.showModal("CANCEL_PRODUCT");
        };

        // Delete product row
       /* $scope.saveProduct = function (product) {

            CollectionService.saveProduct(product).then(function (response) {

                if (response.catalogueProduct) {
                    messageCenterService.add('success', 'Product row successfuly updated', {timeout: 3000});
                }
                else {
                    messageCenterService.add('danger', 'Error update', {timeout: 3000});
                }
            });
        };*/

        // Add product(s) to order
        $scope.addToOrder = function (product, position) {

            $scope.position = position;

            // load order types
            CollectionService.loadOrderTypes().then(function (response) {
                $rootScope.all_types = response;

                $rootScope.order = {};

                CollectionService.getCurrentCollection($routeParams.collectionId).then(function (response) {

                    $rootScope.order.collection = _.first(response);

                    //@TODO BuyerId need to be defined
                    $rootScope.order.buyerId = 1;

                    var index = _.first($rootScope.items);
                    $rootScope.order.currencyId = (index.hasOwnProperty('currency'))
                        ? index.currency.id : 5;


                    // add items to collection
                    if (_.isUndefined(product)) {
                        $rootScope.order.items = $rootScope.items;
                    }
                    else {

                        if(CollectionService.isSizeExists(product.sizes) === false) {

                            messageCenterService.add('danger', 'Can not create order with empty sizes count', {timeout: 3000});
                            return false;
                        }

                        var i = CollectionService.compareProduct($rootScope.items, product.catalogueProduct);

                        $rootScope.order.items = [];
                        $rootScope.order.items.push($rootScope.items[i]);
                    }

                    if (_.isNull($rootScope.order.collection.orderId)) {
                        // Create new order
                        $rootScope.position = $scope.position;
                        var modal=CollectionService.showModal("ADDORDER");
                        modal.result.then(function(orderId, ordered) {
                                $scope.orderId = orderId;
                                $scope.isOrdered = ordered;
                            }
                        )
                    }
                    else
                    {
                        // add products to Order
                        CollectionService.getOrder($rootScope.order.collection.orderId).then(function (response) {
                            var orderStatus = parseInt(response.order.status);

                            if(orderStatus != 0) {
                                messageCenterService.add('danger', 'Can not add products to order. Because it\'s not Draft', {timeout: 3000});
                                return false;
                            }
                            else {

                                if(CollectionService.isSizesExists($rootScope.order.items) === false) {

                                    messageCenterService.add('danger', 'Can not create order with empty sizes count', {timeout: 3000});
                                    return false;
                                }

                                // Add to existing order $rootScope.order.collection.orderId
                                CollectionService.productsCreate($rootScope.order).then(function (response) {

                                    messageCenterService.add('success', 'Order successfuly created', {timeout: 3000});

                                    if (_.isUndefined($scope.position)) {

                                        // add all positions

                                        _.map($rootScope.items, function(positions) {
                                            positions.inOrder = true;
                                        });
                                        $scope.isOrdered = true;
                                        $rootScope.isOrderedAll = CollectionService.isOrderAll($rootScope.items);
                                    }
                                    else {
                                        $rootScope.items[$scope.position].inOrder=true;
                                        $scope.isOrdered = true;
                                    }
                                });
                            }
                            $scope.orderId = $rootScope.order.collection.orderId;
                        });
                    }
                });
            });
        };

    }
]);
