"use strict";

var app = angular.module("modules.buyer.collection", []);

app.run(
    [
        "$rootScope",
        "$http",
        "CollectionService",

        function($rootScope,$http,CollectionService){
            /**
             * load factory
             */
            CollectionService.getFactories()
                .success(function(data){
                    $rootScope.fullFactories=data;
                    //console.log("full",$rootScope.fullFactories);
                    var factories = [];
                     angular.forEach(data, function (value) {

                         var files=value.factoryFiles;
                         value.factory['files']=files;

                     factories.push(value.factory);
                     });

                    $rootScope.factories = factories;
                   /* console.log("success factory", $rootScope.factories);*/
                });

            /**
             * load statusses
             */
            CollectionService.getCollectionStatuses()
                .success(function(data){

                    $rootScope.statuses = data;
                    //console.log("success status",$rootScope.statuses );

                })
        }
    ]);

/**
 * Get collection representation
 */
app.controller('CollectionsController', ['$scope', '$rootScope', 'CollectionService', '$location',"messageCenterService",
    function ($scope, $rootScope, CollectionService, $location, messageCenterService) {

        var filter = {}, url;

        // set title
        $rootScope.documentTitle = "New collections";

       // $scope.statusFlag=0;

        // Load scope sizes
        CollectionService.loadSizes().then(function (response) {
            $rootScope.all_sizes = response;
        });

        $rootScope.hideHeader = 'showHeader';

        // Load imagePath
        $scope.imagePath = CollectionService.getImagePath();

        $scope.filteredFactory = [];

        var url = config.API.host + "catalogue-collection/load/status/0";
        _loadCollections(url);


        function _loadCollections(url){
            CollectionService.getCollections(url).then(function (response) {
                /*console.log($rootScope.factories);*/
                $rootScope.collections = CollectionService.filterCollections(response, $rootScope.factories, $rootScope.statuses);

                var length=$rootScope.collections.length;

                if(length==0){
                    messageCenterService.add("danger","Empty collections array",{timeout:3000});
                }



            });
        }

        /**
         * location to collection cart
         */
        $scope.edit = function () {

            $location.path('/buyer/collection/id/' + $rootScope.row.id)
        };

        $scope.uploadProducts=function(collection){
            //console.log(collection);

            CollectionService.inSession(collection,"collection");

            var length=$rootScope.factories.length;

            for(var i=0;i<length;i++){

                if($rootScope.factories[i].id==collection.factoryId){

                    CollectionService.inSession($rootScope.factories[i],"factory");

                    break;
                }
            }

            $location.path("buyer/collection/upload");

        };

        $scope.readyCollections = function(){
            $location.path("buyer/collection/ready");
        };
        /*
         * Add new collection*/
        $scope.newCollection = function () {

            var control = CollectionService.fromSession("collection");

            if(control){
                CollectionService.deleteSession('collection');
            }

            var modalInstance = CollectionService.showModal('NEW', "lg");
            /**
             * choose factory
             */
            modalInstance.result.then(function (factory) {

                CollectionService.inSession(factory,"factory");

                $rootScope.factoryId = factory.id;

                CollectionService.getFactoryCollections(factory.id).then(function (response) {

                    $rootScope.factoryCollections = response;

                    //console.log("factory collections",$rootScope.factoryCollections);


                    if(response.length!=0){

                        angular.forEach($rootScope.factoryCollections, function(value){

                            if(value.status==0 || value.status==1){

                                CollectionService.inSession(value,"collection");

                                $location.path("buyer/collection/upload");

                            }
                        });

                    }
                    else{

                        CollectionService.createCollection($rootScope.factoryId).then(function (response) {

                            if (response.factoryId==$rootScope.factoryId) {

                                CollectionService.inSession(response,"collection");

                                $location.path("buyer/collection/upload");

                            }

                        });

                    }

                });




            });
        };
    }
]);

