(function(){

    angular.module("services.cargo",[])

        .factory("CargoCalculator", ['$rootScope', function($rootScope) {

            return {

                /**
                 * Calc delivery total to cargo
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
                },

                /**
                 * Calc delivery total to cargo
                 *
                 * @param object products
                 */
                resolveResponse: function (response) {
                   /* var length=response.length;
                    if(length) {*/

                        var rules = [];

                        angular.forEach(response, function(value, key) {
                            var pushObj = {
                                "article":  value.articul,
                                "size_list": (function() {
                                        var sizes = [];
                                        if(value.sizes == null){
                                            return sizes;
                                        }
                                        for (var k = 0; k < $rootScope.all_sizes.length; k++) {

                                            for(var v = 0; v < value.sizes.length; v++) {
                                                if (value.sizes[v] === $rootScope.all_sizes[k].id) {
                                                    sizes.push({
                                                        "value":  $rootScope.all_sizes[k].name,
                                                        "id": $rootScope.all_sizes[k].id
                                                    });
                                                }
                                            }
                                        }
                                    return sizes;
                                })(),

                                "count_list": (function() {

                                    var counts=[];
                                    if(value.sizes == null){
                                        return counts;
                                    }
                                    if (value.sizes.length > 1) {

                                        for(var i=0; i<value.sizes.length;i++){
                                            counts.push({
                                                "value":0
                                            });
                                        }
                                    }else{
                                        counts.push({
                                            "value":0
                                        });
                                    }
                                    return counts;
                                })(),
                                "photo" : "http://back95.ru/f/p/g/60x60/catalogue/"+value.id+"/"+value.photos[0],
                                "active": '',
                                "id"    : value.id
                            };
                            rules.push(pushObj);
                        });

                            //var result =[];
                            //for(var j= 0; j < rules.length; j++) {
                            //
                            //    result.push({
                            //        'article'       : rules[j].article,
                            //        'size_list'     : rules[j].size_list(),
                            //        'count_list'    : rules[j].count_list(),
                            //        'photo'         : rules[j].photo(),
                            //        'active'        : rules[j].active
                            //    })
                            //}

                        return rules;
                    },

                parseData:function(){

                    var cargoId,orderId,sizeId,articul,productId,factoryArticul,count,price;
                    /*console.log("we here");
                    console.log( "newcargo_items",$rootScope.newcargo_items);
                    console.log("items",$rootScope.items);
                    console.log("cart",$rootScope.cart);
                    console.log("row",$rootScope.order_id);
                    console.log("factoryOrders",$rootScope.factoryOrders);
                    console.log("row",$rootScope.row);*/
                    parser_one();
                    function parser_one(){
                        var length=$rootScope.cart.products.length;
                        for(var i=0;i<length;i++){
                            if($rootScope.cart.products[i].articul==$rootScope.row.article){
                                productId=$rootScope.cart.products[i].productId;
                                factoryArticul=$rootScope.cart.products[i].factoryArticul;
                                price=$rootScope.cart.products[i].price;
                            }
                        }
                    }




                    var result={
                        'cargoId': ($rootScope.cart.cargo) ? $rootScope.cart.cargo.id: "",
                        'orderId':($rootScope.order_id)?$rootScope.order_id:"",
                        'sizeId': $rootScope.row.size_list[0].id,
                        'articul': $rootScope.row.article,
                        'productId':productId,
                        'factoryArticul':factoryArticul,
                        'price':price
                    };

                    return result;
                }
                };
            //};
        }]);
})();
