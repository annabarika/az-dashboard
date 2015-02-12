(function(){
    /**
     *  toolbar widget
     *  @param1:scope.modalTitle
     *  @param2:scope.modalContent
     */
    var app=angular.module("widgmodal",[]);

    app.directive("widgmodal",function(){

        return{

            restict:'EA',
            templateUrl:"views/widgets/modal.wgt.html"
        };
    });

})();