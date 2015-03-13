(function(){

    angular.module("services.collections",['LocalStorageModule'])

        .config(['localStorageServiceProvider', function(localStorageServiceProvider){
            localStorageServiceProvider.setPrefix('collections');
            localStorageServiceProvider.setStorageType('localStorage');
        }])

        // create config API ROUTES
        .constant('API', (function () {

            return {
                FACTORIES       :   config.API.host+'factory/load',
                COLLECTIONS     :   config.API.host+'catalogue-collection/load/status/0',
                COLLECTION_CARD :   config.API.host+'catalogue-collection/get-collection-products/collectionId/',
                IMAGES_PATH     :   config.API.imagehost+'/files/factory/attachments/',
                FACTORYCOLLECTIONS: config.API.host+"catalogue-collection/load/factoryId/",
                CREATECOLLECTION:   config.API.host+"catalogue-collection/create",
                LOADFILES       :   config.API.host+'catalogue/loadfiles',
                CANCELPRODUCT   :   config.API.host+'catalogue-collection/delete-collection-product/',
                CANCELCOLLECTION   : config.API.host+'catalogue-collection/cancel/',
                LOADSIZES       :   config.API.host+'size/load',
                LOADPRODUCTS    :   config.API.host+'catalogue-collection/add-collection-product',
                LOADORDERTYPES  :   config.API.host+'order-type/load/',
                ORDERCREATE     :   config.API.host+'order/create',
                PRODUCTSCREATE  :   config.API.host+'jsoncreate.php',
                ADDORDERTOCOLLECTION  :   config.API.host+'catalogue-collection/add-order-collection',
                CREATEPRODUCTFACTORY  : config.API.host+'order/create-factory-row'
            };
        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {
                NEW    :   "/modules/buyer/views/collection/choose_factory.html",
                CHOOSE :   "/modules/buyer/views/collection/choose_collection.html",
                ADDSIZE:   "/modules/buyer/views/collection/add_size.html",
                ADDORDER:   "/modules/buyer/views/collection/add_order.html",
                CANCEL_COLLECTION :   "/modules/buyer/views/collection/ask_collection.html",
                CANCEL_PRODUCT :   "/modules/buyer/views/collection/ask_product.html"
            };

        })())

        .factory("CollectionService", ['API', 'TEMPLATE', 'RestFactory', '$modal', '$http',
            function(API, TEMPLATE, RestFactory, $modal, $http) {

            return {
                
                /**
                 * Get All factories
                 *
                 * @returns {*}
                 */
                getFactories: function () {

                    return RestFactory.request(API.FACTORIES);
                },

                /**
                 * Get All Collections
                 *
                 * @param params
                 * @returns {*}
                 */
                getCollections: function (params) {

                    var url = (_.isUndefined(params) == false) ? API.COLLECTIONS+params : API.COLLECTIONS;

                    return RestFactory.request(url);
                },

                /**
                 *  Return filtered collections
                 *
                 * @param factories
                 * @returns {Array}
                 */
                filterCollections : function(response, factories) {

                    var collections = [];
                    angular.forEach(response, function(value) {

                        angular.forEach(factories, function(factory) {

                            if(factory.id == value.factoryId) {
                                value.factoryName = factory.name;
                            }
                        });
                        collections.push(value);
                    });

                    return collections;
                },

                /**
                 * /**
                 * Get collections by factory
                 *
                 * @param id
                 * @returns {*}
                 */
                getFactoryCollections : function(id){

                    var url = API.FACTORYCOLLECTIONS+id;

                    return RestFactory.request(url);
                },

                /**
                 * Get Card of selected collection
                 *
                 * @returns {*}
                 */
                getCollectionCard: function (id) {

                    var url = API.COLLECTION_CARD+id;
                    return RestFactory.request(url);
                },

                /**
                 * Get compare product index
                 *
                 * @param items
                 * @param product
                 */
                compareProduct: function(items, product) {

                    var i;
                    angular.forEach(items, function(collection, index) {

                        if(collection.catalogueProduct.id === product.id) {

                            i = index;
                        }
                    });

                    return i;
                },
                buildProductsArray:function(data,collection,sizes){
                    //console.log(data,collection);
                    var array=[];

                    angular.forEach(data,function(value,i){

                        sizes=value.sizes.split(/[\s,]+/);

                        //console.log(sizes);
                        var product={
                            articul:value.article,
                            price:value.price,
                            collectionId:collection.id,
                            photos:[value.id],
                            sizes:sizes,
                            currensyId:'5',
                            factoryId:collection.factoryId
                        };

                        this.push(product);

                    },array);
                    //console.log("this",array);
                    return array;
                },

                /**
                 *
                 * @param products
                 */
                loadProducts:function(products){
                    var params={},i=1;
                    angular.forEach(products,function(value,key){
                        params['product'+i]=value;
                        i++;
                    });
                    var query= $.param(params);
                    console.log("q",query,params);
                    return RestFactory.request(API.LOADPRODUCTS,"POST", query);
                },
                /**
                 * Extract server response data requested by collectionId
                 *
                 * @param data
                 * @returns {Array}
                 */
                extractProducts: function(data) {

                    for (var first in data) break;
                    var first = data[first], res = [];

                    if(_.isEmpty(first) === false) {

                        angular.forEach(first, function(collections, index) {

                            angular.forEach(collections, function(product) {

                                // assign sizes count to product
                                if(product.hasOwnProperty('sizes') && _.isEmpty(product.sizes) == false) {
                                    angular.forEach(product.sizes, function(value, index) {

                                        product.sizes[index].count = '0';
                                    });
                                }

                                res.push(product);
                            });
                        });
                    }
                    return res;
                },

                /**
                 * Cancel collection
                 */
                cancelCollection: function (collectionId) {

                    return RestFactory.request(API.CANCELCOLLECTION, 'PUT', $.param({'id' : collectionId}));
                },

                /**
                 * Delete product
                 */
                deleteProduct: function (collectionId, productId) {

                    var url = API.CANCELPRODUCT+'collectionId/'+collectionId+'/productId/'+productId;

                    return RestFactory.request(url, 'DELETE');
                },

                /**
                 * Get image path
                 *
                 * @returns {*}
                 */
                getImagePath: function() {

                    return API.IMAGES_PATH;
                },

                /**
                 * Load sizes
                 *
                 * @returns {*}
                 */
                loadSizes: function () {

                    return RestFactory.request(API.LOADSIZES);
                },

                /**
                 * Load types
                 *
                 * @returns {*}
                 */
                loadOrderTypes: function () {

                    return RestFactory.request(API.LOADORDERTYPES);
                },

                /**
                 *  Show Modal window
                 *
                 * @param path
                 * @param data
                 * @returns {*}
                 */
                showModal : function(path) {

                    var modal= $modal.open({
                        templateUrl : TEMPLATE[path],
                        controller : "ModalController"
                    });
                    return modal;
                },

                createCollection : function(factoryId){
                    var data={
                        factoryId:factoryId,
                        name:"collection"
                    };

                    return RestFactory.request(API.CREATECOLLECTION,"POST",data);
                },

                /**
                 *
                 * @param photo
                 * @returns {*}
                 */
                uploadFiles : function(photo) {

                    var fd=new FormData();

                    angular.forEach(photo,function(file){
                        fd.append('file[]',file);

                    });

                    return $http.post(API.LOADFILES,fd,
                        {
                            transformRequest: angular.identity,
                            headers: {'Content-Type': undefined}
                        });
                },

                /**
                 * Create order
                 */
                orderCreate: function (order) {

                    var params = {
                        'buyerId'       :   order.buyerId,
                        'factoryId'     :   order.collection.factoryId,
                        'type'          :   order.type.id,
                        'currencyId'    :   order.currencyId
                    };

                    RestFactory.request(API.ORDERCREATE,"POST", params).then(function(responseOrder) {

                            if(response.id) {
                                var params = {
                                    'id'        :   parseInt(order.collection.id),
                                    'orderId'   :   parseInt(responseOrder.id)
                                };

                                return RestFactory.request(API.ADDORDERTOCOLLECTION,"PUT", $.param(params));
                            }
                            else return false;
                    });
                },

                /**
                 * Create order
                 */
                productsCreate: function (data) {

                    var products = [];
                    //
                    //products.push({
                    //    id    :   1, // factory {product ID
                    //    productId    :   234, // backend product ID
                    //    orderId : 1,
                    //    sizeId  : 2,
                    //    count   : 3,
                    //    price   : 343,
                    //    articul : '23343',
                    //    factoryArticul: '2323'
                    //});
                    //products.push({
                    //    id    :   2, // factory product ID
                    //    productId    :   234, // backend product ID
                    //    orderId : 34,
                    //    sizeId  : 1,
                    //    count   : 34,
                    //    price   : 343,
                    //    articul : '23343',
                    //    factoryArticul: '2323'
                    //});
                    //
                    ////RestFactory.request(API.CREATEPRODUCTFACTORY,"POST",products);
                    //return false;
                    //var products = [];
                    // To Backend
                    //products.push({params : {
                    //    'vendor_articul'    : 1,
                    //    'cat_title'         : 'Product title',
                    //    'brand_id'          : 0,
                    //    'category'          : {
                    //        0 : 0
                    //    },
                    //    'weight'            : 0,
                    //    'cat_type'          : 0,
                    //    'price'             : 0
                    //}
                    //});
                    //
                    //console.log('Products', products);
                    //console.log('Products line', decodeURIComponent($.param(products)));

                    //angular.forEach(data, function(value, index) {
                    //
                    //    products.push({params : {
                    //            'vendor_articul'    : 1,
                    //            'cat_title'         : 'Product title',
                    //            'brand_id'          : 0,
                    //            'category'          : {
                    //                0 : 0
                    //            },
                    //            'weight'            : 0,
                    //            'cat_type'          : 0,
                    //            'price'             : 0
                    //        }
                    //    });
                    //});


                    //BACK END Product Create

                    products.push({params : {
                        'vendor_articul'    : 1,
                        'cat_title'         : 'Product title',
                        'brand_id'          : 0,
                        'category'          : {
                            0 : 0
                        },
                        'weight'            : 0,
                        'cat_type'          : 0,
                        'price'             : 0
                    }
                    });

                    //var params = {
                    //    'buyerId' :   data.buyerId,
                    //    'factoryId' :   data.collection.factoryId,
                    //    'type'  :    data.type.id,
                    //    'currencyId' :   data.currencyId
                    //};

                    return RestFactory.request(API.PRODUCTSCREATE, "POST", products);
                    return false;

                }
            };
        }]);
})();
