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

            $scope.collectionTemplates = {
                1: "modules/buyer/views/collection/upload.html",
                2: "modules/buyer/views/collection/prepare.html",
                3: "modules/buyer/views/collection/finish.html"
            };

            $scope.step=1;

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

                if($scope.step==3){
                    $scope.step=1;
                }

                else{
                    if($scope.step>1) {
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