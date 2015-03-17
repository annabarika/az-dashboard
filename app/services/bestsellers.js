(function(){

    angular.module("services.bestsellers",[])

        // create config API ROUTES
        .constant('API', (function () {

            return {
                "LOAD"    :   config.API.host+'bestseller/calendar'
            };
        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {

            };

        })())

        .factory("BestsellersService", ['API', 'TEMPLATE', 'RestFactory',
            function(API, TEMPLATE, RestFactory) {

                return  {
                    /**
                     *
                     * @param params
                     * @returns {*}
                     */
                    getCalendarData : function(params) {

                        return RestFactory.request(API.LOAD);
                    }

                };
            }]);
})();
