(function(){

    angular.module("services.bestsellers",[])

        // create config API ROUTES
        .constant('API', (function () {

            return {
                "LOAD"    :   config.API.host+'bestseller/calendar/createDate/'
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
                     * Get months
                     *
                     * @returns {*}
                     */
                    getMonths : function() {
                        return config.months;
                    },

                    /**
                     * Get calendar data by date range params
                     *
                     * @param dateRange
                     * @returns {*}
                     */
                    getCalendarData : function(dateRange) {

                        var range = [];

                        if(_.isUndefined(dateRange)) {
                            // format date range by default
                            range.push((new Date().getFullYear()+ '-01-01').toString())
                            range.push(moment().format('YYYY-MM-DD'));
                        }
                        else {


                            console.log('Selected date range');
                        }
                        return RestFactory.request(API.LOAD+range.join(','));
                    },

                    /**
                     * Resolve calendar data
                     *
                     * @param dateRange
                     * @returns {*}
                     */
                    resolveCalendarData : function(responseDateRange) {

                        var result = [];

                        if(!_.isUndefined(responseDateRange)) {

                            angular.forEach(responseDateRange, function(value) {

                                var  event = {}, iterator = 0;
                                event.title = _.values(value).toString();
                                event.items = _.values(value).toString();
                                event.starts_at = event.ends_at = moment(_.keys(value).toString()).format('YYYY-MM-DD');
                                result.push(event);
                            });
                        }
                        return result;
                    },

                    calcOrdersByEvents : function(events) {
                        console.log(events);
                    }

                };
            }]);
})();
