(function(){
    /**
     *  table widget
     */
    var app=angular.module("widgtable",[]);

    app.directive("widgtable",function(){

        return{

            restict:'EA',
            templateUrl:"views/widgets/table.wgt.html",
            scope:{
                    datarows:"="
            },

            link:function(scope){



                scope.$watch("datarows", function(newVal){

                   // console.log("rows",newVal);

                    /*if(newVal!=undefined){

                        scope.keys=[];
                        scope.data=[];

                        angular.forEach(scope.datarows[0],function(value,key){

                            if(key == "$$hashKey"){
                                return;
                            }

                            this.push({name:key});

                        },scope.keys);

                    }*/
                });
            }

        }
    })

})();