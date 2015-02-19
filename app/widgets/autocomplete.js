angular.module('widgets.autocomplete', [])

    .directive("autocomplete",function(){
        return{
            restrict:"EA",
            scope:{
                inputModel:"=",
                outputModel:"="
            },
            templateUrl:"/app/widgets/autocomplete.wgt.html",
            link:function($scope,elem, attr){

                var ul=elem[0].children[0].children[1];

                $scope.flag=true;


                $scope.$watch('search',function(val){
                    if(val){
                        $scope.flag=false;
                    }
                    else{
                        $scope.flag=true;
                    }
                });

                $scope.getRow=function(obj){
                    $scope.search=obj.name;
                    $scope.outputModel=obj.name;
                };

                $scope.$watch('outputModel',function(newVal){

                    if(newVal){
                        $scope.flag=true;
                    }
                })
            }
        }
    });

