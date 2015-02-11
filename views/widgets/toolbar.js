(function(){
    /**
     *  toolbar widget
     */
    var app=angular.module("widgtoolbar",[]);

    app.directive("widgtoolbar",function(){

        return{

            restict:'EA',
            templateUrl:"views/widgets/toolbar.wgt.html"


        };

    });

})();