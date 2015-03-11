(function(){

    angular.module("services.collections",[])

        // create config API ROUTES
        .constant('API', (function () {

            return {
                GETFACTORIES : config.API.host+'factory/load',
                GETCOLLECTIONS : config.API.host+'catalogue/load-collections'
            };

        })())

        // create config  Templates
        .constant('TEMPLATE', (function () {

            return {
                NEW    :   "/modules/buyer/views/collection/chooseFactory.html"
            };

        })())

        .factory("CollectionService", ['API', 'TEMPLATE', 'RestFactory', 'messageCenterService', '$modal',
            function(API, TEMPLATE, RestFactory, messageCenterService, $modal) {

            return {

                debug : function() {
                    console.log('Check incapsulated services');
                    console.log(API);
                    console.log(TEMPLATE);
                    console.log(RestFactory);
                    console.log(messageCenterService);
                    console.log($modal);
                },

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
                 * param @path:string,
                 * param @factories:array
                 * return @object
                 */
                 showModal:function(path,factories){
                    console.log(factories);
                    var modal=$modal.open({
                        templateUrl:TEMPLATE[path],
                        controller:"ModalController",
                        resolve:{
                            factories:function(){
                                return factories;
                            }
                        }
                    });
                    return modal;
                 }

            };
        }]);
})();
