var app = angular.module("modules.buyer.collection", [

]);

app.controller('NewCollectionController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){
            var fileinput;

            $scope.collectionTemplates = [
                 "modules/buyer/views/collection/upload.html",
                 "modules/buyer/views/collection/prepare.html",
                 "modules/buyer/views/collection/finish.html"
            ];

            $scope.step=0;

            $scope.stepIcons=document.getElementsByClassName('steps');

            $scope.$watch('step',function(newVal,oldVal){
                console.log(newVal,oldVal);
               // $scope.stepIcons[oldVal].classList.remove('active');
                $scope.stepIcons[newVal].classList.add('active');
            });






            /* Getting collection */
            $rootScope.documentTitle = "Collection";
            /*$('#sort1, #sort2, #sort3, #sort4').sortable({
                connectWith: ".sort",
                opacity: 0.5,
                dropOnEmpty: true
            }).disableSelection();*/

            $scope.upload=function(){
                //console.log('test');
                fileinput = document.getElementById("fileUpload");
                fileinput.click();

            };

            $scope.count=321;
            /*$scope.getFiles=function(){
                console.log(fileinput.value);
                $scope.newCollection=fileinput.value;
                $scope.$apply();

            };*/

            $scope.$watch("photo",function(value){
                console.log(value);
                $rootScope.collection=value;
            });

            $scope.back=function(){

                if($scope.step==2){
                    console.log("finish",$scope.step);
                    $scope.step=0;
                    $scope.stepIcons[oldVal].classList.remove('active');
                }

                else{
                    if($scope.step>0) {
                        console.log($scope.step);
                        $scope.step--;
                    }
                    else{
                        $location.path('/');
                    }
                }
            };

            $scope.nextStep=function(){
                if( $rootScope.collection){
                    console.log($rootScope.collection);
                    $scope.step++;
                }
                else{
                    $rootScope.message="You are forgot upload photo";
                        $modal.open({
                            templateUrl: '/app/views/error.html',
                            controller: 'BsAlertCtrl',
                            size: 'lg'
                        });

                }

            }

        }]);