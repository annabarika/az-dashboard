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
                    var length=response.length;
                    if(length) {

                        var rules = [];

                        console.log('Response', response);
                        //return;
                        var counter = 0;
                        for(var i=0; i<length; i++) {


                            console.log(counter);
                            if(response[counter].articul) {

                                var pushObj = {
                                    "article": response[counter].articul,
                                    "size_list": function () {
                                        console.log("size",counter);
                                        var sizes = [];

                                        //console.log('Res', response[counter]);
                                        if (typeof response[counter].sizeInfo != 'undefined' || typeof response[counter].sizeInfo != null) {

                                            if (response[counter].sizeInfo.length > 1) {

                                                angular.forEach(response[counter].sizeInfo, function (value, key) {

                                                    for (var k = 0; k < $rootScope.all_sizes.length; k++) {
                                                        if (key === $rootScope.all_sizes[k].name) {
                                                            sizes.push({
                                                                "value": key,
                                                                "id": $rootScope.all_sizes[k].id
                                                            });
                                                        }
                                                    }
                                                });
                                            }
                                            else if (response[counter].sizeInfo.length === 1) {
                                                for (var k = 0; k < $rootScope.all_sizes.length; k++) {

                                                    angular.forEach(response[counter].sizeInfo, function (value, key) {
                                                        if (key == $rootScope.all_sizes[k].name) {

                                                            sizes.push({
                                                                "value": key,
                                                                "id": $rootScope.all_sizes[k].id
                                                            });
                                                        }
                                                    });
                                                }
                                            }

                                        }
                                        return sizes;
                                    },
                                    "count_list":function(){
                                        console.log("count",counter);
                                        var counts=[];
                                        if (response[counter].sizeInfo.length > 1) {

                                           for(var i=0;i<response[counter].sizeInfo.length;i++){
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
                                    },
                                    "photo": function(){
                                        var photo='';
                                        console.log(response[counter].photos,counter);
                                        if(angular.isUndefined(response[counter].photos) === false) {

                                            if(response[counter].photos != null) {
                                                if(response[counter].photos.length > 0){
                                                    photo="http://back95.ru/f/p/g/60x60/catalogue/" + response[counter].id + "/" + response[counter].photos[0];
                                                }
                                            }
                                        }
                                        return photo;
                                    },
                                    "active": ''
                                };
                                rules.push(pushObj);
                                counter++;
                            }

                        }
                            var result =[];
                            for(var j= 0; j < rules.length; j++) {

                                result.push({
                                    'article'       : rules[j].article,
                                    'size_list'     : rules[j].size_list(),
                                    'count_list'    : rules[j].count_list(),
                                    'photo'         : rules[j].photo(),
                                    'active'        : rules[j].active
                                })
                            }

                        return result;
                    }
                }
            };
        }]);
})();
