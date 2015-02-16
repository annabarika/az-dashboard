(function(){
    /**
     *  toolbar widget
     *  @param1:scope.modalTitle
     *  @param2:scope.modalContent
     */
    var app=angular.module("widgets.modal",[]);

    app.directive("widget-modal",function(){

        return{

            restict:'EA',
            templateUrl:"/app/views/widgets/modal.wgt.html"
        };
    });

})();