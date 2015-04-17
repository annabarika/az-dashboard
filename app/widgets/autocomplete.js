angular.module('widgets.autocomplete', [])

    .filter('tableFilter', function () {

        return function (dataArray, search, properties) {

            if (!dataArray) return;

            if (search==undefined||search=="") {
                return dataArray;
            }

            if(!properties){
                properties=["name"];
            }


            var search=search.toLowerCase();
            //console.log(search);

            var array=[],
                length=dataArray.length,
                value;

            for(var i=0;i<length;i++){

                for(var j=0;j<properties.length;j++){

                    if(typeof dataArray[i][properties[j]]=='string'){

                        value=dataArray[i][properties[j]].toLowerCase();

                        if(value.indexOf(search)!=-1){
                            //array.push(dataArray[i]);
                            if(_.findIndex(array,'id',dataArray[i].id)==-1){
                                array.push(dataArray[i]);
                            }
                        }
                    }
                    else{

                        if(typeof dataArray[i][properties[j]]=='object'){

                            for(var k=0;k<dataArray[i][properties[j]].length;k++){

                                value=dataArray[i][properties[j]][k].toLowerCase();

                                if(value.indexOf(search)!=-1){

                                    if(_.findIndex(array,'id',dataArray[i].id)==-1){
                                        array.push(dataArray[i]);
                                    }
                                }
                            }
                        }
                    }
                }
            }

            if(array.length!=0){
                //console.log("success", array);
                return array;
            }

        }
    })

    .directive("autocomplete",function(){

        function _setStyles(){
            var width = getComputedStyle((document.getElementById("autocomplete"))).width;
            document.getElementsByClassName('autocomplete_box')[0].style.width=width;
        }


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

                //console.log($scope.inputModel);

                if($scope.placeholder==undefined){
                    $scope.placeholder='search';
                }

                var ul=elem[0].children[0].children[1];

                $scope.flag=true;

                $scope.$watch('search',function(val){
                    _setStyles();
                    if(val!=undefined && val!=""){

                        $scope.flag=false;

                    }
                    else{
                        $scope.flag=true;
                    }
                });

                $scope.getRow=function(obj){
                    /*console.log(obj);*/
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

