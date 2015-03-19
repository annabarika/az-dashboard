(function () {

    angular.module("services.bestsellers", [])

        // create config API ROUTES
        .constant('API', {
            "LOAD": config.API.host + 'bestseller/calendar/createDate/'
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
                 * @param year
                 * @returns {{}}
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
                     * Get month first and last days
                     *
                     * @returns {*}
                     */
                    getMonthDayRange: function (year, iso) {

                        var range = {
                            start : moment().subtract(iso, 'months').startOf('month').format(year+'-'+iso+'-DD'),
                            end   : year+'-'+iso+'-'+new Date(year, iso, 0).getDate()
                        }

                        return range;
                    },

                    /**
                     * Get calendar data by date range params
                     *
                     * @param dateRange
                     * @returns {*}
                     */
                    getCalendarData: function (dateRange) {

                        var range = [];

                        if (_.isUndefined(dateRange)) {
                            // format date range by default
                            range.push((new Date().getFullYear() + '-01-01').toString())
                            range.push(moment().format('YYYY-MM-DD'));
                        }
                        else {


                            console.log('Selected date range');
                        }
                        return RestFactory.request(API.LOAD + range.join(','));
                    },

                    /**
                     * Resolve calendar data
                     *
                     * @param dateRange
                     * @returns {*}
                     */
                    resolveCalendarData: function (responseDateRange, months) {

                        var result = [], year, month, cnt = [], merged;
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
