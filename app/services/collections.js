(function(){

    angular.module("services.collections",[])

        // create config API ROUTES
        .constant('API', (function () {

            return {
                GETFACTORIES : config.API.host+'factory/load',
                GETCOLLECTIONS : config.API.host+'catalogue/load-collections',
                FACTORYCOLLECTIONS:config.API.host+"catalogue-collection/load/factoryId/",
                CREATECOLLECTION:config.API.host+"catalogue-collection/create"
            };

        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {
                NEW    :   "/modules/buyer/views/collection/chooseFactory.html",
                CHOOSE :   "/modules/buyer/views/collection/chooseCollection.html"
            };

        })())

        .factory("CollectionService", ['API', 'TEMPLATE', 'RestFactory', 'messageCenterService', '$modal',"$rootScope",
            function(API, TEMPLATE, RestFactory, messageCenterService, $modal,$rootScope) {

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
