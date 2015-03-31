(function () {

    angular.module("services.bestsellers", [])

        // create config API ROUTES
        .constant('API', {
            "LOAD_ORDERED"          : config.API.host + 'bestseller/calendar/status/1/orderDate/',
            "LOAD_ORDERED_DETAILS"  : config.API.host + 'bestseller/load-detailed/status/1/orderDate/',

            "LOAD_TOTAL"            : config.API.host + 'bestseller/calendar/status/0,1/createDate/',
            "LOAD_TOTAL_DETAILS"    : config.API.host + 'bestseller/load-detailed/status/0,1/createDate/',

            "FIND_BY_ARTICUL"       : config.API.host + 'product/search/query/',
            "ADD_TO_BESTSELLER"     : config.API.host + 'bestseller/create/',

            "GET_BESTSELLER_BY_ID"  : config.API.host + 'bestseller/get/id/',
            "GET_HISTORY"           : config.API.host + '/bestseller/load/status/1/productId/',

            "CREATE_ORDER"          : config.API.host + "order/create",
            "ADD_ORDER_PRODUCT_ROW" : config.API.host + "order/create-bestseller-row",

            "LOAD_PRODUCTS"         : config.API.host+"order/get-rows/id/"
        })

        .factory("BestsellersService", ['API', 'RestFactory',
            function (API, RestFactory) {

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
                 * @param int iso month iso code
                 * @access private
                 * @returns object
                 */
                var getMonthDayRange = function (year, iso) {

                    var range = {
                        start : moment().subtract(iso, 'months').startOf('month').format(year+'-'+iso+'-DD'),
                        end   : moment(new Date(year, iso, 0)).format('YYYY-MM-DD HH:mm:ss')
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
                     * Get calendar data by date range params
                     *
                     * @param string type ordered | total
                     * @returns {*}
                     */
                    getCalendarData: function (type, year) {

                        var range = [], url = (type == 'ordered') ? API.LOAD_ORDERED : API.LOAD_TOTAL;
                        if (_.isUndefined(year)) {

                            // format date range by default
                            range.push((new Date().getFullYear() + '-01-01').toString());
                            range.push(moment().format('YYYY-MM-DD HH:mm:ss'));
                        }
                        else {
                            // format date range by default
                            range.push(year + '-01-01');
                            range.push(moment().format(year+'-MM-DD HH:mm:ss'));
                        }

                        return RestFactory.request(url + range.join(','));
                    },

                    /**
                     * Get calendar items by clicking month date
                     *
                     * @param string type ordered | total
                     * @param int year
                     * @param int iso month iso
                     * @returns {*}
                     */
                    getMonthDetailed: function (type, year, iso) {

                        var range = getMonthDayRange(year, iso), url = (type == 'ordered') ? API.LOAD_ORDERED_DETAILS : API.LOAD_TOTAL_DETAILS;
                        return RestFactory.request(url + range.start+','+range.end);
                    },

                    /**
                     * Get calendar items by clicking month date
                     *
                     * @param string type ordered | total
                     * @param int year
                     * @param int iso month iso
                     * @returns {*}
                     */
                    getDayDetailed: function (type, date) {

                        var date = moment(date).format('YYYY-MM-DD'),
                            url = (type == 'ordered') ? API.LOAD_ORDERED_DETAILS : API.LOAD_TOTAL_DETAILS;

                        return RestFactory.request(url + date);
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
                    },

                    /**
                     * Get find articul uri
                     */
                    searchArticulUri: function() {
                        return API.FIND_BY_ARTICUL;
                    },

                    /**
                     * Add product to bestseller
                     *
                     * @param json product
                     * @param string date
                     * @returns {*}
                     */
                    addToBestseller: function(product, date) {

                        var params = {
                            "status": "0",
                            "productId": product.id,
                            "createDate": (!_.isUndefined(date)) ? date : moment().format('YYYY-MM-DD HH:mm:ss')
                        };

                        return RestFactory.request(API.ADD_TO_BESTSELLER, 'POST', params);
                    },

                    /**
                     * Get bestseller by id
                     *
                     * @param int id
                     * @returns {*}
                     */
                    getBestseller: function(id) {
                        return RestFactory.request(API.GET_BESTSELLER_BY_ID+parseInt(id));
                    },

                    /**
                     * Get bestseller history by productId
                     *
                     * @param int id
                     * @returns {*}
                     */
					getBestsellerHistory: function(productId) {
						return RestFactory.request(API.GET_HISTORY + parseInt(productId));
					},

                    createOrder: function(factoryId){
                        // Creating order
                        var order = {
                            factoryId: factoryId,
                            buyerId: 328,
                            type: 1
                        };

                        return RestFactory.request(API.CREATE_ORDER, 'POST', order);
                    },

                    prepareProducts: function(orderId, bestsellerId, product, sizes){
                        var products = [];
                        var size = '';
                        if( sizes.add ){
                            for( var i in sizes.add ){
                                size = sizes.add[i].size;
                                sizes[size] = { count : sizes.add[i].count };
                            }
                        }
                        for( var size in sizes){
                            if( size != 'add' ){
                                products.push({
                                    size: size,
                                    productId: product.id,
                                    count: sizes[size].count,
                                    price: product.price,
                                    factoryArticul: product.factoryArticul,
                                    bestsellerId: bestsellerId
                                });
                            }
                        }
                        return products;
                    },

                    addOrderProductRow: function(orderId, product){
                        product.orderId = orderId;
                        return RestFactory.request(API.ADD_ORDER_PRODUCT_ROW, 'POST', product);
                    },

                    getProducts: function(id){

                        return RestFactory.request(API.LOAD_PRODUCTS+id)
                    }


                }
            }]);
})();
