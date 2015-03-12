(function(){

    angular.module("services.collections",[])

        // create config API ROUTES
        .constant('API', (function () {

            return {
                GETFACTORIES : config.API.host+'factory/load',
                GETCOLLECTIONS : config.API.host+'catalogue/load-collections',
                FACTORYCOLLECTIONS:config.API.host+"catalogue-collection/load/factoryId/",
                CREATECOLLECTION:config.API.host+"catalogue-collection/create",
                LOADFILES:config.API.host+'catalogue/loadfiles'
            };

        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {
                NEW    :   "/modules/buyer/views/collection/chooseFactory.html",
                CHOOSE :   "/modules/buyer/views/collection/chooseCollection.html"
            };

        })())

        .factory("CollectionService", ['API', 'TEMPLATE', 'RestFactory', 'messageCenterService', '$modal',"$rootScope","$http",
            function(API, TEMPLATE, RestFactory, messageCenterService, $modal,$rootScope,$http) {

            return {

                /**
                 *
                 * @returns {Array}
                 */

                getFactories:function(){

                    var factories=[];
                    RestFactory.request(API.GETFACTORIES).then(function(response){

                        angular.forEach(response,function(value,key){
                            factories.push(value.factory);
                        });
                    });
                    return factories;
                },


                /**
                 *  $param id:string,
                 *  return : array[]
                 */
                 getFactoryCollections:function(id){
                    var url=API.FACTORYCOLLECTIONS+id;

                    RestFactory.request(url).then(function(response){

                           $rootScope.factoryCollections=response;

                        }
                    );

                 },
                createCollection:function(factoryId){
                    var data={
                        factoryId:factoryId,
                        name:"test"
                    };

                    RestFactory.request(API.CREATECOLLECTION,"POST",data).then(function(response){

                            //$rootScope.factoryCollections=response;
                            console.log(response);
                            if(response){
                                $rootScope.collection=response;
                            }

                        }
                    );
                },
                uploadFiles:function(){
                    //console.log("uploads",$rootScope.photo);

                    var fd=new FormData();
                    console.log($rootScope.photo);
                    angular.forEach($rootScope.photo,function(file){
                        fd.append('file[]',file);
                        console.log('file',file);
                    });
                    console.log(fd);
                    /*RestFactory.request(API.LOADFILES,"POST",fd).then(
                        function(response){
                            console.log(response);
                        }
                    );*/
                    $http.post(API.LOADFILES,fd,
                        {
                            transformRequest: angular.identity,
                            headers: {'Content-Type': undefined}
                        })
                        .success(function(data){
                            console.log(data);
                        });

                },
                /**
                 * param @path:string,
                 * param @factories:array
                 * return @object
                 */
                showModal:function(path,data){
                   // console.log("data",data);
                    var modal=$modal.open({
                        templateUrl:TEMPLATE[path],
                        controller:"ModalController",
                        resolve:{
                            data:function(){
                                return data;
                            }
                        }
                    });
                    return modal;
                }
            };
        }]);
})();
