(function(){

    var app = angular.module('BuyingOffice', ['multi-select', 'ui.calendar', 'angularMoment' ]);

    app.config(function($routeProvider){

        $routeProvider

            .when('/buyingOffice/orders',
            {
                templateUrl:"/app/modules/BuyingOffice/views/orders.html",
                controller:"OrdersController"
            }
        )
            .when('/buyingOffice/bestsellers',
            {
                templateUrl:"/app/modules/BuyingOffice/views/bests.html",
                controller:"BestsController"
            }
        )
            .when("/buyingOffice/cargo",
            {
                templateUrl:"/app/modules/BuyingOffice/views/cargo.html",
                controller:"CargoController"
            }
        )
    });


    /** factory for orders
     * @Param: $http
     * @param:$q
     */

    app.factory("orderService",["$http","$q",
            function($http,$q){

                var service={};

                service.getData=function(url){

                    var deferred = $q.defer();

                    $http.get(url)
                        .success(function (response) {
                            if(response)
                            {
                                deferred.resolve(response);
                            }
                            else
                            {
                                deferred.resolve(response);
                            }

                        })
                        .error(function (error) {
                            deferred.reject(error);
                        });

                    return deferred.promise;
                };




                return service;
            }]
    );
    /**
     * Order controller
     */
    app.controller('OrdersController',

        [
            '$scope',
            "orderService",


            function($scope,orderService){

                /* get orders */
                orderService.getData("/mock/order.json")
                    .then(function(response){

                        $scope.dataOrders=response;

                        $scope.orders=$scope.dataOrders;
                    });
                /*get factories*/
                orderService.getData("/mock/factory.json")
                    .then(function(response){

                        $scope.Factory=response;
                    });
                /*get statuses*/
                orderService.getData("/mock/orderstatus.json")
                    .then(function(response){

                        $scope.Status=response;
                    });

               // $scope.modalContent="Test Content for modal window";
                $scope.modalTitle="Some Title";

                //$scope.Factory = [
                //    { name: "Factory1 (Tiger Nixon)",        ticked: false },
                //    { name: "Factory2 (Garrett Winters)",    ticked: false },
                //    { name: "Factory3 (Garrett Winters)",    ticked: false },
                //    { name: "Factory4 (Airi Satou)",         ticked: false },
                //    { name: "Factory5 (Colleen Hurst)",      ticked: false }
                //];
                //
                $scope.test_list = [
                    { name: "Complete",     ticked: false },
                    { name: "In Complete",  ticked: false },
                    { name: "On Hold",      ticked: false }
                ];
               /* $scope.edit_row= function(){

                    console.log("qweqe",$scope.row);
                  //  angular.element(document.body).append("<widgmodal></widgmodal>");
                };*/

                $scope.$watch("row",function(newVal,oldVal){
                    console.log(newVal,oldVal);
                    if(newVal!=undefined){
                     //   $scope.modalContent=newVal;
                        $scope.modalContent="";
                        $('.modal-body').load("/app/modules/BuyingOffice/views/order_modal.html");
                    }
                });

                $scope.events = [
                    {
                        title: 'My event title', // The title of the event
                        type: 'info', // The type of the event (determines its color). Can be important, warning, info, inverse, success or special
                        starts_at: new Date(2013,5,1,1), // A javascript date object for when the event starts
                        ends_at: new Date(2015,8,26,15), // A javascript date object for when the event ends
                        editable: false, // If calendar-edit-event-html is set and this field is explicitly set to false then dont make it editable
                        deletable: false // If calendar-delete-event-html is set and this field is explicitly set to false then dont make it deleteable
                    }
                ];


                /*get selected items for factory  */

                var filter={};
                $scope.$watch('resultData',function(newVal){
                    var arr=[];

                    angular.forEach( newVal, function( value, key ) {

                        if ( value.ticked === true ) {

                            filter[value.name]=value;

                            orderService.getData("/mock/orderfilter.json?"+value.name)

                                .then(function(response){

                                    for(var i=0; i<response[value.name].length;i++){
                                        arr.push(response[value.name][i]);
                                    }
                                    $scope.orders=arr;
                                });

                        }

                    });
                 /*   console.log(filter);*/

                    try{
                        if(newVal.length==0){

                            $scope.orders=$scope.dataOrders;
                        }
                    }
                    catch(e){

                    }

                });


                /*get selected items for statuses */

                /* $scope.$watch('resultDataStatus',function(newVal){
                 var arr=[];
                 angular.forEach( newVal, function( value, key ) {

                 if ( value.ticked === true ) {

                 orderService.filterData("/mock/orderfilter.json", value.name)

                 .then(function(response){

                 for(var i=0; i<response[value.name].length;i++){
                 arr.push(response[value.name][i]);
                 }
                 $scope.orders=arr;
                 });

                 }
                 });

                 try{
                 if(newVal.length==0){

                 $scope.orders=$scope.dataOrders;
                 }
                 }
                 catch(e){

                 }

                 });*/


            }]);


    app.controller('BestsController',

        [
            '$http',
            '$scope',
            "$rootScope",


            function($http, $scope,$rootScope){

                $scope.test="bestsellers routing is work!";

            }]);


    app.controller('DatepickerCtrl', function($scope, $http) {

        $scope.selectedDate = new Date();
        $scope.selectedDateAsNumber = Date.UTC(1986, 1, 22);
        $scope.fromDate = new Date();
        $scope.untilDate = new Date();
        $scope.getType = function(key) {
            return Object.prototype.toString.call($scope[key]);
        };

        $scope.clearDates = function() {
            $scope.selectedDate = null;
        };

    });

    app.controller('BsAlertCtrl', ['$scope', function ($scope) {
        $scope.alerts = [{
            type: 'danger',
            msg: 'Oh snap! Change a few things up and try submitting again.'
        }, {
            type: 'success',
            msg: 'Well done! You successfully read this important alert message.'
        }, {
            type: 'info',
            msg: 'Heads up! This alert needs your attention, but it\'s not super important.'
        }, {
            type: 'warning',
            msg: 'Warning! Better check yourself, you\'re not looking too good.'
        }];

        $scope.addAlert = function() {
            $scope.alerts.push({
                msg: 'Another alert!'
            });
        };

        $scope.closeAlert = function(index) {
            $scope.alerts.splice(index, 1);
        };
    }]);

    app.controller('fullCalendarCtrl', ['$scope', '$http', '$compile', 'uiCalendarConfig', function ($scope, $http, $compile, uiCalendarConfig) {
        var $calendar = jQuery('[ui-calendar]');
        var date = new Date();
        var d = date.getDate();
        var m = date.getMonth();
        var y = date.getFullYear();

        /* event source that pulls from google.com */
        $scope.eventSource = {
            url: 'http://www.google.com/calendar/feeds/usa__en%40holiday.calendar.google.com/public/basic',
            className: 'gcal-event', // an option!
            currentTimezone: 'America/Chicago' // an option!
        };

        /* event source that contains custom events on the scope */
        $scope.events = [{
            title: 'All Day Event',
            start: '2014-11-01'
        }, {
            title: 'Long Event',
            start: '2014-11-07',
            end: '2014-11-10'
        }, {
            id: 999,
            title: 'Factory 1',
            start: '2014-11-09T16:00:00'
        }, {
            title: 'Conference',
            start: '2014-11-11',
            end: '2014-11-13',
            className: 'fc-event-danger'
        }, {
            title: 'Meeting',
            start: '2014-11-12T10:30:00',
            end: '2014-11-12T12:30:00'
        }, {
            title: 'Lunch',
            start: '2014-11-12T12:00:00',
            className: 'fc-event-danger'
        }, {
            title: 'Meeting',
            start: '2014-11-12T14:30:00',
            className: 'fc-event-warning'
        }, {
            title: 'Factory 2',
            start: '2014-11-12T17:30:00'
        }, {
            title: 'Factory 3',
            start: '2014-11-12T20:00:00',
            className: 'fc-event-success'
        }, {
            title: 'Factory 4',
            start: '2014-11-13T07:00:00',
            className: 'fc-event-success'
        }, {
            title: 'Click for Google',
            url: 'http://google.com/',
            start: '2014-11-28'
        }];

        /* alert on eventClick */
        $scope.alertOnEventClick = function(date, jsEvent, view) {
            $scope.alertMessage = (date.title + ' was clicked ');
        };

        /* alert on Drop */
        $scope.alertOnDrop = function(event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Droped to make dayDelta ' + delta);
        };

        /* alert on Resize */
        $scope.alertOnResize = function(event, delta, revertFunc, jsEvent, ui, view) {
            $scope.alertMessage = ('Event Resized to make dayDelta ' + delta);
        };

        /* add and removes an event source of choice */
        $scope.addRemoveEventSource = function(sources, source) {
            var canAdd = 0;
            angular.forEach(sources, function(value, key) {
                if (sources[key] === source) {
                    sources.splice(key, 1);
                    canAdd = 1;
                }
            });
            if (canAdd === 0) {
                sources.push(source);
            }
        };

        /* add custom event*/
        $scope.addEvent = function() {
            $scope.events.push({
                title: 'Open Sesame',
                start: new Date(y, m, 28),
                end: new Date(y, m, 29),
                className: ['openSesame']
            });
        };

        /* remove event */
        $scope.remove = function(index) {
            $scope.events.splice(index, 1);
        };

        /* Change View */
        $scope.changeView = function(view) {
            $calendar.fullCalendar('changeView', view);
        };

        /* Change month */
        $scope.changeMonth = function(view) {
            $calendar.fullCalendar(view);
        };

        /* Render Popover */
        $scope.eventRender = function(event, element, view) {
            element.attr({
                'popover': event.title,
                'popover-placement': 'top',
                'popover-trigger': 'mouseenter'
            });
            $compile(element)($scope);
        };

        /* config object */
        $scope.options = {
            header: false,
            editable: true,
            eventLimit: true,
            defaultDate: '2014-11-12',
            eventClick: $scope.alertOnEventClick,
            eventDrop: $scope.alertOnDrop,
            eventResize: $scope.alertOnResize,
            eventRender: $scope.eventRender
        };

        /* event sources array*/
        $scope.eventSources = [$scope.events, $scope.eventSource];
    }]);


    app.controller('CargoController',

        [
            '$http',
            '$scope',
            "$rootScope",

            function($http, $scope,$rootScope){

                $scope.test="cargo routing is work!";

            }]);


})();