app.controller("CollectionsReadyController",
    [
        "$scope",
        "$rootScope",
        "$location",
        "CollectionService",
        "messageCenterService",

        function($scope,$rootScope,$location,CollectionService,messageCenterService){

            //document Title
            $rootScope.documentTitle = "Ready collections";

            // Load imagePath
            $scope.imagePath = CollectionService.getImagePath();
            /**
             *
             * @type {string}
             */
            var url = config.API.host + "catalogue-collection/load/status/1/";
            _loadCollections(url);

            /**
             *
             * @param url
             * @private
             */
            function _loadCollections(url){
                CollectionService.getCollections(url).then(function (response) {

                    $scope.collections = CollectionService.filterCollections(response, $rootScope.factories, $rootScope.statuses);
                     //console.log($scope.collections);
                    var keys=[],
                        length=$scope.collections.length;



                    if(length!=0){
                        for(var i=0;i<length;i++){
                            keys.push({
                                position:i,
                                id:$scope.collections[i].id
                            });

                        }
                        //console.log("keys",keys);
                        _getAllProducts(0,keys);
                    }
                    else{
                        messageCenterService.add("danger","Empty collections array",{timeout:3000});
                    }



                });
            }

            /**
             *
             * @param i
             * @param keys
             * @private
             */
            function _getAllProducts(i,keys){

                CollectionService.getCollectionCard(keys[i].id).then(
                    function(response){

                        if(response.length!=0){
                            $scope.collections[keys[i].position]['products']=response;
                        }
                        else{
                            $scope.collections[keys[i].position]['products']=null;
                        }
                        i++;
                        if(i<keys.length){
                            _getAllProducts(i,keys);
                        }
                        else{
                             //console.log("final",$scope.collections);
                        }

                    });
            }

            /**
             *
             * @param item
             */
            $scope.showCart=function(item){
                //console.log(item);
                $location.path('/buyer/collection/id/' + item.id)
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
            //console.log( "sizes",$rootScope.all_sizes);
        });
        //TODO избавить от watch
        $scope.$watch("photo", function (value) {
            //console.log("watcher",value);
            $rootScope.photo = value;
        });

        if ($scope.collection == undefined) {
            // $location.path("/buyer/collection");
            $scope.collection=CollectionService.fromSession("collection");
            //console.log($scope.collection);
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
        /**
         *
         * @param value
         */
        $scope.deleteFile=function(value){
            console.log(value);
            for(var key in $scope.photo){

                if($scope.photo[key].name==value.name){

                    console.log($scope.photo[key], key);

                    $scope.photo=_.omit($scope.photo, key);

                    $scope.photo.length--;

                }
            }
            //console.log($scope.photo);

        };
        /* Getting collection */
        /**
         * fill all articuls
         */
        $scope.addArticules=function(){

            $scope.items=CollectionService.completeProducts($scope.items,'article',100000,true);
        };
        /**
         * fill all sizes
         */
        $scope.addSizes=function(){

            $scope.items=CollectionService.completeProducts($scope.items,'sizes','0');
        };
        /**
         * show input element
         */
        $scope.showInput=function(){
            $scope.priceFlag=true;
        };
        /**
         * fill all prices
         * @param price
         * @param event
         */
        $scope.addPrices=function(price,event){

            if(_.isUndefined(price)){
                messageCenterService.add("danger","Please, enter price",{timeout:3000});
                return;
            }


            if(event.keyCode==13){

               /* console.log(parseFloat(price));
                if(parseFloat(price)==NaN){
                    messageCenterService.add("danger","Please use only numbers and point in price fields ",{timeout:3000});
                    return;
                }*/

               $scope.items=CollectionService.completeProducts($scope.items,'price',price);
               $scope.priceFlag=false;
            }

        };

        /**
         *drop files to prepare products
         * @param $event
         * @param index
         * @param object
         */
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
        /**
         * drop files to prepare products
         * @param $event
         * @param $data
         * @param array
         */
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
        /**
         * back to previous step
         */
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

            if ($scope.photo == undefined || $scope.photo.length==0) {
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
                            $scope.uploadLoaded=0;
                            image=$scope.photo[keyArray[i]];
                            /**
                             * ITS CODE FOR FILE UPLOADER SERVICE
                             */
                           /* CollectionService.uploadFiles(image);

                            $scope.$watch('uploadProgress',function(val){
                                if(val){
                                    $timeout(function(){
                                        $scope.uploadLoaded=val;
                                    },10);
                                }
                            });
                            $scope.$watch('resultUploadData',function(val){
                                if(val){
                                    if (_.isArray(val)) {
                                        $scope.items.push({
                                            photos:val,
                                            article:"",
                                            sizes:"",
                                            price:""
                                        });

                                        $rootScope.resultUploadData=undefined;

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
                                }
                            });*/

                            CollectionService.uploadFiles(image).success(function (data) {
                                if (_.isArray(data)) {
                                    $scope.items.push({
                                        photos:data,
                                        article:"",
                                        sizes:"",
                                        price:""
                                    });

                                    $timeout(function(){
                                        $scope.dynamic ++;
                                    }, 200);
                                    i++;
                                    if(i<$scope.max && $scope.flagUpload==true){
                                        console.log($scope.flagUpload);
                                        _Upload(i);
                                    }else{
                                        if($scope.items.length==$scope.max && $scope.flagUpload==true){
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
                            console.log($scope.flagUpload);
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
                    $scope.step++;
                    $scope.priceFlag=false;
                });
            }

            if ($scope.step == 1) {

                var validation = CollectionService.validationProducts($scope.items,$rootScope.all_sizes);

                if(validation==-1){
                    var factory=CollectionService.fromSession('factory');

                    $scope.products = CollectionService.buildProductsArray($scope.items, $scope.collection,factory.currencyId);

                    if (_.isEmpty($scope.products) == false) {

                        CollectionService.loadProducts($scope.products).then(
                            function (response) {
                               // console.log("", response);

                                if(response=='null'){
                                    messageCenterService.add('danger','ERROR: can not to create products',{timeout:3000});
                                }
                                if(_.isArray(response) && response.length!=0){

                                    $scope.count = response.length;

                                    CollectionService.updateCollection($scope.collection.id,1).then(
                                        function (response){
                                            //console.log("update col.status",response);
                                        }
                                    );
                                    $scope.step++;
                                }
                            }
                        )
                    }
                }
                else{
                    messageCenterService.add("danger", validation,{timeout:3000});
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

    $scope.factoryAll=CollectionService.getFactoriesByGroup($rootScope.fullFactories);
    /**
     * close modal window
     */
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
     * headers for autocomplete choose factory
     * @type {{name: string, title: string}[]}
     */
    $scope.columnHeaders=[
        {name   :   "name",     title:"Factory"},
        {name   :   "phone",    title:"Phone"},
        {name   :   "address",  title:"Address"},
        {name   :   "preview",  title:"Visit cards"}
    ];
    /**
     * filter property for autocomplete
     * @type {string[]}
     */
    $scope.filterProperty=['name','phone'];
    /**
     * image path for autocomplete
     * @type {*}
     */
    $scope.imagePath = CollectionService.getImagePath();
    /**
     * choose collection
     * @param collection
     */
    $scope.chooseCollection = function (collection) {
        $modalInstance.close(collection);
    };
    /**
     * create new collection
     */
    $scope.createNew = function () {
        CollectionService.createCollection($rootScope.factoryId).then(function (response) {
            if (response) {
                $modalInstance.close(response);
            }
        });
    };
    /**
     * add new size for product
     * @param size
     * @param count
     */
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
        /**
         * get image path
          * @type {*}
         */
        $scope.imagePath = CollectionService.getImagePath();
        /**
         * get current collection
         * get orderId (if exist)
         */
        CollectionService.getCurrentCollection($routeParams.collectionId).then(function (response) {
            console.log("current collection", response);
            $scope.collection = _.first(response);
            $scope.orderId = $scope.collection.orderId;
        });


        $scope.type= _.find($rootScope.types,{entity:'order',name:"collection"});
        /**
         * Header for table widget
         * @type {{name: string, title: string}[]}
         */
        $scope.tableHeader = [
            {name: "preview", title: 'Preview'},
            {name: "articul", title: 'Articul'},
            {name: "price", title: 'Price'},
            {name: "factory", title: 'Factory'},
            {name: "sizes", title: 'Sizes'},
            {name: "manage", title: 'Manage'}
        ];

        /**
         * get collection products and currencyId
         */
        CollectionService.getCollectionCard($routeParams.collectionId).then(function (response) {

            if (response) {
                $scope.items = CollectionService.extractProducts(response);

                $rootScope.documentTitle += "("+$scope.items[0].factory.name + ")";

                $scope.isOrdered = CollectionService.isOrderByItems($scope.items);

                $scope.isOrderedAll = CollectionService.isOrderAll($scope.items);

                var index = _.first($scope.items);
                $scope.currencyId = (index.hasOwnProperty('currency')) ? index.currency.id : 5;


                if (_.isEmpty($scope.items)) {
                    messageCenterService.add('warning', 'Products not found in this collection', {timeout: 3000});
                }
            }

        });
        /**
         * add count to item sizes
         * @param count
         * @param index
         * @param product
         */
        $scope.addCount=function(count,index,product,size){

            function _counter(n){
                if(typeof n.count=='string') n.count=parseInt(n.count);
                return  n.count+=parseInt(count);
            }

            if(_.isUndefined(index) && _.isUndefined(product)){
                angular.forEach($scope.items,function(item){
                    _.map(item.sizes,_counter);
                })
            }
            else{
                if(_.isUndefined(product)){
                    _.map($scope.items[index].sizes,_counter);
                }
                else{
                    console.log($scope.items,size);
                    var length=$scope.items.length;
                    for (var i=0;i<length;i++){
                        if($scope.items[i].catalogueProduct.id==product.catalogueProduct.id){
                            if(typeof $scope.items[i].sizes[size.id].count=='string')
                                $scope.items[i].sizes[size.id].count=parseInt($scope.items[i].sizes[size.id].count);
                            $scope.items[i].sizes[size.id].count+=count;
                            return;

                        }
                    }
                }
            }
        };
        /**
         * remove size count
         * @param index
         * @param product
         */
        $scope.removeCount=function(index,product,size){

            function _reCount(i){
                return i.count=0;
            };

            if(_.isUndefined(index) && (_.isUndefined(product))){
                angular.forEach($scope.items,function(item){
                    _.map(item.sizes, _reCount)
                })
            }
            else{
                if(_.isUndefined(product)){
                    _.map($scope.items[index].sizes, _reCount);
                }
                else{
                    var length=$scope.items.length;
                    console.log($scope.items,index);
                    for (var i=0;i<length;i++){
                        if($scope.items[i].catalogueProduct.id==product.catalogueProduct.id){
                            $scope.items[i].sizes[size.id].count=0;
                            return;
                        }
                    }
                }
            }
        };
        //Cancel collection
        $scope.cancelCollection = function () {
            var modalInstance=CollectionService.showModal("CANCEL_COLLECTION");
            modalInstance.result.then(function(){
                CollectionService.cancelCollection($routeParams.collectionId).then(function (response) {
                        console.log("cancel collection",response);

                    if (response.status==2) {
                        //$rootScope.collections = CollectionService.filterCollections(response, $rootScope.factories, $rootScope.statuses);
                        messageCenterService.add('success', 'The collection has been successfully removed', {timeout: 2000});

                        $timeout(function () {
                            $location.path("buyer/collection");
                        }, 2000);
                    }
                    else {
                        messageCenterService.add('danger', 'Failed', {timeout: 3000});
                    }
                });
            })
        };

        // Delete product row
        $scope.deleteProduct = function (productId, row) {
            console.log(productId,row);
            /*$rootScope.productId = productId;
            $rootScope.row = row;*/
            var modalInstance=CollectionService.showModal("CANCEL_PRODUCT");
            modalInstance.result.then(
                function(){
                    CollectionService.deleteProduct($scope.collection.id,productId).then(function (response) {

                        if (response.hasOwnProperty('status') && _.isUndefined(response.status) === false) {

                            $scope.items.splice(row, 1);

                            messageCenterService.add('success', 'Product have been removed from existing collection', {timeout: 3000});
                        }
                        else {
                            messageCenterService.add('danger', 'Failed', {timeout: 3000});
                        }
                    });
                }
            );
        };
        /**
         * add collection to order
         * @returns {boolean}
         */
        $scope.createOrder=function(){
            /**
             * if size count==0 return
             */
            if(CollectionService.isSizesExists($scope.items) === false) {
                messageCenterService.add('danger', 'Can not create order with empty sizes count', {timeout: 3000});
                return false;
            }

            /**
             * if orderId==null create new order
             */
            if(_.isNull($scope.orderId)){

                CollectionService.orderCreate($rootScope.user.id,$scope.collection,$scope.currencyId,$scope.type).then(function(response){
                    if(_.has(response,'id')){
                        console.log("success create order",response);
                        $scope.orderId =response.id;
                        $scope.createOrder();
                    }
                });
            }
            else{
                $scope.order={};
                $scope.order.collection=$scope.collection;
                $scope.order.buyerId = $rootScope.user.id;
                $scope.order.currencyId = $scope.currencyId;
                $scope.order.items = $scope.items;
                console.log($scope.order);

                CollectionService.getOrder($scope.orderId).then(function (response) {
                    console.log("get order",response);
                    var orderStatus = parseInt(response.order.status);

                    if(orderStatus != 0) {
                        messageCenterService.add('danger', 'Can not add products to order. Because it\'s not Draft', {timeout: 3000});
                        return false;
                    }
                    else {
                        // Add to existing order $rootScope.order.collection.orderId
                        CollectionService.productsCreate($scope.order,$scope.orderId).then(function (response) {
                            if(response!='null'){
                                CollectionService.updateCollection($scope.collection.id,3).then(
                                    function(response){
                                        if(_.has(response,"status") && response.status==3){
                                            $scope.collection=response;
                                            console.log($scope.collection);
                                            $scope.isOrdered = true;
                                            $rootScope.isOrderedAll = true;
                                            window.location.reload();
                                        }
                                    }
                                );
                                messageCenterService.add('success', 'Order successfuly created', {timeout: 3000});
                            }
                            else{
                                messageCenterService.add('danger', 'Products is not created', {timeout: 3000});
                            }
                        });
                    }

                });
            }
        };
    }
]);

app.controller('FactoryController',[
    "$scope",
    '$rootScope',
    '$route',
    function($scope,$rootScope,$route){

        $rootScope.documentTitle='Factory Cart';
        $scope.test='hello world';
    }
])