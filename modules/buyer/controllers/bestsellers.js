var app = angular.module("modules.buyer.bestsellers", ['mwl.calendar']);

/**
 * Bestseller representation
 */
app.controller('BestsellersController', ['$scope', '$rootScope', "$modal","BestsellersService", function ($scope, $rootScope, $modal, BestsellersService) {

    // Startup setup
    var currentYear = moment().year();
    var currentMonth = moment().month();
    $rootScope.documentTitle = "Bestsellers";

    $scope.events = [
        {
            title: 'My event title', // The title of the event
            type: 'info', // The type of the event (determines its color). Can be important, warning, info, inverse, success or special
            starts_at: new Date(2013,5,1,1), // A javascript date object for when the event starts
            ends_at: new Date(2014,8,26,15), // A javascript date object for when the event ends
            editable: false, // If calendar-edit-event-html is set and this field is explicitly set to false then dont make it editable
            deletable: false // If calendar-delete-event-html is set and this field is explicitly set to false then dont make it deleteable
        }
    ];
    $scope.calendarView = "year";
    $scope.calendarDay = new Date();

    function showModal(action, event) {
        $modal.open({
            templateUrl: '/modules/buyer/views/bestsellers/test.html',
            controller: function($scope, $modalInstance) {
                $scope.$modalInstance = $modalInstance;
                $scope.action = action;
                $scope.event = event;

                $scope.close=function(){
                    $modalInstance.close();
                };
                $scope.cancel=function(){
                    $modalInstance.dismiss();
                }
            }
        });
    }

    $scope.monthClicked=function(event){
        console.log(event);
    };

    $scope.eventClicked = function(event) {
        showModal('Clicked', event);
    };

    $scope.eventEdited = function(event) {
        showModal('Edited', event);
    };

    $scope.eventDeleted = function(event) {
        $scope.calendarView='month';
        //showModal('Deleted', event);
    };

    $scope.setCalendarToToday = function() {
        $scope.calendarDay = new Date();
    };

    $scope.toggle = function($event, field, event) {
        $event.preventDefault();
        $event.stopPropagation();

        event[field] = !event[field];
    };

   /* BestsellersService.getCalendarData().then(function(response){
            console.log(response);
        }
    )*/



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
