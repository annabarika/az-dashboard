(function () {

    angular.module("services.bestsellers", [])

        // create config API ROUTES
        .constant('API', {
            "LOAD_ORDERER": config.API.host + 'bestseller/calendar/status/1/orderDate/',
            "LOAD_ORDERED_DETAILS" : config.API.host + 'bestseller/load-detailed/status/1/orderDate/'
        })

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {};

        })())

        .factory("BestsellersService", ['API', 'TEMPLATE', 'RestFactory',
            function (API, TEMPLATE, RestFactory) {

                /**
                 * Create calendar
                 *
                 * @access private
                 * @param year
                 * @return array
                 */
                var generateMonths = function (year) {

                    var calendar = {}, months = {
                        '01': 0,
                        '02': 0,
                        '03': 0,
                        '04': 0,
                        '05': 0,
                        '06': 0,
                        '07': 0,
                        '08': 0,
                        '09': 0,
                        '10': 0,
                        '11': 0,
                        '12': 0
                    }
                    calendar[year] = months;

                    return calendar;
                };

                /**
                 * Get month first and last days
                 *
                 * @param int year
                 * @param int iso month iso
                 * @access private
                 * @returns object
                 */
                var getMonthDayRange = function (year, iso) {

                    var range = {
                        start : moment().subtract(iso, 'months').startOf('month').format(year+'-'+iso+'-DD'),
                        end   : year+'-'+iso+'-'+new Date(year, iso, 0).getDate()
                    }

                    return range;
                };

                return {

                    /**
                     * Get months
                     *
                     * @returns {*}
                     */
                    getMonths: function (iso) {

                        return (!iso) ? config.months : config.months[iso];
                    },

                    /**
                     * Get calendar ordered data by date range params
                     *
                     * @param dateRange
                     * @returns {*}
                     */
                    getCalendarOrderedData: function (dateRange) {

                        var range = [];
                        if (_.isUndefined(dateRange)) {

                            // format date range by default
                            range.push((new Date().getFullYear() + '-01-01').toString());
                            range.push(moment().format('YYYY-MM-DD'));
                        }
                        else {
                            console.log('Selected date range');
                        }

                        return RestFactory.request(API.LOAD_ORDERER + range.join(','));
                    },

                    /**
                     * Get calendar ordered items by date range params
                     *
                     * @param int year
                     * @param int iso month iso
                     * @returns {*}
                     */
                    getOrderedDetailed: function (year, iso) {

                        var range = getMonthDayRange(year, iso);
                        return RestFactory.request(API.LOAD_ORDERED_DETAILS + range.start+','+range.end);
                    },

                    /**
                     * Resolve calendar data
                     *
                     * @param object responseDateRange
                     * @returns {*}
                     */
                    resolveCalendarData: function (responseDateRange) {

                        var result = [], year, month, cnt = [];
                        if (!_.isUndefined(responseDateRange)) {


                            angular.forEach(responseDateRange, function (value) {

                                result = generateMonths(moment(_.keys(value).toString()).year());
                                year = moment(_.keys(value).toString()).year();
                                month = moment(_.keys(value).toString()).format("MM");

                                angular.forEach(result, function() {

                                    result[year] = (function(){

                                        angular.forEach(value, function(count, date) {
                                            if(moment(date).format("MM") === month) {
                                                if(!cnt[month]) cnt[month] = 0;
                                                cnt[month] += parseInt(count);
                                            }
                                        });
                                        return cnt;
                                    })();
                                });
                            });

                            angular.forEach(result, function(months, year) {
                                result[year] = _.assign(generateMonths(year)[year], result[year]);
                            });
                        }
                        return result;
                    }
                }
            }]);
})();
