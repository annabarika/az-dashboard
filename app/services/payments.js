(function() {

    var app = angular.module("services.payments", []);

    app.constant("PATH", {
        LOAD_ORDER_PAYMENT: config.API.host + "payment/load-order",
        LOAD_CARGO_PAYMENT: config.API.host + "payment/load-cargo",
        LOAD_OTHER_PAYMENT: config.API.host + "payment/load-other",
        LOADORDERS: config.API.host + "order/load",
        LOADCARGO: config.API.host + "cargo/load",
        STATUSES: config.API.host + "status/load/type/payment",
        CASHIEROFFICE: config.API.host + "cashier-office/load",
        CREATE: config.API.host + "cashier-office/create",
        ORDERTYPE: config.API.host + "order-type/load",
        CURRENCY: config.API.host + "currency/load",
        CREATE_ORDER_PAYMENT: config.API.host + "payment/create-order-payment",
        CREATE_CARGO_PAYMENT: config.API.host + "payment/create-cargo-payment",
        CREATE_OTHER_PAYMENT: config.API.host + "payment/create-other-payment",
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
                    end   : moment().format('YYYY-MM-DD')
                }

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

            /**
             * Get payment (switcher)
             *
             * @param string type
             * @param Date date
             * @returns {*}
             */
            var getPayment =  function (type, data) {

                if(type === 'order') {
                    return RestFactory.request(PATH.LOAD_ORDER_PAYMENT + data);
                }
                else if(type === 'cargo') {
                    return RestFactory.request(PATH.LOAD_CARGO_PAYMENT + data);
                }
                else {
                    return RestFactory.request(PATH.LOAD_OTHER_PAYMENT + data);
                }
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
                 * @param string type
                 * @param int status
                 * @param Date date
                 * @returns {*}
                 */
                getPayments: function (type, status, date) {

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
                        range = getCurrentMonthRange(moment().year(), moment().month())
                        data += 'paymentDate/'+ range.start + ',' + range.end;
                    }
                    return getPayment(type, data);
                },

                /**
                 * Create new payment
                 *
                 * @param object data request data
                 * @param object user auth user
                 * @returns {*}
                 */
                createPayment: function (data, user) {

                    var data = {};
                    var url;

                    if (obj.hasOwnProperty('order') && !_.isEmpty(obj.order)) {
                        data.documentId = obj.order.id;
                        url = PATH.CREATE_ORDER_PAYMENT;
                    }
                    else if(obj.hasOwnProperty('cargo') && !_.isEmpty(obj.cargo)) {
                        data.documentId = obj.cargo.id;
                        url = PATH.CREATE_CARGO_PAYMENT;
                    }
                    else {
                        url = PATH.CREATE_OTHER_PAYMENT;
                    }

                    data.currencyId = 1,
                    data.cashierId  = user.id,
                    data.cashierOfficeId = parseInt(user.settings.cashierOffice),
                    data.paymentType    = obj.type.value,
                    data.amount         = parseFloat(obj.amount),
                    data.paymentMethod = obj.method.value,
                    data.note = (obj.note) ? obj.note: "";

                    return RestFactory.request(url, "POST", data);
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
                            currency : rows[0].currency
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
                            factoryId:          (item.hasOwnProperty('factory') && !_.isUndefined(item.factory.id)) ? item.factory.id : '?',
                            factory:            (item.hasOwnProperty('factory') && !_.isUndefined(item.factory.name)) ? item.factory.name : '?',
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
