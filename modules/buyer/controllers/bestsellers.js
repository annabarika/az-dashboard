var app = angular.module("modules.buyer.bestsellers", []);

// Bestseller's representation
app.controller('BestsellersController', ['$scope','$rootScope','$modal', 'BestsellersService',
    function ($scope, $rootScope, $modal, BestsellersService) {

        // Document header title
        $rootScope.documentTitle = "Bestsellers";

        // Get current state of date
        $scope.currentYear  = moment().year();
        $scope.currentMonth = moment.utc(new Date()).format("MMMM");

        // Datepickers functions
        $scope.dt = new Date();

        $scope.clear = function () {
            $scope.dt = null;
        };

        // Disable weekend selection
        $scope.disabled = function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };
        $scope.$watch('dt',function(newVal){
            console.log('dt',newVal);
        });

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };

        $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
        $scope.format = $scope.formats[0];

        // Get months
        $scope.months = BestsellersService.getMonths();

        // Get bestsellers data
        $scope.bestsellers = {};

        BestsellersService.getCalendarData('ordered').then(function(response) {
            $scope.bestsellers.ordered = BestsellersService.resolveCalendarData(response);
            console.log('Bestsellers ordered', $scope.bestsellers.ordered);
        });

        BestsellersService.getCalendarData('total').then(function(response) {
            $scope.bestsellers.total = BestsellersService.resolveCalendarData(response);
            console.log('Bestsellers total', $scope.bestsellers.total);
        });

        /**
         * Select year navigation
         *
         * @param int index
         */
        $scope.changeYear = function (index) {
            $scope.currentYear = $scope.currentYear + parseInt(index);
            console.log('Selected year:', $scope.currentYear);
        }

        /**
         * Select month navigation
         *
         * @param int monthISO eg. 02
         */
        $scope.selectMonth = function (monthISO) {

            // get mont name eg. February
            $scope.currentMonth = BestsellersService.getMonths(monthISO);

            BestsellersService.getDetailed('ordered', $scope.currentYear, monthISO).then(function(response) {
                $scope.bestsellersOrdered = response;

                BestsellersService.getDetailed('total', $scope.currentYear, monthISO).then(function(response) {
                    $scope.bestsellersTotal = response;
                });
            });

        };

        /**
         * Create bestseller modal autocomplete search
         */
        $scope.createBestseller = function() {

            $rootScope.modalInstance = $modal.open({
                templateUrl: "/modules/buyer/views/bestsellers/create.html",
                controller: 'BestsellersAddController',
                backdrop:'static',
                size: 'sm'
            });
        };
    }
]);

// Bestseller's add items
app.controller('BestsellersAddController', ['$scope','$rootScope', 'BestsellersService',
    function ($scope, $rootScope, BestsellersService) {

         $scope.bestseller = {};
    }
]);

app.controller('BestsellerItemController',[
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
