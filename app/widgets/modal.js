(function(){
    /**
     *  toolbar widget
     *  @param1:scope.modalTitle
     *  @param2:scope.modalContent
     */
    var app=angular.module("widgets.modal",[]);

    app.directive("widgetModal",function(){
        console.log("Here!");
        return{
            restict:'EA',
            templateUrl:"/app/widgets/modal.wgt.html"
        };
    });

})();