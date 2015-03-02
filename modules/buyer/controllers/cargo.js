var app = angular.module("modules.buyer.cargo", [

]);

app.controller('CargoController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){

            $scope.$route = $route;
            $scope.$location = $location;
            var length,row,
                data,
                url,
                filter={};
            $scope.data=[];
            $scope.date=[];
            /* Loading factories */
            RestFactory.request(config.API.host + "factory/load")
                .then(function(response){
                    var factory = [];
                    for( var i in response ){
                        factory.push( { id: response[i].factory.id, name: response[i].factory.name } );
                    }
                    $scope.Factory=factory;
                });

            /* Loading statuses */
            RestFactory.request(config.API.host + "status/load")
                .then(function(response){
                    var statusByType = [];
                    for( var i in response ){
                        if( ! statusByType[response[i].type]) statusByType[response[i].type] = [];
                        statusByType[response[i].type].push({ statusId: response[i].statusId, name: response[i].name });
                    }
                    $scope.orderStatus = statusByType['order'];
                    $scope.orderPaymentStatus = statusByType['orderPayment'];
                    console.log($scope.orderPaymentStatus);
                });

            /* Getting cargo */
            $rootScope.documentTitle = "Cargo cart";
            $scope.tableHeader = [
                { name: "document", title: 'Document' },
                { name: "cargoDoc", title: 'Cargo Document' },
                { name: "createDate", title: 'Create date' },
                { name: "status", title: 'Status' },
                { name: "factory", title: 'Factory' }
            ];

             RestFactory.request(config.API.host + "cargo/load")
                 .then(function(response){
                      //console.log(response);
                     if(response){
                         $scope.allCargo=response;
                         length=response.length;
                         for(var i=0;i<length;i++){
                             data={};
                             angular.forEach(response[i],function(item,k){
                                 if(k=='cargo'){
                                     angular.forEach(item,function(value,key){
                                         if(key=='createDate'||key=='document'){
                                             data[key]=value;
                                            // $scope.date.push(item['createDate']);
                                         }
                                         if(key=='status'){

                                             if($scope.orderPaymentStatus){
                                                 data[key]=$scope.orderPaymentStatus[value].name;
                                             }
                                             else{
                                                data[key]=value;
                                             }

                                         }
                                     })
                                 }
                                 if(k=='factory'){
                                     angular.forEach(item,function(value,key){
                                         if(key=='name'){
                                             data[k]=value;
                                         }
                                     })
                                 }
                             });
                             $scope.data.push(data);
                         }
                        // console.log($scope.date);
                         $scope.cargo=$scope.data;
                     }
                 },function(error){
                     console.log(error);
                 });

             /*
             * filters*/
           $scope.$watchCollection('resultData',function(newVal){

                //console.log(newVal);
                for(item in newVal){
                    var arr=[];

                    if($.isEmptyObject(newVal[item])){

                        delete filter[item];
                    }
                    else{
                        angular.forEach(newVal[item],function(value,key){


                            if(value.ticked ===true){
                                //console.log(value);
                                if(value.id){
                                    arr.push(value.id);
                                }
                                else{
                                    arr.push(value.statusId);
                                }
                                filter[item]=arr;
                                //console.log(value[0]);
                            }

                        });
                    }
                }
                //console.log(filter);
                if(!$.isEmptyObject(filter)){

                    url=config.API.host+"cargo/load/";

                    if(filter.orderPayment){

                        url+="paymentStatus/"+filter.orderPayment.join()+"/";
                    }
                    if(filter.factory){

                        url+="factoryId/"+filter.factory.join()+"/";
                    }

                    console.log(url);


                    RestFactory.request(url)
                        .then(
                        function(response){
                            $scope.orders=response;
                        },
                        function(error){
                            console.log(error);
                        });
                }
                else{
                    $scope.orders=$scope.data;
                }
            });



           $scope.edit = function () {
                //console.log($rootScope.row);
                length=$scope.allCargo.length;
                row=undefined;
                for(var i=0;i<length;i++){

                    if(row!=undefined){
                        break;

                    }

                    angular.forEach($scope.allCargo[i],function(value,key){
                        if(key=='cargo'){
                            if(value.createDate==$rootScope.row.createDate&&value.document==$rootScope.row.document){
                                //console.log($scope.allCargo[i]);
                                row=$scope.allCargo[i];
                                $rootScope.cart=row;
                            }
                        }
                    })
                }

                $location.path( '/buyer/cargo/cargo_cart');
           };


            /* bulding new cargo*/
            $scope.addNewCargo=function(){

                var modalInstance =$modal.open({
                    templateUrl: "/modules/buyer/views/cargo/new_cargo.html",
                    controller: 'NewCargoController',
                    backdrop:'static',
                    resolve:{
                        Factory:function(){
                            return $scope.Factory;
                        }
                    }
                });
            };
           /* $scope.$watch('newCargo.factory',function(value){
                console.log(value);
            })*/
        }]);

app.controller('NewCargoController',

        function($scope, $modalInstance, Factory){
            console.log($modalInstance);
            $scope.Factory= Factory;

            $scope.saveFactory=function(obj){
                console.log(obj);
                $modalInstance.close();
            };
            $scope.cancel = function () {
                $modalInstance.dismiss();
            };
        }
);


