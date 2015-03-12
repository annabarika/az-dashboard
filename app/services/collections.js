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
                LOADSIZES       :   config.API.host+'size/load'
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

        .factory("CollectionService", ['API', 'TEMPLATE', 'RestFactory', 'messageCenterService', '$modal',
            function(API, TEMPLATE, RestFactory, messageCenterService, $modal) {

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
                        name:"test"
                    };

                    RestFactory.request(API.CREATECOLLECTION,"POST",data).then(function(response){

                            //$rootScope.factoryCollections=response;
                            console.log(response);
                            if(response){
                                $rootScope.collection=response;
                            }

                        }
                    );
                },
                





                uploadFiles : function() {
                    //console.log("uploads",$rootScope.photo);

                    var fd=new FormData();
                    console.log($rootScope.photo);
                    angular.forEach($rootScope.photo,function(file){
                        fd.append('file[]',file);
                        console.log('file',file);
                    });
                    console.log(fd);
                    /*RestFactory.request(API.LOADFILES,"POST",fd).then(
                     function(response){
                     console.log(response);
                     }
                     );*/
                    $http.post(API.LOADFILES,fd,
                        {
                            transformRequest: angular.identity,
                            headers: {'Content-Type': undefined}
                        })
                        .success(function(data){
                            console.log(data);
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
