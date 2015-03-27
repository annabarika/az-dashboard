// Create module @require angucomple for remote search
var app = angular.module("modules.buyer.bestsellers", ['angucomplete']);

// Bestseller's representation
app.controller('BestsellersController', ['$scope','$rootScope','$modal', 'BestsellersService', 'messageCenterService', '$location',
    function ($scope, $rootScope, $modal, BestsellersService, messageCenterService, $location) {

        // Document header title
        $rootScope.documentTitle = "Bestsellers";

        // Get current state of date
        $scope.currentYear  = moment().year();
        $scope.currentMonth = moment.utc(new Date()).format("MMMM");

        // Get months
        $scope.months = BestsellersService.getMonths();

        // Get bestsellers data
        $scope.bestsellers = {};

        BestsellersService.getCalendarData('ordered', $scope.currentYear).then(function(response) {
            $scope.bestsellers.ordered = BestsellersService.resolveCalendarData(response);
        });

        BestsellersService.getCalendarData('total', $scope.currentYear).then(function(response) {
            $scope.bestsellers.total = BestsellersService.resolveCalendarData(response);
        });

        /**
         * Select year navigation
         *
         * @param int index
         */
        $scope.changeYear = function (index) {
            $scope.currentYear = $scope.currentYear + parseInt(index);

            BestsellersService.getCalendarData('ordered', $scope.currentYear).then(function(response) {
                $scope.bestsellers.ordered = BestsellersService.resolveCalendarData(response);
            });

            BestsellersService.getCalendarData('total', $scope.currentYear).then(function(response) {
                $scope.bestsellers.total = BestsellersService.resolveCalendarData(response);
            });
        }

        /**
         * Select month navigation
         *
         * @param int monthISO eg. 02
         */
        $scope.selectMonth = function (type, monthISO) {

            // get mont name eg. February
            $scope.currentMonth = BestsellersService.getMonths(monthISO);

            BestsellersService.getMonthDetailed(type, $scope.currentYear, monthISO).then(function(response) {

                if(type == 'ordered') {
                    $scope.bestsellersOrdered = response;
                }
                else {
                    $scope.bestsellersTotal = response;
                }
            });
        };

        /**
         * Get bestsellers by choosed selected date
         * @param date
         */
        $scope.selectDate = function(date) {

            $scope.currentYear = moment(date).year();

            BestsellersService.getDayDetailed('ordered', date).then(function(response) {
                $scope.bestsellersOrdered = response;

                BestsellersService.getDayDetailed('total', date).then(function(response) {
                    $scope.bestsellersTotal = response;
                });
            });
        };

        /**
         * Create bestseller
         * @uses autocomplete search
         */
        $scope.createBestseller = function(product) {

            if(_.isUndefined(product)) {

                $rootScope.modalInstance = $modal.open({
                    templateUrl: "/modules/buyer/views/bestsellers/create.html",
                    controller: 'BestsellersAddController',
                    backdrop:'static',
                    size: 'sm',
                    resolve :  {
                        searchUri : function() {
                            // resolve the search uri to autocomplete directive
                            return BestsellersService.searchArticulUri()
                        }
                    }
                });
            }
            else {
                if('originalObject' in product) {
                    BestsellersService.addToBestseller(product.originalObject).then(function(response) {

                        if(response.id) {

                            $rootScope.modalInstance.close();
                            $location.path('/buyer/bestsellers/item/'+response.id)
                        }
                        else {
                            messageCenterService.add('danger', 'Product does not created. Undefined error', {timeout: 3000});
                        }
                    });
                }
                else {
                    messageCenterService.add('danger', 'Try to add unfounded product', {timeout: 3000});
                }
            }
        };

        /**
         * Datepickers functions
         */

        $scope.date = new Date();

        $scope.clear = function () {
            $scope.date = null;
        };

        // Disable weekend selection
        $scope.disabled = function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };

        $scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();
            $scope.opened = true;
        };
        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };
        $scope.format = 'EEE MMM dd yyyy HH:mm:ss Z';
    }
]);

// Bestseller's add item
app.controller('BestsellersAddController', function ($scope, $rootScope, searchUri) {
        // provide search action to autocomplete
        $scope.searchUri = searchUri;
    }
);

/**
 * Bestseller item management
 */
app.controller('BestsellerItemController',['$scope', '$rootScope',"$modal","$location",'$routeParams', 'BestsellersService', 'messageCenterService',
    function ($scope, $rootScope, $modal, $location, $routeParams, BestsellersService, messageCenterService){

        BestsellersService.getBestseller($routeParams.bestsellerId).then(function(response) {

            if(response.bestseller) {

                $scope.bestseller = response.bestseller;
				$scope.factory = response.factory;
				$scope.product = response.product;
				$rootScope.documentTitle = $scope.product.articul + " ( FA: "+ $scope.product.factoryArticul +")"

                BestsellersService.getBestsellerHistory($scope.bestseller.productId).then(function(response) {
                    console.log(response);
                    $scope.bestsellerHistory = response;
                });

                console.log('Bestseller', response);
            }
            else {
                messageCenterService.add('danger', 'Bestseller not found', {timeout: 3000});
            }
        });
    }]);