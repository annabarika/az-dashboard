angular.module('widgets.autocomplete', [])

    .filter('tableFilter', function ($rootScope) {

        return function (dataArray, search, properties) {
            $rootScope.filteredData=[];
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
               /* console.log("success", array);*/
                $rootScope.filteredData=array;
                return array;
            }
        }
    })

    .directive("autocomplete",function($rootScope){
        /**
         * set style width for 'autocomplete_box'
         * @private
         */
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
                /**
                 * setStyles for table
                 */
                _setStyles();
                /**
                 * placeholder
                 */
                if($scope.placeholder==undefined){
                    $scope.placeholder='search';
                }
                /**
                 * flag for table
                 * @type {boolean}
                 */
                $scope.flag=true;
                /**
                 * show table,and get table row
                 * @param event
                 */
                $scope.showTable=function(event){
                    event.stopPropagation();
                    if(event.keyCode==13){
                        /*console.log($rootScope.filteredData);*/
                        if($rootScope.filteredData.length>=1 && $scope.search!=""){
                            $scope.outputModel=$rootScope.filteredData[0];
                           /* console.log($scope.outputModel);*/
                            $scope.search=$scope.outputModel.name;
                            $scope.flag=true;

                        }
                        else{
                            $scope.search="";
                            $scope.outputModel="";
                            $scope.flag=true;
                        }
                    }
                    else{
                        if($scope.search!=undefined && $scope.search!="" && $rootScope.filteredData.length>0){
                            $scope.flag=false;
                        }
                        else{
                            $scope.flag=true;
                            $scope.outputModel="";
                        }
                    }
                };
                /**
                 * get table row
                 * @param obj
                 */
                $scope.getRow=function(obj){
                   /* console.log(obj);*/
                    if(obj){
                        $scope.search = obj.name||obj.id;
                        $scope.outputModel = obj;
                    }
                    else{
                        $scope.search="";
                        $scope.outputModel="";
                    }
                    $scope.flag=true;
                };
                /**
                 * clear the model if the search input is empty
                 */
                $scope.$watch('search',function(val){
                    if(val==""){
                        $scope.outputModel="";
                    }
                });
/*
                $scope.$watch(
                    function() {
                        return $rootScope.filteredData;
                        },
                    function(val) {
                        if(val){
                            if(val.length==0){
                                console.log(val.length);
                                $scope.flag=true;
                            }
                        }

                    }, true);*/
            }
        }
    });

