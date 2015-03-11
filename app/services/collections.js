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
                COLLECTION_CARD :   config.API.host+'catalogue-collection/load/id/'
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

                            $rootScope.collection = _.first(response);

                            console.log('Collection card', $rootScope.collection);
                            deferred.resolve(response);
                        }
                        else {
                            deferred.resolve(response);
                        }

                    }).error(function (error) {

                        deferred.reject(error);
                    });

                    return deferred.promise;
                }
            };
        }]);
})();
