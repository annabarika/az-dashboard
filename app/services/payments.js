(function(){

    var app=angular.module("services.payments",[]);

    app.constant("PATH",{
            LOAD            :   config.API.host + "payment/load",
            STATUSES        :   config.API.host + "status/load/type/payment",
            CASHIEROFFICE   :   config.API.host + "cashier-office/load",
            CREATE          :   config.API.host + "cashier-office/create"
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
                 * @param array
                 * @returns {Array}
                 */
                parseData: function(array){

                    var payments=[];

                        angular.forEach(array,function(item,i){
                           // console.log(item,i);
                            this.push({
                                id        :   item.payment.id,
                                orderId   :   item.payment.orderId,
                                factoryId :   item.factory.id,
                                factory   :   item.factory.name,
                                date      :   item.payment.paymentDate,
                                method    :   item.payment.paymentMethod,
                                amount    :   (item.payment.paymentType=='payment')?item.payment.amount:"",
                                refund    :   (item.payment.paymentType=='refund')?item.payment.amount:""

                            });
                        },payments);
                    return payments;
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
                getCashierOfficies:function(){
                    return RestFactory.request(PATH.CASHIEROFFICE);
                }

            }

        }]);

})();
