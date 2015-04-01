(function(){

    var app=angular.module("services.payments",[]);

    app.constant("PATH",{
        LOAD            :   config.API.host + "payment/load",
        LOADORDERS      :   config.API.host + "order/load",
        STATUSES        :   config.API.host + "status/load/type/payment",
        CASHIEROFFICE   :   config.API.host + "cashier-office/load",
        CREATE          :   config.API.host + "cashier-office/create",
        ORDERTYPE       :   config.API.host + "order-type/load",
        CURRENCY        :   config.API.host + "currency/load",
        NEWPAYMENT      :   config.API.host + "payment/create",
        ORDERPAYMENTS   :   config.API.host +"/payment/load/orderId/"
    });

    app.factory("PaymentService", ["PATH", 'RestFactory',
        function(PATH, RestFactory) {

            return{
                /**
                 *
                 * @returns {*}
                 */
                getPayments: function(){

                    return RestFactory.request(PATH.LOAD);
                },
                /**
                 *
                 * @param id
                 * @returns {*}
                 */
                getOrderPayments: function(id){

                    return RestFactory.request(PATH.ORDERPAYMENTS+id);
                },
                /**
                 *
                 * @returns {*}
                 */
                getOrders:function(){
                    return RestFactory.request(PATH.LOADORDERS);
                },
                /**
                 *
                 * @param array
                 * @returns {Array}
                 */
                parseData: function(array){

                    var payments=[];

                    angular.forEach(array,function(item,i){
                        // console.log(item,i);
                        this.push({
                            id              :   item.payment.id,
                            orderId         :   item.payment.orderId,
                            factoryId       :   item.factory.id,
                            factory         :   item.factory.name,
                            date            :   item.payment.paymentDate,
                            method          :   item.payment.paymentMethod,
                            cashierOfficeId :   item.payment.cashierOfficeId,
                            amount          :   (item.payment.paymentType=='payment')?item.payment.amount:"",
                            refund          :   (item.payment.paymentType=='refund')?item.payment.amount:"",
                            currency        :   item.currency.ISOCode

                        });
                    },payments);
                    return payments;
                },
                /**
                 *
                 * @param payments
                 * @param officies
                 * @returns {Array}
                 */
                parseCashierOffice:function(payments,officies){

                    var result=[];

                    angular.forEach(payments,function(item){

                        angular.forEach(officies,function(value){

                            if(value.id==item.cashierOfficeId){

                                item.cashierOfficeName=value.name;

                                return;
                            }
                        });

                        this.push(item);

                    },result);

                    return result;
                },

                /**
                 *
                 * @returns {*}
                 */
                getStatuses: function(){
                    return RestFactory.request(PATH.STATUSES);
                },
                /**
                 *
                 * @returns {*}
                 */
                getOrderType:function(){
                    return RestFactory.request(PATH.ORDERTYPE);
                },
                /**
                 *
                 * @returns {*}
                 */
                getCurrency:function(){
                    return RestFactory.request(PATH.CURRENCY);
                },
                /**
                 *
                 * @returns {*}
                 */
                getCashierOfficies:function(){
                    return RestFactory.request(PATH.CASHIEROFFICE);
                },
                /**
                 *
                 * @param obj
                 * @returns {*}
                 */
                createCashierOffice:function(obj){
                    var data={
                        'name': obj.name,
                        'status': 0,
                        'orderTypeId':obj.type.id,
                        'currencyId':obj.currency.id
                    };
                    //console.log("new Cash.Off.",data);
                    return RestFactory.request(PATH.CREATE,"POST",data);
                },
                /**
                 *
                 * @param filter
                 * @returns {string}
                 */
                parseFilters:function(filter){
                    var url=PATH.LOAD;

                    if(filter.status){

                        url+="/status/"+filter.status.join();
                    }
                    if(filter.cashierOffice){

                        url+="/cashierId/"+filter.cashierOffice.join();
                    }
                    if(filter.type){

                        url+="/paymentType/"+filter.type.join();
                    }

                    return url;
                },
                /**
                 *
                 * @param url
                 * @returns {*}
                 */
                getFilteredData:function(url){
                    console.log(url);
                    return RestFactory.request(url);
                },
                /**
                 *
                 * @param obj
                 * @returns {*}
                 */
                createNewPayment:function(obj){
                    var data={
                        'currencyId'        : (obj.id)?obj.id.currencyId:1,
                        'cashierId'         : 3,
                        'amount'            : obj.amount,
                        'orderId'           : (obj.id)?obj.id.id:0,
                        'paymentType'       : "payment",
                        'paymentMethod'     : obj.method.name,
                        'cashierOfficeId'   : 3,
                        "note"              : (obj.note)?obj.note:""
                    };
                    //console.log(data);

                    return RestFactory.request(PATH.NEWPAYMENT,"POST",data);
                }

            }

        }]);

})();
