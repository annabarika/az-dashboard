(function () {

    angular.module("services.bestsellers", [])

        // create config API ROUTES
        .constant('API', {
            "LOAD_ORDERED"          : config.API.host + 'bestseller/calendar/status/1,3/orderDate/',
            "LOAD_ORDERED_DETAILS"  : config.API.host + 'bestseller/load-detailed/status/1,3/orderDate/',

            "LOAD_TOTAL"            : config.API.host + 'bestseller/calendar/status/0,1,3/createDate/',
            "LOAD_TOTAL_DETAILS"    : config.API.host + 'bestseller/load-detailed/status/0,1,3/createDate/',

            "FIND_BY_ARTICUL"       : config.API.host + 'product/search/query/',
            "ADD_TO_BESTSELLER"     : config.API.host + 'bestseller/create/',

            "GET_BESTSELLER_BY_ID"  : config.API.host + 'bestseller/get/id/',
            "GET_HISTORY"           : config.API.host + '/bestseller/load/status/1/productId/',

            "CREATE_ORDER"          : config.API.host + "order/create",
            "ADD_ORDER_PRODUCT_ROW" : config.API.host + "order/create-bestseller-row",

            "LOAD_PRODUCTS"         : config.API.host + "order/get-rows/id/",
            "UPDATE"                : config.API.host + "bestseller/update",
            "CREATE_PDF"            : config.API.host + "order/send-to-factory/id/",
            "ORDER_PDF_REPORT"      : config.API.host + "order/report/id/",
            "SEND_ORDER_NOTIFICATION" : config.API.host+"order/send-notification/id/",
            "SEND_MODERATE"         : config.API.host+"report/send",
            "LOAD_MODERATORS"       : "/testing/mocks/moderators.json"
        })
        .constant('SIZE_CALCULATE', {
            "MIN_COUNT_TO_ADD_SIZES"    : 50,
            "MAX_ITERATIONS"            : 20,
            "ADDITIONAL_SIZES"          : { 'XS': 'S', 'S': 'XS', 'M': 'S', 'L': 'M', 'XL': 'L', 'XXL': 'XL', 'XXXL':'XXL' },
            "SIZE_SORT"                 : ['XS','S','M','L','XL','XXL', 'XXXL', 'XXXXL']
        })
        .factory("BestsellersService", ['API', 'RestFactory', 'SIZE_CALCULATE',
            function (API, RestFactory, SIZE_CALCULATE) {

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
                    };

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
                            range.push(moment().format(year+'-12-31 HH:mm:ss'));
                        }

                        return RestFactory.request(url + range.join(','));
                    },


                    /**
                     * Calculating count for ordering from bestsellers
                     *
                     * @param num
                     * @param sizes
                     * @returns {*}
                     */
                    calculate : function(num, sizes) {

                        var totalSaleSpeed = 0,
                            minSaleSpeed = 0;
                        /*
                            Getting size with minimum sale speed
                            for filling sizes with sale speed = 0
                         */
                        var itemWithMinSalesSpeed = _.min(sizes, function(size) {
                            return size.saleSpeed;
                        });
                        minSaleSpeed = itemWithMinSalesSpeed.saleSpeed;

                        /*
                            Calculating total salespeed
                            Fixing min sale speed for size with 0
                         */
                        sizes.forEach(function(size) {
                            if(!_.isUndefined(size.saleSpeed)) {
                                if(size.saleSpeed == 0 ){
                                    size.saleSpeed = (minSaleSpeed > 0) ? minSaleSpeed : 1;
                                }
                                totalSaleSpeed += parseInt(size.saleSpeed);
                                size.count = 0;
                            }
                        });
                       // console.log("After cleaning", sizes);
                        if( num > SIZE_CALCULATE.MIN_COUNT_TO_ADD_SIZES ){

                            for( addSize in SIZE_CALCULATE.ADDITIONAL_SIZES ){
                                if(! _.findWhere(sizes, { size: addSize} )){
                                    sizes.push({
                                        size: addSize,
                                        count: 0,
                                        saleSpeed: minSaleSpeed
                                    });
                                }
                            }
                        }
                        this.distributeBySize(sizes, num, totalSaleSpeed);
                        this.calculatorIterations = 0;
                        return this.sortSizes( sizes );
                    },

                    sortSizes : function(sizes){
                        function Comparator(a, b){
                            if(a.size == undefined){
                                return 2;
                            }
                            var tmp = SIZE_CALCULATE.SIZE_SORT;
                            return _.indexOf(tmp, a.size) < _.indexOf(tmp, b.size) ? -1 : 1;
                        }

                        var newSizes = [];
                        sizes = sizes.sort(Comparator);
                        sizes.forEach(function(size, index, object) {
                           // console.log("Sort:", size, index, object);
                            if ( size.saleSpeed != undefined ) {
                                newSizes.push(size);
                            }
                        });
                        newSizes.unshift({});
                        newSizes.push({});
                        return newSizes;
                    },

                    calculatorIterations : 0,

                    distributeBySize : function(sizes, num, totalSaleSpeed){
                        this.calculatorIterations ++;
                        var totalDelta = 0;
                        var keepGoing = true;
                        var delta = 0;
                       // console.log("Distrib start:", sizes);
                        sizes.forEach(function(size) {
                            if(!_.isUndefined(size.saleSpeed) && keepGoing ) {
                                delta = Math.ceil( num * size.saleSpeed / totalSaleSpeed );
                                //console.log("Delta ", size.size, delta);
                                totalDelta += delta;
                                //console.log("TD: ", totalDelta);
                                if( totalDelta > num ) {
                                    keepGoing = false;
                                    delta = delta - ( totalDelta - num) ;
                                }
                               // console.log("Delta2: ", size.size, delta);
                                size.count += delta;
                            }
                        });
                        if(this.calculatorIterations < SIZE_CALCULATE.MAX_ITERATIONS ) {
                            this.checkNormalization(sizes, totalSaleSpeed);
                        }
                        //console.log("Distrib finish:", sizes);
                        return sizes;
                    },

                    checkNormalization : function(sizes, totalSaleSpeed){
                        var count = 0;
                        var keepGoing = true;
                        var slice = 0;
                       // console.log("Norm start:", sizes);
                        /*
                            Checking max count
                         */
                        sizes = _.sortBy(sizes, 'count');

                        var prevSize = { count: 1000 };
                        sizes.forEach(function(size) {
                            if(!_.isUndefined(size.saleSpeed) && keepGoing ) {
                                count = size.count;
                                if( count > (prevSize.count * 2) ){
                                   // console.log("Coun > prevCount", count, prevSize.count);
                                    // Cutting off 50%
                                    slice = Math.round( count / 2);
                                    size.count -= slice;
                                    keepGoing = false;

                                }
                                prevSize = size;
                            }
                        });
                        //console.log("Norm end:", sizes);
                        if(slice > 0) {
                           // console.log("Slice: ", slice);
                            this.distributeBySize(sizes, slice, totalSaleSpeed);
                        }
                        return sizes;
                    },
                    /**
                     * Send order created
                     *
                     * @param id
                     * @returns {*}
                     */
                    sendCreatedOrder : function(id){

                        var url = API.SEND_ORDER_NOTIFICATION+id;

                        return RestFactory.request(url);
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
                        console.log(url+date);
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
                     * Get Order report
                     *
                     * @param int orderId
                     * @returns {*}
                     */
                    getOrderReport: function(orderId) {
                        return RestFactory.request(API.ORDER_PDF_REPORT+parseInt(orderId));
                    },

                    /**
                     * Add product to bestseller (create)
                     *
                     * @param json product
                     * @param string date
                     * @returns {*}
                     */
                    createBestseller: function(product, date) {

                        var params = {
                            "status": 0,
                            "productId": product.id,
                            "createDate": (!_.isUndefined(date)) ? date : moment().format('YYYY-MM-DD HH:mm:ss')
                        };
                        if(product.orderDate != undefined ){
                            params.orderDate = product.orderDate;
                            params.status = 1;
                        }

                        return RestFactory.request(API.ADD_TO_BESTSELLER, 'POST', params);
                    },

                    /**
                     * Send report
                     *
                     * @param array data
                     * @returns {*}
                     */
                    sendReport: function(data) {
                        var emails = data.to.match(/([a-zA-Z0-9._-]+@[a-zA-Z0-9._-]+\.[a-zA-Z0-9._-]+)/gi);

                        data.to = emails;

                        return RestFactory.request(API.SEND_MODERATE, 'POST', data);
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

                   // createOrder: function(factoryId){
                    createOrder: function(factory,user){
                        // Creating order
                        // First delivery date
                        var deliveryDate = new Date();
                        var DD = deliveryDate.getDate()+3;
                        var MM = deliveryDate.getMonth()+1; //January is 0!
                        var YYYY = deliveryDate.getFullYear();
                        if(DD<10) { DD='0'+DD }
                        if(MM<10) { MM='0'+MM }
                        deliveryDate = YYYY + '-' + MM + '-'+ DD;

                        var order = {
                            factoryId   :   factory.id,
                            buyerId     :   user.id,
                            type        :   2,
                            currencyId  :   factory.currencyId,
                           // deliveryDate:   deliveryDate,
                            status      :   0
                        };

                        return RestFactory.request(API.CREATE_ORDER, 'POST', order);
                    },

                    prepareProducts: function(bestsellerId, product, sizes){
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
                    /**
                     *
                     * @param orderId
                     * @param product
                     * @returns {*}
                     */
                    addOrderProductRow: function(orderId, product){
                        product.orderId = orderId;
                        return RestFactory.request(API.ADD_ORDER_PRODUCT_ROW, 'POST', product);
                    },

                    /**
                     * Get order products
                     *
                     * @param id
                     * @returns {*}
                     */
                    getProducts: function(id){
                        return RestFactory.request(API.LOAD_PRODUCTS+id)
                    },

                    /**
                     * Get all moderators
                     *
                     * @returns {*}
                     */
                    getModerators: function(){
                        return RestFactory.request(API.LOAD_MODERATORS)
                    },

                    /**
                     *
                     * @param sizes
                     * @returns {Array}
                     */
                    sizeCheck:function(sizes){
                        //console.log(sizes);
                        var array=[],
                            length=sizes.length;

                        for(var i=0;i<length;i++){

                            if(_.has(sizes[i],"count") && _.has(sizes[i],"size")){

                                if(sizes[i].count!="" && sizes[i].count!=0 && sizes[i].size!="" && !_.isNaN(sizes[i].count)){
                                    array.push(sizes[i]);
                                }

                            }
                        }

                        return array;
                    },
                    /**
                     *
                     * @param data
                     * @returns {*}
                     */
                    update:function(data){

                        return RestFactory.request(API.UPDATE,"PUT",data);
                    },

                    createPdf:function(id){

                        return RestFactory.request(API.CREATE_PDF+id);
                    },
                    /**
                     * Get find articul uri
                     */
                    searchArticulUri: function() {
                        return API.FIND_BY_ARTICUL;
                    },

                    /**
                     * Find products by articul
                     *
                     * @param string article
                     */
                    findProductsByArticle: function(articul) {

                        return RestFactory.request(API.FIND_BY_ARTICUL+articul);

                    }
                }
            }]);
})();
