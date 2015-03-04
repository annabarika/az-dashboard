(function(){

    angular.module("services.cargo",[])

        .factory("CargoCalculator", function() {

            return {

                /**
                 * Calc delivery total to cargo
                 *
                 *
                 * @param object products
                 */
                calcTotalAmount: function (products) {

                    var total = 0;

                    if(products.length > 0) {

                        angular.forEach(products, function(value) {
                            total +=  (parseFloat(value.count) * parseFloat(value.price));
                        });
                    }
                    return total;
                }
            };
        });
})();
