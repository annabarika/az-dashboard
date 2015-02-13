(function(){
    /**
     *  toolbar widget
     */
    var app=angular.module("widgmodal",[]);

    app.directive("widgmodal",function(){

        return{

            restict:'EA',
            templateUrl:"views/widgets/modal.wgt.html",
            scope:true
        };
    });

})();

