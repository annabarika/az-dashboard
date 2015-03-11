(function(){

    angular.module("services.collections",[])

        // create config API ROUTES
        .constant('API', (function () {

            return {
                GETFACTORY      :   config.API.host+'factory/load',
                GETCOLLECTIONS  :   config.API.host+'catalogue/load-collections'
            };

        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {
                COLLECTIONSLIST    :    '/template/path'
            };

        })())

        .factory("CollectionService", ['API', 'TEMPLATE', 'RestFactory', 'messageCenterService', '$modal',
            function(API, TEMPLATE, RestFactory, messageCenterService, $modal) {

            return {

                debug : function() {
                    console.log('Check incapsulated services');
                    console.log(API);
                    console.log(TEMPLATE);
                    console.log(RestFactory);
                    console.log(messageCenterService);
                    console.log($modal);
                },

                /**
                 * Collections filter params
                 *
                 * @param params
                 * @returns {Array}
                 */
                filter: function(params) {

                    var params = [];
                    return params;
                },

                /**
                 * Get collection with filters
                 *
                 * @param params
                 * @returns {Array}
                 */
                getCollections: function(params) {

                    var collections = [];
                    RestFactory.request(API.GETCOLLECTIONS, 'GET', params).then(function(response) {

                        var collections = response;

                    });

                    return collections;
                }
            };
        }]);
})();
