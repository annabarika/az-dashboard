angular.module('widgets.autocomplete', [])

    .filter('tableFilter', function () {

        return function (dataArray, search, properties) {
            //console.log(dataArray.length);
            if (!dataArray) return;

            if (search==undefined||search=="") {
                return dataArray;
            }
            var search=search.toLowerCase();
            console.log(search);

            var array=[],
                length=dataArray.length,
                value;

            for(var i=0;i<length;i++){

                for(var j=0;j<properties.length;j++){

                    /*if(dataArray[i][properties[j]].toLowerCase()==term){

                    }*/
                    //console.log(dataArray[i][properties[j]]);
                   //
                    if(typeof dataArray[i][properties[j]]=='string'){

                        value=dataArray[i][properties[j]].toLowerCase();

                        if(value.indexOf(search)!=-1){
                            array.push(dataArray[i]);
                        }
                    }
                    else{

                        if(typeof dataArray[i][properties[j]]=='array'){

                            for(var k=0;k<dataArray[i][properties[j]].length;k++){

                                value=dataArray[i][properties[j]][k].toLowerCase();

                                if(value.indexOf(search)!=-1){
                                    array.push(dataArray[i]);
                                }
                            }
                        }
                    }
                }
            }
            console.log("success", array);
            return array;
        }
    })




    .directive("autocomplete",function(){
        return{
            restrict:"EA",
            scope:{
                inputModel:"=",
                outputModel:"=",
                column:"=",
                imagepath:"=",
                placeholder:"@"
                ,filterProperty:'='
            },
            templateUrl:"/app/widgets/autocomplete.wgt.html",
            link:function($scope,elem, attr){

                if($scope.placeholder==undefined){
                    $scope.placeholder='search';
                }

                var ul=elem[0].children[0].children[1];

                $scope.flag=true;

                $scope.$watch('search',function(val){

                    if(val!=undefined && val!=""){

                        $scope.flag=false;

                    }
                    else{
                        $scope.flag=true;
                    }
                });

                $scope.$watch('filters',function(val){

                    if(val!=undefined && val!=""){
                        /*if($scope.search.name==""||$scope.search.phone==""){
                         $scope.flag=true;
                         console.log($scope.flag);
                         }*/
                        $scope.nameFilter=val;
                        $scope.phoneFilter=val;


                        //console.log( $scope.phoneFilter,$scope.nameFilter);
                        //console.log(val);
                        $scope.flag=false;

                    }
                    else{
                        $scope.flag=true;
                    }
                });

                $scope.getRow=function(obj){
                    console.log(obj);
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

