(function(){

    var app=angular.module("services.collections",[]);


    app.constant("PATH",{
        FACTORIES           :   config.API.host+'factory/load',
        COLLECTIONS         :   config.API.host+'catalogue-collection/load/status/0,1',
        COLLECTION_CARD     :   config.API.host+'catalogue-collection/get-collection-products/collectionId/',
        IMAGES_PATH         :   config.API.imagehost+'/files/factory/attachments/',
        FACTORYCOLLECTIONS  :   config.API.host+"catalogue-collection/load/status/0/factoryId/",
        CREATECOLLECTION    :   config.API.host+"catalogue-collection/create",
        LOADFILES           :   config.API.host+'catalogue/loadfiles',
        LOADPRODUCTS        :   config.API.host+'catalogue-collection/add-collection-product',
        CANCELPRODUCT       :   config.API.host+'catalogue-collection/delete-collection-product/',
        CANCELCOLLECTION    :   config.API.host+'catalogue-collection/cancel/',
        LOADSIZES           :   config.API.host+'size/load',
        LOADORDERTYPES      :   config.API.host+'order-type/load/',
        ORDERCREATE         :   config.API.host+'order/create',
        PRODUCTSCREATE      :   config.API.host+'jsoncreate.php',
        PRODUCTUPDATE       :   config.API.host+'catalogue/update',
        ADDORDERTOCOLLECTION  :     config.API.host+'catalogue-collection/add-order-collection',
        CREATEPRODUCTFACTORY  :     config.API.host+'order/create-factory-row',
        LOADSTATUSES          :     config.API.host+'status/load/type/factoryCatalogue',
        LOADONECOLLECTION     :    config.API.host+"catalogue-collection/load/id/"
    });

        app.factory("CollectionService", ["PATH", 'RestFactory', '$modal', "$http",
            function(PATH, RestFactory, $modal, $http) {

            return {

                /**
                 * Get All factories
                 *
                 * @returns {*}
                 */
                getFactories: function () {
                    return RestFactory.request(PATH.FACTORIES);
                },

                /**
                 * Get collection statuses
                 *
                 * @returns {*}
                 */
                getCollectionStatuses: function () {

                    return RestFactory.request(PATH.LOADSTATUSES);
                },

                /**
                 * Get All Collections
                 *
                 * @param params
                 * @returns {*}
                 */
                getCollections: function (params) {

                    //var url = (_.isUndefined(params) == false) ? PATH.COLLECTIONS+params : PATH.COLLECTIONS;

                    return RestFactory.request(params);
                },

                getCurrentCollection:function(id){
                    var url= PATH.LOADONECOLLECTION + id;
                    return RestFactory.request(url);
                },

                /**
                 *  Return filtered collections
                 *
                 * @param factories
                 * @returns {Array}
                 */
                filterCollections : function(response, factories, statuses) {

                    var collections = [];

                    angular.forEach(response, function(value) {

                        angular.forEach(factories, function(factory) {

                            if(factory.id == value.factoryId) {
                                value.factoryName = factory.name;
                            }
                        });

                        angular.forEach(statuses, function(status) {

                            if(status.id == value.status) {
                                value.statusName = status.name;
                            }
                        });
                        collections.push(value);
                    });

                    // using an iteratee function to sort collection by dateCreate
                    var sorted = _.sortBy(collections, 'createDate').reverse();

                    return sorted;
                },

                /**
                 * /**
                 * Get collections by factory
                 *
                 * @param id
                 * @returns {*}
                 */
                getFactoryCollections : function(id){

                    var url = PATH.FACTORYCOLLECTIONS+id;

                    return RestFactory.request(url);
                },

                /**
                 * Get Card of selected collection
                 *
                 * @returns {*}
                 */
                getCollectionCard: function (id) {

                    var url = PATH.COLLECTION_CARD+id;
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
                /**
                 *
                 * @param data
                 * @param collection
                 * @param sizes
                 * @returns {Array}
                 */
                buildProductsArray:function(data,collection,sizes){
                    //console.log(data,collection);
                    var array=[];

                    angular.forEach(data,function(value,i){

                        sizes=value.sizes.split(/[\s,]+/);
                        var photos=[];
                        angular.forEach(value.photos,function(img){
                            this.push(img.id);
                        },photos);
                        //console.log(sizes);
                        var product={
                            articul:value.article,
                            price:value.price,
                            collectionId:collection.id,
                            photos:photos,
                            sizes:sizes,
                            currencyId:5,
                            factoryId:parseInt(collection.factoryId),
                            name:"noname"
                        };

                        this.push(product);

                    },array);

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

                    return RestFactory.request(PATH.LOADPRODUCTS,"POST", products);
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
                                product.inOrder=false;
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

                    return RestFactory.request(PATH.CANCELCOLLECTION, 'PUT', $.param({'id' : collectionId}));
                },

                /**
                 * Delete product
                 */
                deleteProduct: function (collectionId, productId) {

                    var url = PATH.CANCELPRODUCT+'collectionId/'+collectionId+'/productId/'+productId;

                    return RestFactory.request(url, 'DELETE');
                },

                /**
                 * Save product
                 */
                saveProduct: function (product) {

                    var params = {
                        'id' : product.catalogueProduct.id,
                        'articul' : product.catalogueProduct.articul,
                        'name'    : product.catalogueProduct.name,
                        'price'   : product.catalogueProduct.price,
                        'currencyId' : product.currency.id,
                        'sizes'     :   (function() {
                                var sizes = [];
                                angular.forEach(product.sizes, function(value, index){
                                    sizes.push({
                                        id : value.id,
                                        name : value.name
                                    })
                                });

                            return sizes;
                        })(product)
                    };

                    return RestFactory.request(PATH.PRODUCTUPDATE, 'PUT', params);
                },

                /**
                 * Get image path
                 *
                 * @returns {*}
                 */
                getImagePath: function() {

                    return PATH.IMAGES_PATH;
                },

                /**
                 * Load sizes
                 *
                 * @returns {*}
                 */
                loadSizes: function () {

                    return RestFactory.request(PATH.LOADSIZES);
                },

                /**
                 * Load types
                 *
                 * @returns {*}
                 */
                loadOrderTypes: function () {

                    return RestFactory.request(PATH.LOADORDERTYPES);
                },

                /**
                 *  Show Modal window
                 *
                 * @param path
                 * @param data
                 * @returns {*}
                 */
                showModal : function(path,size) {

                    var TEMPLATE={
                        NEW    :   "/modules/buyer/views/collection/choose_factory.html",
                        CHOOSE :   "/modules/buyer/views/collection/choose_collection.html",
                        ADDSIZE:   "/modules/buyer/views/collection/add_size.html",
                        ADDORDER:   "/modules/buyer/views/collection/add_order.html",
                        CANCEL_COLLECTION :   "/modules/buyer/views/collection/ask_collection.html",
                        CANCEL_PRODUCT :   "/modules/buyer/views/collection/ask_product.html"
                    };

                    var s;
                    _.isUndefined(size) ? s="sm":s=size ;

                    var modal= $modal.open({
                        templateUrl : TEMPLATE[path],
                        controller : "ModalController",
                        size:s
                    });
                    return modal;
                },
                /**
                 *
                 * @param factoryId
                 * @returns {*}
                 */
                createCollection : function(factoryId){
                    var data={
                        factoryId:factoryId,
                        name:"collection"
                    };

                    return RestFactory.request(PATH.CREATECOLLECTION,"POST",data);
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

                    return $http.post(PATH.LOADFILES,fd,
                        {
                            transformRequest: angular.identity,
                            headers: {'Content-Type': undefined}
                        });
                },

                /**
                 * Create order
                 */
                orderCreate: function (order) {
                    console.log(order);
                    var params = {
                        'buyerId'       :   order.buyerId,
                        'factoryId'     :   order.collection.factoryId,
                        'type'          :   order.type.id,
                        'currencyId'    :   order.currencyId
                    };

                    return RestFactory.request(PATH.ORDERCREATE,"POST", params).then(function(response) {

                        console.log(response);
                            if(response.id) {
                                var params = {
                                    'id'        :   parseInt(order.collection.id),
                                    'orderId'   :   parseInt(response.id)
                                };

                                return RestFactory.request(PATH.ADDORDERTOCOLLECTION,"PUT", $.param(params));
                            }
                            else return false;
                    });
                },

                /**
                 * Create order
                 *
                 * @param data
                 * @returns {*}
                 */
                productsCreate: function (data) {
                    console.log(data);
                    // Query String to backend create product
                    //+'?params[params][vendor_id]='+1+'
                    // &params[params][vendor_articul]='+obj.factory_articul+'
                    // &params[params][cat_title]=Test
                    // &params[params][brand_id]='+1+'
                    // &params[params][category]='+1+'
                    // &params[params][weight]='+0+'
                    // &params[params][price]='+obj.price+'
                    // &params[params][status]=1
                    //RestFactory.request(PATH.PRODUCTSCREATE+'?'+Object.toQueryString(products), "GET");

                    return RestFactory.request('/testing/mocks/products.json', "POST").then(function(backend) {

                        if (backend.result) {
                            var response = JSON.parse(backend.result);

                            if (response.hasOwnProperty('products')) {


                                var products = [];

                                //if (data.items.length == Object.keys(response.products).length) {

                                    // Compared front <-> backend created products

                                    angular.forEach(data.items, function (frontendProduct) {

                                        angular.forEach(frontendProduct.sizes, function (size) {
                                            var tmp = {};
                                            tmp.id = frontendProduct.catalogueProduct.id,
                                            tmp.articul =   (function() {
                                                return _.pluck(_.filter(response.products, function(backProduct) {

                                                    // compare products
                                                    if(backProduct.factoryArticul == frontendProduct.catalogueProduct.articul) {
                                                        return backProduct.articul;
                                                    }
                                                }), 'articul').toString();
                                            })(frontendProduct.catalogueProduct);

                                            tmp.productId = (function() {
                                                return _.pluck(_.filter(response.products, function(backProduct) {

                                                    // compare products
                                                    if(backProduct.factoryArticul == frontendProduct.catalogueProduct.articul) {
                                                        return backProduct.id;
                                                    }
                                                }), 'id').toString();

                                            })(frontendProduct.catalogueProduct);

                                            tmp.sizeId  =   size.id;
                                            tmp.count   =   size.count;
                                            tmp.price   =   frontendProduct.catalogueProduct.price;
                                            tmp.orderId =   data.collection.orderId;
                                            tmp.factoryArticul =   frontendProduct.catalogueProduct.articul;

                                            products.push(tmp);
                                        });
                                    });

                                    return RestFactory.request(PATH.CREATEPRODUCTFACTORY,"POST", products);
                                //}
                            }
                        }
                    });
                }
            };
        }]);
})();
