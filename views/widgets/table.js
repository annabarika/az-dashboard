(function(){
    /**
     *  table widget
     */
    var app=angular.module("widgtable",[]);


    /**
     * Factory for
     */
    app.factory("tableFactory",["$filter",function($filter){

        var service={};

        service.date_filter=function(value){
            var date;

            date=$filter('date')(value,"dd/MM/yyyy");

            return date;
        };


        return service;
    }]);



    app.directive("widgtable", ["tableFactory",function(tableFactory){

        return{

            restict:'EA',
            templateUrl:"views/widgets/table.wgt.html",
            scope:{
                    datarows:"="
            },

            link:function($scope){

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

                $scope.$watch('datarows',function(newVal,oldVal){

                    // console.log(oldVal,newVal);

                    if(newVal!=undefined){

                        var length= newVal.length,
                            date=/date/i,
                            num;

                        for(var i=0;i<length;i++){

                            angular.forEach( newVal[i], function(value,key){

                                if(date .exec(key)!=null){

                                    newVal[i][key]=tableFactory.date_filter(value);

                                }
                                else{

                                    num = parseInt(value);

                                    if(num){

                                        newVal[i][key]=num;

                                    }
                                }
                            });
                        }

                    }
                });

                $scope.edit=function(obj){
                    console.log(obj);
                };

            }

        }
    }])

})();