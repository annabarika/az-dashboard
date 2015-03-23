(function(){

    var app=angular.module("services.payments",[]);

    app.constant("PATH",{
            LOAD    :   config.API.host + "payment/load"
    });

    app.factory("PaymentService", ["PATH", 'RestFactory', '$modal',
        function(PATH, RestFactory, $modal) {

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
                            //console.log(item,i);
                            this.push({
                                id      :   item.payment.id,
                                orderId :   item.payment.orderId,
                                factory :   item.factory.id,
                                date    :   item.payment.paymentDate,
                                method  :   item.payment.paymentMethod,
                                amount  :   (item.payment.paymentType=='payment')?item.payment.amount:"",
                                refund  :   (item.payment.paymentType=='refund')?item.payment.amount:""

                            });
                        },payments);
                    return payments;
                }
            }

        }]);

})();
