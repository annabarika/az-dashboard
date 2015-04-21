(function() {

    var app = angular.module("services.payments", []);

    app.constant("PATH", {
        LOAD_PAYMENT: config.API.host + "payment/load",
        LOADORDERS: config.API.host + "order/load",
        LOADCARGO: config.API.host + "cargo/load",
        STATUSES: config.API.host + "status/load/type/payment",
        CASHIEROFFICE: config.API.host + "cashier-office/load",
        CREATE: config.API.host + "cashier-office/create",
        ORDERTYPE: config.API.host + "order-type/load",
        CURRENCY: config.API.host + "currency/load",
        CREATE_PAYMENT: config.API.host + "payment/create",
        ORDERPAYMENTS: config.API.host + "/payment/load/orderId/"
    });

    app.factory("PaymentService", ["PATH", 'RestFactory',
        function (PATH, RestFactory) {

            /**
             * Get current month range
             *
             * @param int year
             * @param int iso month iso code
             * @access private
             * @returns object
             */
            var getCurrentMonthRange = function (year, iso) {

                var range = {
                    start : moment([year, iso, 1]).format("YYYY-MM-DD"),
                    end   : moment().format('YYYY-MM-DD')+" 23:59:59"
                };

                return range;
            };

            /**
             * Format date range
             *
             * @param createDate Date
             * @access private
             * @returns object
             */
            var dateRangeFormat = function (date) {

                var range = {
                    start : moment(date.startDate).format("YYYY-MM-DD"),
                    end   : moment(date.endDate).format('YYYY-MM-DD')
                }

                return range;
            };

            return {

                /**
                 * Get orders for autocomplete
                 *
                 * @returns {*}
                 */
                getOrders: function () {
                    return RestFactory.request(PATH.LOADORDERS);
                },

                /**
                 * Get cargo for autocomplete
                 *
                 * @returns {*}
                 */
                getCargo: function () {
                    return RestFactory.request(PATH.LOADCARGO);
                },

                /**
                 * Combine payments by date & status / Calling by type
                 *
                 * @param int status
                 * @param Date date
                 * @returns {*}
                 */
                getPayments: function (status, date) {

                    var data = '';
                    var range = '';

                    if (!_.isUndefined(status)) {
                        // use status
                        data += "/status/" + status + '/';
                    }

                    if (!_.isUndefined(date)) {
                        // use selected date
                        data += 'paymentDate/'+ date.start + ',' + date.end;
                    }
                    else {
                        // use current month by default
                        range = getCurrentMonthRange(moment().year(), moment().month());
                        //console.log(range);
                        data += 'paymentDate/'+ range.start + ',' + range.end;
                    }

                    return RestFactory.request(PATH.LOAD_PAYMENT + data);
                },
                getCurrentPayment:function(id){
                    return RestFactory.request(PATH.LOAD_PAYMENT + "/id/"+id);
                },
                /**
                 * Create new payment
                 *
                 * @param object obj request data
                 * @param object user auth user
                 * @returns {*}
                 */
                createPayment: function (obj, user) {

                    var data = {};

                    if (obj.hasOwnProperty('order') && !_.isEmpty(obj.order)) {
                        data.documentId = obj.order.id;
                        data.paymentDocumentType = 1;
                    }
                    else if(obj.hasOwnProperty('cargo') && !_.isEmpty(obj.cargo)) {
                        data.documentId = obj.cargo.id;
                        data.paymentDocumentType = 2;
                    }
                    else {
                        data.paymentDocumentType = 0;
                    }

                    data.currencyId = 1,
                    data.cashierId  = user.id,
                    data.cashierOfficeId = parseInt(user.settings.cashierOffice),
                    data.paymentType    = obj.type.value,
                    data.amount         = parseFloat(obj.amount),
                    data.paymentMethod = "bank",
                    data.note = (obj.note) ? obj.note: "";

                    return RestFactory.request(PATH.CREATE_PAYMENT, "POST", data);
                },

                /**
                 * Calculate paid rows
                 *
                 * @param array rows
                 * @returns {Array}
                 */
                calculatePaidRows: function (rows) {

                    var summary = {
                            amount : Number(_.sum(_.map(rows, function(value) {
                                    return parseFloat(value.amount);
                            }))).toFixed(2),
                            refund :  Number(_.sum(_.map(rows, function(value) {
                                return parseFloat(value.refund);
                            }))).toFixed(2),
                            currency : (!_.isEmpty(rows)) ? rows[0].currency : 'CNY'
                        };

                    summary.difference = Number(summary.refund - summary.amount).toFixed(2);

                    return summary;
                },
                /**
                 * Resolve payments data for DataTable
                 *
                 * @param array
                 * @returns {Array}
                 */
                resolvePaymentData: function (array) {

                    var payments = [];

                    angular.forEach(array, function (item) {

                        payments.push({
                            id:                 item.payment.id,
                            documentId:         (!_.isNull(item.payment.documentId)) ? item.payment.documentId : 'Other',
                            factory:            (item.hasOwnProperty('document') && !_.isUndefined(item.document.factoryId)) ? item.document.factoryId : '?',
                            date:               item.payment.paymentDate,
                            method:             item.payment.paymentMethod,
                            cashierOfficeId:    item.payment.cashierOfficeId,
                            amount:             (item.payment.paymentType == 'payment') ? parseFloat(item.payment.amount) : "",
                            refund:             (item.payment.paymentType == 'refund') ? parseFloat(item.payment.amount) : "",
                            currency:           item.currency.ISOCode
                        });
                    });

                    return payments;
                },


                /**
                 * Nav bar filter's parser
                 *
                 * @param object filter
                 * @returns object result
                 */
                parseFilters: function (filter) {

                    var result = {};
                    if(filter.hasOwnProperty('createDate')) {

                        result.date =  dateRangeFormat(filter.createDate);
                    }
                    return result;
                },



                // @TODO untouched area









                /**
                 *
                 * @param id
                 * @returns {*}
                 */
                getOrderPayments: function (id) {
                    return RestFactory.request(PATH.ORDERPAYMENTS + id);
                },

                /**
                 *
                 * @param payments
                 * @param officies
                 * @returns {Array}
                 */
                parseCashierOffice: function (payments, officies) {

                    var result = [];

                    angular.forEach(payments, function (item) {

                        angular.forEach(officies, function (value) {

                            if (value.id == item.cashierOfficeId) {

                                item.cashierOfficeName = value.name;

                                return;
                            }
                        });

                        this.push(item);

                    }, result);

                    return result;
                },

                /**
                 *
                 * @returns {*}
                 */
                getStatuses: function () {
                    return RestFactory.request(PATH.STATUSES);
                },
                /**
                 *
                 * @returns {*}
                 */
                getOrderType: function () {
                    return RestFactory.request(PATH.ORDERTYPE);
                },
                /**
                 *
                 * @returns {*}
                 */
                getCurrency: function () {
                    return RestFactory.request(PATH.CURRENCY);
                },
                /**
                 *
                 * @returns {*}
                 */
                getCashierOfficies: function () {
                    return RestFactory.request(PATH.CASHIEROFFICE);
                },
                /**
                 *
                 * @param obj
                 * @returns {*}
                 */
                createCashierOffice: function (obj) {
                    var data = {
                        'name': obj.name,
                        'status': 0,
                        'orderTypeId': obj.type.id,
                        'currencyId': obj.currency.id
                    };
                    //console.log("new Cash.Off.",data);
                    return RestFactory.request(PATH.CREATE, "POST", data);
                },

                /**
                 *
                 * @param url
                 * @returns {*}
                 */
                getFilteredData: function (url) {

                    return RestFactory.request(url);
                }

            }

        }]);
})();
