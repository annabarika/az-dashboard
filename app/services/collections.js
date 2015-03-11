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
                IMAGES_PATH     :   config.API.imagehost+'/files/factory/attachments/'
            };

        })())

        .factory("CollectionService", ['API', '$q', '$http', 'messageCenterService', '$modal', '$rootScope',
            function(API, $q, $http, messageCenterService, $modal, $rootScope) {

            return {

                /**
                 * Get Scope of Collections
                 *
                 * @returns {T.promise|*|d.promise|promise|m.ready.promise|fd.g.promise}
                 */
                getFactories: function () {

                    var deferred = $q.defer();

                    $http.get(API.FACTORIES).success(function (response) {

                        if (response) {

                            var factories = [];
                            angular.forEach(response, function(value) {
                                factories.push(value.factory);
                            });

                            $rootScope.factories = factories;

                            deferred.resolve(response);
                        }
                        else {
                            deferred.resolve(response);
                        }

                    }).error(function (error) {

                        deferred.reject(error);
                    });

                    return deferred.promise;
                },

                /**
                 * Get Scope of Factories
                 *
                 * @param params
                 * @returns {T.promise|*|d.promise|promise|m.ready.promise|fd.g.promise}
                 */
                getCollections: function (params) {

                    var deferred = $q.defer(), url = (_.isUndefined(params) == false) ? API.COLLECTIONS+params : API.COLLECTIONS;

                    $http.get(url).success(function (response) {

                        if (response) {
                                var collections = [];

                                angular.forEach(response, function(value) {

                                angular.forEach($rootScope.factories, function(factory) {

                                    if(factory.id == value.factoryId) {
                                        value.factoryName = factory.name;
                                    }

                                    collections.push(value);
                                });
                            });

                            $rootScope.collections = collections;

                            deferred.resolve(response);
                        }
                        else {
                            deferred.resolve(response);
                        }

                    }).error(function (error) {

                        deferred.reject(error);
                    });

                    return deferred.promise;
                },

                /**
                 * Get Card of selected collection
                 *
                 * @returns {T.promise|*|d.promise|promise|m.ready.promise|fd.g.promise}
                 */
                getCollectionCard: function (id) {

                    var deferred = $q.defer();

                    $http.get(API.COLLECTION_CARD+id).success(function (response) {

                        if (response) {

                            deferred.resolve(response);
                        }
                        else {
                            deferred.resolve(response);
                        }
                    }).error(function (error) {

                        deferred.reject(error);
                    });

                    return deferred.promise;
                },

                /**
                 * Extract server response data requested by collectionId
                 * @param data
                 * @returns {Array}
                 */
                extractProducts: function(data) {

                    for (var first in data) break;
                    var first = data[first], res = [];

                    if(_.isEmpty(first) === false) {

                        angular.forEach(first, function(collections) {
                            for (var key in collections) break;
                            res.push(collections[key]);
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
