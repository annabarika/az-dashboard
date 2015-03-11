(function(){

    angular.module("services.collections",['LocalStorageModule'])

        .config(['localStorageServiceProvider', function(localStorageServiceProvider){
            localStorageServiceProvider.setPrefix('collections');
            localStorageServiceProvider.setStorageType('localStorage');
        }])

        // create config API ROUTES
        .constant('API', (function () {

            return {
                GETFACTORIES    :   config.API.host+'factory/load',
                GETCOLLECTIONS  :   config.API.host+'catalogue-collection/load/status/0'
            };

        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {
                COLLECTIONSLIST    :    '/template/path'
            };

        })())

        .factory("CollectionService", ['API', 'TEMPLATE', '$q', '$http', 'messageCenterService', '$modal', '$rootScope', 'localStorageService',
            function(API, TEMPLATE, $q, $http, messageCenterService, $modal, $rootScope, localStorageService) {

            return {

                /**
                 * Get Scope of Factories
                 *
                 * @returns {T.promise|*|d.promise|promise|m.ready.promise|fd.g.promise}
                 */
                getFactories: function () {

                    var deferred = $q.defer();

                    $http.get(API.GETFACTORIES).success(function (response) {

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
                 * @returns {T.promise|*|d.promise|promise|m.ready.promise|fd.g.promise}
                 */
                getCollections: function (params) {

                    var deferred = $q.defer(), url = (_.isUndefined(params) == false) ? API.GETCOLLECTIONS+params : API.GETCOLLECTIONS;;

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
                }
            };
        }]);
})();
