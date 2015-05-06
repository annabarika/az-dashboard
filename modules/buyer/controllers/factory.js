"use strict";
(function(){
    var app = angular.module("modules.buyer.factory", []);


    app.factory("FactoryService",
        [
            "RestFactory",
            function(RestFactory){
                return{
                    /**
                     * get current Factory
                     * @param id
                     * @returns {*|T.promise|*|d.promise|promise|qFactory.Deferred.promise|m.ready.promise}
                     */
                    getFactory:function(id){
                        return RestFactory.request(config.API.host+"factory/load/id/"+id);
                    },
                    /**
                     * parse factory
                     * @param item
                     * @returns {{name: *, phone: *, email: *, address: string, productionDays: (*|productionDays), files: (factoryFiles|*)}}
                     */
                    parse:function(item){
                        for (var key in item){
                            var obj={
                                name            :   item[key].factory.name,
                                phone           :   JSON.parse(item[key].factory.phone),
                                email           :   JSON.parse(item[key].factory.email),
                                address         :   (item[key].factoryAddress.country)?item[key].factoryAddress.country+","+item[key].factoryAddress.city+","+item[key].factoryAddress.address:"",
                                productionDays  :   item[key].factory.productionDays,
                                files           :   item[key].factoryFiles

                            };
                        }

                        return obj;
                    }
                }
    }]);

    /**
     * Factory Cart controller
     */
    app.controller('FactoryController',[
        "$scope",
        "$route",
        "FactoryService",
        function($scope,$route,FactoryService){
            /**
             * set Title
             * @type {string}
             */
            $scope.$parent.documentTitle='Factory Cart #'+$route.current.params.id;
            /**
             *
             * @type {params.id|*}
             */
            $scope.factoryId=$route.current.params.id;
            /**
             * get cart
             */
            FactoryService.getFactory($scope.factoryId).then(
                function(response){
                    $scope.current=FactoryService.parse(response);
                    console.log($scope.current);
                }
            );
        }
    ]);
})();