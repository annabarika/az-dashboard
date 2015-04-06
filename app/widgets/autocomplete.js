angular.module('widgets.autocomplete', [])

    .directive("autocomplete",function(){
        return{
            restrict:"EA",
            scope:{
                inputModel:"=",
                outputModel:"=",
                column:"=",
                imagepath:"="
            },
            templateUrl:"/app/widgets/autocomplete.wgt.html",
            link:function($scope,elem, attr){

                console.log($scope.imagepath);
                var ul=elem[0].children[0].children[1];

                $scope.flag=true;


                $scope.$watch('search',function(val){
                    if(val){

                        $scope.flag=false;
                        //console.log($scope.flag);
                    }
                    else{
                        $scope.flag=true;
                    }
                });

                $scope.getRow=function(obj){
                    $scope.search = obj.name||obj.id;
                    $scope.outputModel = obj;
                };

                $scope.$watch('outputModel',function(newVal){

                    if(newVal){
                        $scope.flag=true;
                    }
                })
            }
        }
    });

