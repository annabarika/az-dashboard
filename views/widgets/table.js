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

                scope.$watch("datarows", function(newVal,oldVal){

                    console.log("rows",oldVal,newVal);

                    if(newVal!=undefined){

                        scope.keys=[];

                        angular.forEach(scope.datarows[0],function(value,key){

                            if(key == "$$hashKey"){
                                return;
                            }

                            this.push({name:key});

                        },scope.keys);

                        console.log(scope.keys);
                    }
                });

            }

        }
    })

})();