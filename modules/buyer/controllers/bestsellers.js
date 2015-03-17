var app = angular.module("modules.buyer.bestsellers", [

]);

app.controller('BestsellersController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",

        function ($scope, $rootScope, $modal, $location, $route, RestFactory) {

            $scope.$route = $route;
            $scope.$location = $location;
            var url, data, method, header, length, array, year, month, monthBegin, monthEnd;
            /* Getting payments */
            $rootScope.documentTitle = "Bestsellers";

            $scope.months =
            {
                '01': 'January',
                '02': 'Fabruary',
                '03': 'March',
                '04': 'April',
                '05': 'May',
                '06': 'June',
                '07': 'July',
                '08': 'August',
                '09': 'September',
                '10': 'October',
                '11': 'November',
                '12': 'December'
            };

            $scope.current_year = new Date().getFullYear();

            $scope.changeYear = function (step) {
                $scope.current_year = $scope.current_year + step;
            };

            $scope.bestsellers = {};

            url = config.API.host + "bestseller/load/status/1";

            RestFactory.request(url)
                .then(function (response) {
                    console.log("bests,load",response);
                    if (response) {
                        length = response.length;

                        var tempArr = [];
                        for (var i = 0; i < length; i++) {
                            angular.forEach(response[i], function (value, key) {
                                if (key == 'createDate') {
                                    array = value.split("-");
                                    year = array[0];
                                    month = array[1];
                                    tempArr.push({year: year, month: month, item: response[i]});
                                }
                            })
                        }
                        array = [];
                        angular.forEach(tempArr, function (value, key) {

                            if ($scope.bestsellers[value.year] == undefined) {

                                $scope.bestsellers[value.year] = {
                                    '01': [],
                                    '02': [],
                                    '03': [],
                                    '04': [],
                                    '05': [],
                                    '06': [],
                                    '07': [],
                                    '08': [],
                                    '09': [],
                                    '10': [],
                                    '11': [],
                                    '12': []
                                };
                            }
                            angular.forEach($scope.bestsellers[value.year], function (val, month) {
                                if (month == value.month) {
                                    val.push(value.item);
                                }
                            });

                        });
                        console.log($scope.bestsellers, $scope.current_year);
                    }
                });


            $scope.currentMonth = function (monthName) {
                $scope.current_month = monthName;

                angular.forEach($scope.months, function (value, key) {
                    if (value == monthName) {
                        month = key;

                    }
                });
                monthBegin = $scope.current_year + "-" + month + "-01";
                monthEnd = $scope.current_year + "-" + month + "-31";
                url = config.API.host + "bestseller/load-detailed/status/1/orderDate/" + monthBegin + "," + monthEnd;
                console.log(url);
                RestFactory.request(url)
                    .then(function (response) {
                        console.log(response);
                        $scope.bests_orders = response;
                        console.log($scope.bests_orders);

                    }, function (error) {
                        console.log(error)
                    });
            };
        }]);

app.controller('BestsellerItemController',
    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){

            $scope.$route = $route;
            $scope.$location = $location;

            /* Getting cargo */
            $scope.summaryCart = [
                {
                    "a_photo":"/assets/images/avatar/avatar18.jpg",
                    "article":"3234555",
                    "size":"M",
                    "count":"3x",
                    "curency":"100"
                },

                {
                    "a_photo":"/assets/images/avatar/avatar17.jpg",
                    "article":"8676",
                    "size":"S",
                    "count":"3x",
                    "curency":"100"
                },

                {
                    "a_photo":"/assets/images/avatar/avatar18.jpg",
                    "article":"4435",
                    "size":"L",
                    "count":"3x",
                    "curency":"100"
                },

                {
                    "a_photo":"/assets/images/avatar/avatar3.jpg",
                    "article":"35356",
                    "size":"M",
                    "count":"3x",
                    "curency":"100"
                },
                {
                    "a_photo":"/assets/images/avatar/avatar8.jpg",
                    "article":"995453",
                    "size":"M",
                    "count":"3x",
                    "curency":"100"
                },
                {
                    "a_photo":"/assets/images/avatar/avatar1.jpg",
                    "article":"344657",
                    "size":"M",
                    "count":"3x",
                    "curency":"100"
                },
                {
                    "a_photo":"/assets/images/avatar/avatar16.jpg",
                    "article":"233567",
                    "size":"M",
                    "count":"3x",
                    "curency":"100"
                },
                {
                    "a_photo":"/assets/images/avatar/avatar18.jpg",
                    "article":"9799898",
                    "size":"M",
                    "count":"3x",
                    "curency":"100"
                }
            ];

            $scope.edit = function (obj) {
                console.log(obj);
                $location.path( '/buyer/bestsellers/bestseller_cart');
            };

            $scope.tableHeader = [
                { name: "size", title: 'Size' },
                { name: "count", title: 'Count' },
                { name: "speed", title: 'Sales speed' },
                { name: "sales", title: 'Sales' },
                { name: "returns", title: 'Returns' }
            ];
            $scope.buttonsCart=[{
                class:"btn btn-default",
                icon:"fa fa-trash-o"
            }];
            $scope.buttonAction=function(){
                alert("delete");
            };
            RestFactory.request('data/cartProduct.json')
                .then(function(response){
                    //$scope.cartProduct =response;
                    //var l=$scope.cartProduct.length;
                    //for(var i=0;i<l;i++){
                    //    angular.forEach($scope.cartProduct[i],function(v,k){
                    //        if(k=='returns'){
                    //            //v=v+'%';
                    //            console.log(v);
                    //            console.log(typeof v);
                    //        }
                    //        if(k=='sales'){
                    //            //v=v+'%';
                    //            console.log(v);
                    //            console.log(typeof v);
                    //        }
                    //    });
                    //}

                    $scope.cartProduct =response;
                    console.log($scope.cartProduct);
                });

            $scope.tableHeaderHistoryCart = [
                { name: "date", title: 'Re buying date' },
                { name: "size", title: 'Size&count' }
            ];
            RestFactory.request('data/historyCart.json')
                .then(function(response){
                    $scope.historyCart =response;
                });

            $scope.tableHeaderLogOperations = [
                { name: "type", title: 'Operations type' },
                { name: "time", title: 'Time' },
                { name: "date", title: 'Date' }
            ];
            RestFactory.request('data/logOperations.json')
                .then(function(response){
                    $scope.logOperations =response;
                });
        }]);/**
 * Created by kostyan on 3/17/15.
 */
