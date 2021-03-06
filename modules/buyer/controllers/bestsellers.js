// Create module @require angucomple for remote search
var app = angular.module("modules.buyer.bestsellers", ['angucomplete', 'commonFilters']);

// Bestseller representation
app.controller('BestsellersOrderedController', ['$scope','$rootScope','$modal', 'BestsellersService', 'messageCenterService', '$location',
    function ($scope, $rootScope, $modal, BestsellersService, messageCenterService, $location) {

        // Document header title
        $rootScope.documentTitle = "Ordered bestsellers";

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

           /* BestsellersService.getDayDetailed('ordered', date).then(function(response) {
                $scope.bestsellersOrdered = response;
                console.log(response);
                BestsellersService.getDayDetailed('total', date).then(function(response) {
                    $scope.bestsellersTotal = response;
                    console.log(response);
                });
            });*/

            BestsellersService.getDayDetailed('total', date).then(function(response) {
               // $scope.bestsellersTotal = response;
                $scope.bestsellersOrdered = response;
                console.log(response);
            });

        };

        /**
         * Create bestseller
         * @uses autocomplete search
         */
        $scope.createBestseller = function(product, calendar) {

            if(calendar !== undefined){
                $rootScope.addToCalendar = calendar;
            }
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
                if(calendar != undefined){
                    product.originalObject.orderDate = moment(calendar).format('YYYY-MM-DD');
                }
                if('originalObject' in product) {
                    BestsellersService.createBestseller(product.originalObject).then(function(response) {

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

        $scope.date = moment(new Date()).format('DD-MMMM-YYYY');

        $scope.clear = function () {
            $scope.date = null;
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
        $scope.format = ' dd-MMMM-yyyy';
    }
]);

// Bestseller's add item
app.controller('BestsellersAddController', function ($scope, searchUri) {
        // provide search action to autocomplete
        $scope.searchUri = searchUri;
        $scope.today = function() {
            $scope.dt = new Date();
        };
        $scope.today();

        $scope.clear = function () {
            $scope.dt = null;
        };

        /*$scope.disabled = function(date, mode) {
            return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
        };*/

        $scope.toggleMin = function() {
            $scope.minDate = $scope.minDate ? null : new Date();
        };
        $scope.toggleMin();

        /*$scope.open = function($event) {
            $event.preventDefault();
            $event.stopPropagation();

            $scope.opened = true;
        };

        $scope.dateOptions = {
            formatYear: 'yy',
            startingDay: 1
        };*/

        $scope.format ='dd-MMMM-yyyy';

        $scope.$watch('buyingDate',function(val){
            if(val){
                console.log(val);
            }
        })

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

        $scope.documentTitle = 'Loading..';

        $rootScope.hideHeader = 'hideHeader';
        $scope.count = parseInt($location.hash());

        BestsellersService.getModerators().then(function(response) {
            $scope.moderators = response;
        });

        BestsellersService.getBestseller($routeParams.bestsellerId).then(function(response) {

            if(response.bestseller) {
                console.log(response);
                $scope.bestseller = response.bestseller;
                $scope.notes=$scope.bestseller.notes;
				$scope.factory = response.factory;
				$scope.product = response.product;
                $scope.order = response.order;
                $scope.sizes = [{  }, { } ];
                //console.log($scope.product);
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
                //console.log($scope.sizes);
				$rootScope.documentTitle = $scope.product.articul + " (FA: "+ $scope.product.factoryArticul +")";

                BestsellersService.calculate($scope.count, $scope.sizes);

                BestsellersService.getBestsellerHistory($scope.bestseller.productId).then(function(response) {
                    console.log("bests history",response);
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

                //console.log('Bestseller', response);
            }
            else {
                messageCenterService.add('danger', 'Bestseller not found', {timeout: 3000});
            }
        });
        /**
         * show pdf
         */
        $scope.createPdf=function(){
            //console.log($scope.bestseller.orderId);
            BestsellersService.createPdf($scope.bestseller.orderId).then(

                function(response){
                    //console.log(response);
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
        $scope.calculate = function(num){
            $scope.sizes = BestsellersService.calculate(num, $scope.sizes);
        };

        /**
         *
         * @param order
         */
        $scope.openOrder = function(order){
            $location.path('/buyer/orders/id/'+order.id)
        };

        /**
         * Create Order
         *
         * @param sizes
         */
        $scope.createOrder = function( sizes ){

            console.log("user",$rootScope.user);
            var _sizeArray=BestsellersService.sizeCheck(sizes);
            console.log("sizeArray",_sizeArray);

            if(_sizeArray.length==0){
                messageCenterService.add("danger","size or count is empty",{timeout:3000});
                return;
            }
            var factory= _.find($rootScope.factories,{id:$scope.product.factoryId});
            BestsellersService.createOrder(factory,$rootScope.user).then(function(response){
                if(_.has(response,'id')){
                    var orderId = response.id;
                    var products = BestsellersService.prepareProducts($scope.bestseller.id, $scope.product, _sizeArray);
                    // Adding items to order
                    for( i in products){
                        BestsellersService.addOrderProductRow(orderId, products[i]).then(
                            function(response){
                                //console.log(response);
                                if(_.has(response,'id')){
                                    messageCenterService.add('success','Order created',{timeout:3000});
                                    products.splice(0, 1);
                                }
                            },
                            function(error){
                                messageCenterService.add("danger","ERROR: "+error,{timeout:3000});
                            }
                        );
                    }
                    BestsellersService.sendCreatedOrder(orderId).then(function(response) {
                        if(response.path) {

                            if(products.length == 0){
                                window.location.reload();
                            }
                        }
                    });
                }
                else{
                    messageCenterService.add("danger","Sorry,order is not created. Error: "+response,{timeout:3000});
                }
            });
        };

        /**
         * Re Order Bestseller
         *
         * @param array scopeSizes
         */
        $scope.reOrder = function(scopeSizes) {

            var create = {};

            create.sizes = BestsellersService.sizeCheck(scopeSizes);

            if(create.sizes.length > 0) {

                // Create Bestseller
                BestsellersService.createBestseller({id : $scope.bestseller.productId}).then(function(response) {

                    if(response.id) {

                        create.betsellerId = response.id;

                        // Create Order
                        var factory= _.find($rootScope.factories,{id:$scope.product.factoryId});
                        BestsellersService.createOrder(factory,$rootScope.user).then(function(response){
                        //BestsellersService.createOrder($scope.product.factoryId).then(function (response) {
                            if (response.id) {
                                create.orderId = response.id;
                                create.products = BestsellersService.prepareProducts(create.betsellerId, $scope.product, create.sizes);

                                // Adding items to order
                                for(i in create.products) {
                                    BestsellersService.addOrderProductRow(create.orderId, create.products[i]).then(function(response) {

                                            if(response.id){
                                                create.products.splice(0, 1);
                                            }
                                        }, function(error){
                                            messageCenterService.add("danger","ERROR: "+error,{timeout:3000});
                                        }
                                    );
                                }

                                // send order
                                BestsellersService.sendCreatedOrder(create.orderId).then(function(response) {
                                    if(response.file) {

                                        messageCenterService.add('success', 'Bestseller reordered', {timeout: 3000});

                                        $location.path('/buyer/bestsellers/item/'+create.betsellerId);
                                        delete create;
                                    }
                                });
                            }
                            else {
                                messageCenterService.add('danger', 'Order does not created', {timeout: 3000});
                            }
                        });
                    }
                    else {
                        messageCenterService.add('danger', 'Bestseller does not created', {timeout: 3000});
                    }
                });
            }
            else {
                messageCenterService.add("danger","size or count is empty",{timeout:3000});
            }
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
                //console.log(data);
                BestsellersService.update(data).then(
                    function(response){
                        //console.log(response);
                        if(response.notes==notes) {
                            messageCenterService.add("success","Notes updated",{timeout:3000});
                        }
                        else{
                            messageCenterService.add("danger","Notes is not updated",{timeout:3000});
                        }
                    }
                )
            }
        }

        /**
         * Send bestseller
         *
         * @uses modal fullfill
         */
        $scope.send = function(report, send) {

            if(_.isUndefined(send)) {

                BestsellersService.getOrderReport($scope.bestseller.orderId).then(function(response) {

                    if(response) {

                        $rootScope.report =  {
                            subject : 'Reorder from '+ $rootScope.user.name.capitalizeFirstLetter() + ' : '+$scope.product.factoryArticul +' ('+ $scope.factory.name+' )',
                            to : '',
                            message :   "Good day! Here's order for "+ $scope.product.factoryArticul +"\n"+
                                        "You can find details in the attachment\n"+
                                        "Best regards, "+ $rootScope.user.type.capitalizeFirstLetter() + "\n\n"+
                            'Phone: '+ $rootScope.user.phone+ "\n"+
                            'Email: '+ $rootScope.user.email+ "\n",
                            attachment : response.pdf
                        };
                        $rootScope.modalInstance = $modal.open({
                            templateUrl: "/modules/buyer/views/bestsellers/send.html",
                            controller: 'BestsellerItemController',
                            backdrop:'static',
                            size: 'md'
                        });
                    }
                    else {
                        messageCenterService.add("danger","Could not create order report. Try again",{timeout:3000});
                    }
                });
            }
            else {

                // Form validation
                var check = _.map(report, function(letter) {

                    if(_.isUndefined(letter) === true || _.isEmpty(letter) === true) {
                        return false;
                    }
                    else return letter;
                });

                if(_.includes(check, false) === true) {
                    messageCenterService.add("danger", "All fields are required", {timeout:3000});
                    return false;
                }

                BestsellersService.sendReport(report).then(function(response) {

                    $rootScope.modalInstance.close();

                    if(response) {
                        messageCenterService.add("success","Report successfully sent",{timeout:3000});
                    }
                    else {
                        messageCenterService.add("danger","Sent report failed",{timeout:3000});
                    }
                });
            }
        };

        var to = [];

        /**
         * Assign to fields < TO >
         *
         * @param credentials
         */
        $scope.assign = function(credentials) {


            if(credentials.email) {
                var founded = _.findIndex(to, {name: credentials.name});
            }
            else {
                var collection = true;
            }

            if(collection === true) {

                if(_.isEmpty(to)) {
                    credentials.forEach(function(credential) {
                        to.push({
                            name : credential.name,
                            email: ' <'+credential.email+'>'
                        });
                    });
                }
                else {
                    to = [];

                }
            }
            else {
                if(founded == -1) {

                    to.push({
                        name : credentials.name,
                        email: ' <'+credentials.email+'>'
                    });
                }

                else {
                    _.remove(to, {name: credentials.name })
                }
            }

            // format to string
            $rootScope.report.to = (function() {

                var result = [];
                to.forEach(function(value) {
                    result.push(value.name +' '+value.email);
                });

                return result.join(',');
            })();
        };

        String.prototype.capitalizeFirstLetter = function() {
            return this.charAt(0).toUpperCase() + this.slice(1);
        }
    }]);