(function(){

    angular.module("services.bestsellers",[])

        // create config API ROUTES
        .constant('API', (function () {

            return {

            };
        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {

            };

        })())

        .factory("BestsellersService", ['API', 'TEMPLATE', 'RestFactory', '$modal',
            function(API, TEMPLATE, RestFactory, $modal) {

                return  {


                        };
            }]);
})();
