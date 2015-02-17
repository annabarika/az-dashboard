(function(){
    /**
     *  table widget
     */
    var app=angular.module("widgets.table",[]);


    /**
     * Factory for
     */
    app.factory("tableFactory",["$filter","$rootScope",function($filter,$rootScope){

        var service={};

        service.date_filter=function(value){
            var date;

            date=$filter('date')(value,"dd/MM/yyyy");

            return date;
        };

        service.getRow=function(row){
            $rootScope.row=row;
        };

        service.getMethod=function(method){
            $rootScope.method=method;
        };

        return service;
    }]);



    app.directive("widgetTable", ["tableFactory",function(tableFactory){
        return{

            restict:'EA',
            templateUrl:"/app/widgets/table.wgt.html",
            //require:"",
            scope:{
                datarows:"="
                ,edit:"&"
                ,row:"="
                ,toolbarBattons:"="
                ,buttonAction:"&"
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

                $scope.edit_row=function(row){
                    tableFactory.getRow(row);
                    if($scope.edit) {
                        $scope.edit(row);
                    }
                };

                $scope.buttons=function(row,method){
                    tableFactory.getRow(row);
                    tableFactory.getMethod(method);

                    if($scope.buttonAction){
                        $scope.buttonAction();
                    }
                }
            }

        }
    }])

})();