app.controller('CargoCartController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){

            var length,factory;

            if($rootScope.cart==undefined){
                $location.path("/buyer/cargo");
            }
            else{
                console.log($rootScope.cart);
                $scope.cargo_cart=[];

                angular.forEach($rootScope.cart,function(value,key){

                    if(key=='factory'){
                        factory=value.name;
                    }
                    if(key=='products'){
                        length=value.length;

                        for(var i=0;i<length;i++){

                            $scope.cargo_cart.push({
                                "photo":"/assets/images/avatar/avatar18.jpg",
                                "article":value[i].articul,
                                "size":value[i].size,
                                "count":value[i].count,
                                "factory":factory
                            });
                        }

                    }


                });
               // console.log($scope.cargo_cart);
            }



            /* Getting cargo */
            $rootScope.documentTitle = "Cargo";
            $scope.tableHeader = [
                { name: "photo", title: 'photo' },
                { name: "article", title: 'Article/Name' },
                { name: "size", title: 'Size' },
                { name: "count", title: 'Count' },
                { name: "factory", title: 'Factory' }
            ];







            /*$scope.cargo_cart = [
                {
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "article":"3234555",
                    "size":"M",
                    "count":"2323",
                    "factory":"factory #1",
                    "active":'complete'
                },

                {
                    "photo":"/assets/images/avatar/avatar17.jpg",
                    "article":"8676",
                    "size":"S",
                    "count":"134",
                    "factory":"factory #1",
                    "active":'in_complete'
                },

                {
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "article":"4435",
                    "size":"L",
                    "count":"87875",
                    "factory":"factory #1",
                    "active":'inactive'
                },

                {
                    "photo":"/assets/images/avatar/avatar3.jpg",
                    "article":"35356",
                    "size":"M",
                    "count":"989",
                    "factory":"factory #1",
                    "active":'hold'
                },
                {
                    "photo":"/assets/images/avatar/avatar8.jpg",
                    "article":"995453",
                    "size":"M",
                    "count":"783",
                    "factory":"factory #1",
                    "active":'inactive'
                },
                {
                    "photo":"/assets/images/avatar/avatar1.jpg",
                    "article":"344657",
                    "size":"M",
                    "count":"343",
                    "factory":"factory #1",
                    "active":'inactive'
                },
                {
                    "photo":"/assets/images/avatar/avatar16.jpg",
                    "article":"233567",
                    "size":"M",
                    "count":"23",
                    "factory":"factory #1",
                    "active":'inactive'
                },
                {
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "article":"9799898",
                    "size":"M",
                    "count":"3253",
                    "factory":"factory #1",
                    "active":'process'
                }
            ];*/
            $scope.addNewItems = function(){
                $location.path( '/buyer/cargo/cargo_items');
            };

            $scope.sendShipment = function(){
                modalWindow=$modal.open({
                    templateUrl: "/modules/buyer/views/cargo/send_shipment.html",
                    controller: 'CargoController',
                    backdrop:'static',
                    size:'sm'
                });
            };



        }]);

app.controller('CargoItemsController',

    [
        '$scope',
        '$rootScope',
        "$modal",
        "$location",
        "$route",
        "RestFactory",


        function ($scope, $rootScope, $modal, $location, $route, RestFactory){

            $scope.$route = $route;
            $scope.$location = $location;

           /* var tables=document.getElementsByTagName('table');
            console.log(tables);

            angular.forEach(tables,function(v,k){
                console.log(v,k);
            });*/

            $scope.newSize=function(){
                alert("new size!");
            };

            /* Getting cargo */
            $rootScope.documentTitle = "Cargo cart";
            $scope.tableHeader = [
                { name: "photo", title: 'Photo' },
                { name: "article", title: 'Articul/name' },
                { name: "size_list", title: 'Size' },
                { name: "count_list", title: 'Count' }
            ];

            $scope.addNewProducts=function(){

                var modalInstance =$modal.open({
                    templateUrl: "/modules/buyer/views/cargo/new_product.html",
                    controller: 'NewProductController',
                    backdrop:'static'
                });
            };


            $scope.buttons=[{
                 class:"btn btn-success",
                 value:"add",
                 icon:"fa fa-plus"
            }];
            $scope.buttonAction=function(){
                alert("work");
            };
            $scope.cargo_items = [
                {
                    "article":"995453",
                    "size_list":[
                        { value: 'S' },
                        { value: 'M' },
                        { value: 'L' },
                    ],
                    "count_list":[
                        { value: '231' },
                        { value: '12' },
                        { value: '24' }
                    ],
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "active":'complete'
                },

                {
                    "article":"995453",
                    "size_list":[
                        { value: 'S' }
                    ],
                    "count_list":[
                        { value: '14' }
                    ],
                    "photo":"/assets/images/avatar/avatar8.jpg",
                    "active":'process'
                },

                {
                    "article":"995453",
                    "size_list":[
                        { value: 'M' },
                        { value: 'L' }
                    ],
                    "count_list":[
                        { value: '12' },
                        { value: '24' }
                    ],
                    "photo":'/assets/images/avatar/avatar7.jpg',
                    "active":'inactive'
                },

                {
                    "article":"995453",
                    "size_list":[
                        { value: 'S' },
                        { value: 'L' }
                    ],
                    "count_list":[
                        { value: '2' },
                        { value: '43' }
                    ],
                    "photo":"/assets/images/avatar/avatar15.jpg",
                    "active":'hold'
                },

                {
                    "article":"995453",
                    "size_list":[
                        { value: 'S' },
                        { value: 'M' },
                        { value: 'L' }
                    ],
                    "count_list":[
                        { value: '11' },
                        { value: '6' },
                        { value: '2' }
                    ],
                    "photo":"/assets/images/avatar/avatar18.jpg",
                    "active":'in_complete'
                }
            ];

        }]);

app.controller('NewProductController',function($scope,$modalInstance){


});