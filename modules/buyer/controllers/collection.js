var app = angular.module("modules.buyer.collection", [

]);

app.controller('NewCollectionController', ['$scope','$rootScope','$location','CollectionService', "RestFactory",
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
                        $scope.selectedFactory=factory;
                        console.log("selected",$scope.selectedFactory.id);


                    });
         };

    }]
);

app.controller("ModalController",function($scope,$rootScope,$modalInstance){

    $scope.cancel=function(){
        $modalInstance.dismiss();
    };
    $scope.chooseFactory=function(factory){
        $modalInstance.close(factory);
    }
});