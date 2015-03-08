(function(){

    angular.module("services.cargo",[])
        .constant("SERVER", {
            "addProduct": config.API.host + "cargo/addproduct"
        })
        .factory("CargoCalculator", ['$rootScope', 'SERVER', '$http',
            function($rootScope, SERVER, $http) {

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
                 * Add cargo order products to summary
                 *
                 * @param object products
                 */
                addToSummary: function (products) {

                    $rootScope.addedToSummary =[];

                    if(products.length > 0) {

                        angular.forEach(products, function(value, index) {

                            $http.post(SERVER.addProduct, products[index])

                                .success(function(data){

                                    if(typeof data == 'object'){

                                        $rootScope.addedToSummary.push(data);
                                    }
                                })
                                .error(function(data,status){
                                    console.log("error",data,status);
                                })
                        });

                    }

                },

                /**
                 * Calc delivery total to cargo
                 *
                 * @param object products
                 */
                resolveResponse: function (response) {

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

                        return rules;
                    },
                /**
                 *
                 * @returns {{cargoId: *, orderId: ($rootScope.order_id|*), sizeId: *, articul: (*|$scope.summaryCart.article|article), productId: *, factoryArticul: *, price: *, count: *}}
                 */
                parseData:function(){

                    var cargoId,orderId,sizeId,articul,productId,factoryArticul,count,price;
                    console.log("we here");
                    console.log( "newcargo_items",$rootScope.newcargo_items);
                    console.log( "cargo_items",$rootScope.cargo_items);
                    console.log("items",$rootScope.items);
                    console.log("cart",$rootScope.cart);
                    console.log("row",$rootScope.order_id);
                    console.log("factoryOrders",$rootScope.factoryOrders);
                    console.log("row",$rootScope.row);
                    parser_one();
                    function parser_one(){
                        var length=$rootScope.cart.products.length;
                        for(var i=0;i<length;i++){
                            if($rootScope.cart.products[i].articul==$rootScope.row.article){
                                $rootScope.row_number=i;
                                productId=$rootScope.cart.products[i].productId;
                                factoryArticul=$rootScope.cart.products[i].factoryArticul;
                                price=$rootScope.cart.products[i].price;
                            }
                        }
                    }
                    var result=[];
                    if($rootScope.row.size_list.length>1){

                        var size_length=$rootScope.row.size_list.length;
                        for(var i=0;i<size_length;i++){

                            var obj={
                                'cargoId': ($rootScope.cart.cargo) ? $rootScope.cart.cargo.id: "",
                                'orderId':($rootScope.order_id)?$rootScope.order_id:"",
                                'sizeId': $rootScope.row.size_list[i].id,
                                'articul': $rootScope.row.article,
                                'productId':(productId) ? productId : "",
                                'factoryArticul':(factoryArticul) ? factoryArticul: "",
                                'price':(price) ? price : "",
                                'count':$rootScope.row.count_list[i].value
                            };
                            result.push(obj);
                        }
                    }
                    else{
                        //console.log("typeof sizeList",typeof $rootScope.row.size_list);


                        var obj={
                            'cargoId': ($rootScope.cart.cargo) ? $rootScope.cart.cargo.id: "",
                            'orderId':($rootScope.order_id)?$rootScope.order_id:"",
                            'sizeId': (jQuery.isEmptyObject($rootScope.row.size_list))?null:$rootScope.row.size_list[0].id,
                            'articul': $rootScope.row.article,
                            'productId':productId,
                            'factoryArticul':factoryArticul,
                            'price':price,
                            'count':(jQuery.isEmptyObject($rootScope.row.count_list))?null:$rootScope.row.count_list[0].value
                        };
                        result.push(obj);
                    }

                    return result;
                }
                };
            //};
        }]);
})();
