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
        };

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
app.controller('BestsellerItemController',[
    '$scope',
    '$rootScope',
    "$modal",
    "$location",
    '$routeParams',
    'BestsellersService',
    'messageCenterService',
    function ($scope, $rootScope, $modal, $location, $routeParams, BestsellersService, messageCenterService){

        $scope.bestsellerHistory=[];

        BestsellersService.getBestseller($routeParams.bestsellerId).then(function(response) {

            if(response.bestseller) {

                $scope.bestseller = response.bestseller;
                $scope.notes=$scope.bestseller.notes;
				$scope.factory = response.factory;
				$scope.product = response.product;
                $scope.order = response.order;
                $scope.sizes = [{  }, { } ];
                console.log($scope.product);
                if( $scope.product.marketing.sizes ){
                    var sizes = $scope.product.marketing.sizes;
                    for( var size in sizes ){
                        sizes[size].size = size;
                        sizes[size].hide = true;
                        $scope.sizes.push(sizes[size]);
                    }
                }
                $scope.sizes.push({});
                $scope.sizes.push({});
                console.log($scope.sizes);
				$rootScope.documentTitle = $scope.product.articul + " ( FA: "+ $scope.product.factoryArticul +")";

                BestsellersService.getBestsellerHistory($scope.bestseller.productId).then(function(response) {
                  /*  console.log("bests history",response);*/
                    $scope.tmp = response;
                    angular.forEach( $scope.tmp,function(item){
                        BestsellersService.getProducts(item.orderId).then(
                            function(response){
                                /*console.log(i,"products",response);*/
                                if(_.isArray(response) && response.length!=0){

                                    item['size']=response[0].size;
                                    item['count']=response[0].count;

                                }
                                $scope.bestsellerHistory.push(item);
                               // console.log( $scope.bestsellerHistory);
                            }
                        )
                    });
                });

                console.log('Bestseller', response);
            }
            else {
                messageCenterService.add('danger', 'Bestseller not found', {timeout: 3000});
            }
        });
        /**
         * show pdf
         */
        $scope.createPdf=function(){
            console.log($scope.bestseller.orderId);
            BestsellersService.createPdf($scope.bestseller.orderId).then(

                function(response){
                    console.log(response);
                    if (_.has(response,'html'))
                    {
                        window.location=response.html;
                        target="_blank";
                    }
                    else{
                        messageCenterService.add("danger","Error: pdf is not created",{timeout:3000});
                    }
                }
            )

        };
        /**
         *
         * @param order
         */
        $scope.openOrder = function(order){
            $location.path('/buyer/orders/id/'+order.id)
        };
        /**
         *
         * @param sizes
         */
        $scope.createOrder = function( sizes ){

            console.log("sizes",sizes);

            var _sizeArray=BestsellersService.sizeCheck(sizes);

            console.log("sizeArray",_sizeArray);

            if(_sizeArray.length==0){

                messageCenterService.add("danger","size or count is empty",{timeout:3000});
                return;
            }

            BestsellersService.createOrder( $scope.product.factoryId).then(function(response){
                if(response.id){
                    var orderId = response.id;
                    var products = BestsellersService.prepareProducts(orderId, $scope.bestseller.id, $scope.product, _sizeArray);
                    // Adding items to order
                    for( i in products){
                        BestsellersService.addOrderProductRow(orderId, products[i]).then(
                            function(response){
                                console.log(response);
                                if(response.id){

                                    products.splice(0, 1);
                                }
                            },
                            function(error){
                                messageCenterService.add("danger","ERROR: "+error,{timeout:3000});
                            }
                        );
                    }
                    BestsellersService.sendCreatedOrder(orderId).then(function(response) {
                        if(response.file) {

                            if(products.length == 0){
                                window.location.reload();
                            }
                        }
                    });
                }
            });
        };
        /**
         *
         * @param notes
         * @param event
         */
        $scope.updateNotes=function(notes,event){
            if(event.keyCode==13){

                var data={
                    id:$scope.bestseller.id,
                    status:$scope.bestseller.status,
                    notes:notes
                };
                console.log(data);
                BestsellersService.update(data).then(
                    function(response){
                        //console.log(response);
                        if(response.notes==notes){
                            messageCenterService.add("success","Notes updated",{timeout:3000});
                        }
                        else{
                            messageCenterService.add("danger","Notes is not updated",{timeout:3000});
                        }
                    }
                )
            }

        }


    }]);