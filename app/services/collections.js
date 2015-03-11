(function(){

    angular.module("services.collections",[])

        // create config API ROUTES
        .constant('API', (function () {

            return {
                LOGOUT :    config.API.host+'/routeto back'
            };

        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {
                NEW    :    '/template/path'
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
                }
            };
        }]);
})();
