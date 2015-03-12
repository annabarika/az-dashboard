(function(){

    angular.module("services.collections", [])

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
                LOADSIZES       :   config.API.host+'size/load',
                LOADPRODUCTS    :   config.API.host+'catalogue-collection/add-collection-product'
            };
        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {
                NEW    :   "/modules/buyer/views/collection/choose_factory.html",
                CHOOSE :   "/modules/buyer/views/collection/choose_collection.html",
                ADDSIZE:   "/modules/buyer/views/collection/add_size.html"
            };

        })())

        .factory("CollectionService", ['API', 'TEMPLATE', 'RestFactory', 'messageCenterService', '$modal',"$http",
            function(API, TEMPLATE, RestFactory, messageCenterService, $modal,$http) {

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

                            collections.push(value);
                        });
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
                            currencyId:5,
                            factoryId:parseInt(collection.factoryId),
                            name:"noname"
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
                   // return RestFactory.request(API.LOADPRODUCTS,"POST", query);
                    return RestFactory.request(API.LOADPRODUCTS,"POST", products);
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
                                res.push(product);
                            });
                        });
                    }
                    return res;
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
                 *  Show Modal window
                 *
                 * @param path
                 * @param data
                 * @returns {*}
                 */
                showModal : function(path,data){
                    // console.log("data",data);
                    var modal=$modal.open({
                        templateUrl:TEMPLATE[path],
                        controller:"ModalController"
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
                 * Delete collection
                 */
                deleteCollection: function (collectionId) {},

                /**
                 * Delete product
                 */
                deleteProduct: function (productId) {},

                /**
                 * Checkout collection position
                 */
                checkoutPosition: function (productId) {},

                /**
                 * Checkout collection
                 */
                checkoutCollection: function (collectionId) {}


            };
        }]);
})();
