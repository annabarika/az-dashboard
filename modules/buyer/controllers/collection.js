var app = angular.module("modules.buyer.collection", []);

/**
 * Get collection representation
 */
app.controller('CollectionsController', ['$scope', '$rootScope', 'CollectionService', '$location',
    function ($scope, $rootScope, CollectionService, $location) {

        var filter = {}, url;

        // set title
        $rootScope.documentTitle = "Collection";

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

                if (response[i].statusId == 2) {
                    statuses.push({id: response[i].statusId, name: response[i].name, ticked: false});
                }
                else {
                    statuses.push({id: response[i].statusId, name: response[i].name, ticked: true});
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

            for (item in newVal) {
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
            //$scope.testId=$rootScope.row.id;
            $location.path('/buyer/collection/id/' + $rootScope.row.id)
        };

        /*
         * Add new collection*/
        $scope.newCollection = function () {
            var modalInstance = CollectionService.showModal('NEW', "sm");

            modalInstance.result.then(function (factory) {

                $rootScope.factoryId = factory.id;

                CollectionService.getFactoryCollections(factory.id).then(function (response) {

                    $rootScope.factoryCollections = response;

                });

                var modalInstance = CollectionService.showModal("CHOOSE", 'sm');

                modalInstance.result.then(function (collection) {

                    $rootScope.collection = collection;
                    $location.path("buyer/collection/upload");
                })
            });
        };

    }
]);

/**
 * Upload photos controller
 */
app.controller("UploadController", ['$scope', '$rootScope', '$location', 'CollectionService', "$modal",
    function ($scope, $rootScope, $location, CollectionService, $modal) {
        var fileinput;
        $scope.$watch("photo", function (value) {
            $rootScope.photo = value;
        });

        if ($rootScope.collection == undefined) {
            $location.path("/buyer/collection");
        }
        else {
            $rootScope.documentTitle = "Collection name: " + $rootScope.collection.name;
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

        $scope.upload = function () {
            fileinput = document.getElementById("fileUpload");
            fileinput.click();
        };

        $scope.back = function () {

            if ($scope.step == 2) {
                $scope.step = 0;
                $rootScope.photo = undefined;
                for (i = 0; i < $scope.stepIcons.length; i++) {

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
            //show error window

            if ($rootScope.photo == undefined) {

                $rootScope.message = "You are forgot upload photo";
                $modal.open({
                    templateUrl: '/app/views/error.html',
                    controller: 'BsAlertCtrl',
                    size: 'lg'
                });
                return;
            }

            if ($scope.step == 0) {
                console.log($scope.step);
                CollectionService.uploadFiles($rootScope.photo).success(function (data) {
                        console.log(data);
                    if (_.isArray(data)) {
                        $scope.items = [];

                        angular.forEach(data, function (value, index) {
                            this.push({
                                photos: [value]
                            })
                        }, $scope.items);

                        $scope.imagePath = CollectionService.getImagePath();
                        $scope.step++;
                        console.log( $scope.step,$scope.items);
                    }
                });
            }

            if ($scope.step == 1) {

                $scope.products = CollectionService.buildProductsArray($scope.items, $rootScope.collection, $rootScope.all_sizes);

                if (_.isEmpty($scope.products) == false) {

                    CollectionService.loadProducts($scope.products).then(
                        function (response) {

                            $scope.count = response.length;

                            $scope.step++;
                        }
                    )
                }

            }

            if ($scope.step == 2) {

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
        $modalInstance.close(factory);
    };

    /**
     * Check out order from compass
     *
     * @param order
     */
    $scope.checkOut = function (order) {

        CollectionService.orderCreate(order).then(function (response) {

            console.log('Order Response create', response);

            if (response.id) {

                CollectionService.productsCreate($rootScope.order).then(function (response) {
                    console.log(response);

                    messageCenterService.add('success', 'Order successfuly created', {timeout: 3000});

                    $timeout(function () {
                        $location.path("buyer/collection");
                    }, 2000);

                    $modalInstance.close();
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
        $rootScope.documentTitle = 'Collection Checkout Card #' + $routeParams.collectionId;
        $scope.tableHeader = [
            {name: "preview", title: 'Preview'},
            {name: "articul", title: 'Articul'},
            {name: "name", title: 'Name'},
            {name: "price", title: 'Price'},
            {name: "factory", title: 'Factory'},
            {name: "sizes", title: 'Sizes'},
            {name: "manage", title: 'Manage'}
        ];

        // Get collection card
        CollectionService.getCollectionCard($routeParams.collectionId).then(function (response) {

            $rootScope.items = [], $scope.imagePath = CollectionService.getImagePath();

            if (_.isUndefined(response) == false) {

                $rootScope.items = CollectionService.extractProducts(response);

                if (_.isEmpty($rootScope.items)) {
                    messageCenterService.add('warning', 'Products not found in this collection', {timeout: 3000});
                }
            }
        });

        // Load scope sizes
        CollectionService.loadSizes().then(function (response) {
            $rootScope.all_sizes = response;
        });

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
        $scope.saveProduct = function (product) {

            CollectionService.saveProduct(product).then(function (response) {

                if (response.catalogueProduct) {
                    messageCenterService.add('success', 'Product row successfuly updated', {timeout: 3000});
                }
                else {
                    messageCenterService.add('danger', 'Error update', {timeout: 3000});
                }
            });
        };

        // Add product(s) to order
        $scope.addToOrder = function (product, position) {
            $scope.position=position;

            // load order types
            CollectionService.loadOrderTypes().then(function (response) {
                $rootScope.all_types = response;

                $rootScope.order = {};

                if (_.isEmpty($rootScope.order.collection)) {
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
                            var i = CollectionService.compareProduct($rootScope.items, product.catalogueProduct);
                            $rootScope.order.items = [];
                            $rootScope.order.items.push($rootScope.items[i]);
                        }

                        console.log('Order', $rootScope.order);

                        if (_.isNull($rootScope.order.collection.orderId)) {
                            // Create new order
                            CollectionService.showModal("ADDORDER");
                        }
                        else
                        {
                            // Add to existing order $rootScope.order.collection.orderId
                            CollectionService.productsCreate($rootScope.order).then(function (response) {

                                messageCenterService.add('success', 'Order successfuly created', {timeout: 3000});

                                $timeout(function () {

                                    if (_.isUndefined($scope.position)) {
                                        // ordered all position -> move to collections
                                        $location.path('/buyer/collection');
                                    }
                                    else {
                                        $rootScope.items[$scope.position].inOrder=true;
                                    }
                                }, 1000);

                            });
                        }
                    });
                }
            });
        };

            //Add sizes to product
            $scope.addSize = function (product) {
                var flag = true;

                var i = CollectionService.compareProduct($rootScope.items, product);

                CollectionService.showModal("ADDSIZE").result.then(function (size) {
                    if (_.isUndefined(i) == false) {

                        if (!$rootScope.items[i].hasOwnProperty('sizes')) {
                            $rootScope.items[i].sizes = [];
                        }
                        angular.forEach($rootScope.items[i].sizes, function (value) {

                            if (value.id == size.id) {
                                messageCenterService.add('warning', 'Size already added', {timeout: 3000});
                                flag = false;
                            }
                        });
                        if (flag) {
                            $rootScope.items[i].sizes.push(size);
                        }
                    }
                });
            }
    }
]);
