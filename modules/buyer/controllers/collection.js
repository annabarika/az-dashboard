var app = angular.module("modules.buyer.collection", [

]);

app.controller('NewCollectionController', ['$scope','$rootScope','$location','CollectionService',
    function ($scope, $rootScope, $location, CollectionService) {

        $scope.factories=CollectionService.getFactories();

        $scope.tableHeader=[
            { name: "id", title: 'ID' },
            { name: "name", title: 'Factory' },
            {name:"collection",title:"Collection"},
            { name: "createDate", title: 'Create date' }

        ];

        /*
        * Add new collection*/
         $scope.newCollection=function(){
                var modalInstance=CollectionService.showModal('NEW',$scope.factories);

                modalInstance.result.then(function(factory){

                    $rootScope.factoryId=factory.id;

                    CollectionService.getFactoryCollections(factory.id);

                    var modalInstance=CollectionService.showModal("CHOOSE");

                    modalInstance.result.then(function(collection){

                        $rootScope.collection=collection;
                        $location.path("buyer/collection/upload");
                    })
                    });


         };

        $scope.$watch('collection',function(value){
           if(value){
               console.log(value);
           }
        });

        $scope.$watch("photo",function(value){
            $rootScope.photo=value;
        });

    }]
);

app.controller("ModalController",function($scope,$rootScope,data,CollectionService,$modalInstance){
    $scope.data=data;
    $scope.cancel=function(){
        $modalInstance.dismiss();
    };
    $scope.chooseFactory=function(factory){
        $modalInstance.close(factory);
    };
    $scope.chooseCollection=function(collection){
        $modalInstance.close(collection);
    };
    $scope.createNew=function(){
        console.log("newCollection",$rootScope.factoryId);
        CollectionService.createCollection($rootScope.factoryId);

    }

});

/**
 * Add new products, create collection controllers
 */

app.controller("UploadController",['$scope','$rootScope','$location','CollectionService',"$modal",
    function ($scope, $rootScope, $location, CollectionService,$modal) {
        var fileinput;

        if($rootScope.collection==undefined){
            $location.path("/buyer/collection");
        }

        $scope.collectionTemplates = [
            "modules/buyer/views/collection/upload.html",
            "modules/buyer/views/collection/prepare.html",
            "modules/buyer/views/collection/finish.html"
        ];

        $scope.step=0;

        $scope.stepIcons=document.getElementsByClassName('steps');

        $scope.$watch('step',function(newVal){
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
            fileinput = document.getElementById("fileUpload");
            fileinput.click();

        };

        //$scope.count=321;

        $scope.back=function(){

            if($scope.step==2){
                console.log("finish",$scope.step);
                $scope.step=0;
                for(i=0;i<$scope.stepIcons.length;i++){
                    $scope.stepIcons[i].classList.remove('active');
                }
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

            if($rootScope.photo==undefined){

                $rootScope.message="You are forgot upload photo";
                $modal.open({
                    templateUrl: '/app/views/error.html',
                    controller: 'BsAlertCtrl',
                    size: 'lg'
                });
                return;
            }

            if($scope.step==0){

                CollectionService.uploadFiles();
            }

            if($scope.step==1){
                console.log("this",$scope.step);
            }

            if($scope.step==2){
                console.log("this",$scope.step);
            }
        };


        /*$scope.nextStep=function(){
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

        }*/

    }]);