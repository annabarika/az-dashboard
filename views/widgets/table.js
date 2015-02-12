(function(){
    /**
     *  table widget
     */
    var app=angular.module("widgtable",[]);

    app.directive("widgtable",["$filter",function($filter){

        return{

            restict:'EA',
            templateUrl:"views/widgets/table.wgt.html",
            scope:{
                    datarows:"="
            },

            link:function($scope,$filter){

                $scope.column_sorter=function(key){
                    console.log(key);
                    $scope.sortField=key;
                    $scope.reverse=!$scope.reverse;
                };

                $scope.row_info=function(row){
                   // console.log("order_info",row);
                };

                $scope.delete_row=function(row){
                    //console.log("order_delete",row);
                };

                /*$scope.$watch('datarows',function(newVal){

                    if(newVal!=undefined){

                        var length=newVal.length,
                            date=/date/i;

                        for(var i=0;i<length;i++){

                            angular.forEach(newVal[i], function(value,key){

                                if(date.exec(key)!=null){
                                    //console.log(key,value);

                                    //value=$filter('date')(value,'medium');
                                   // item.date = $filter('date')(item.date, "dd/MM/yyyy");
                                }
                            })

                        }

                    }
                })*/



            }

        }
    }])

})();