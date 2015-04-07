(function(){

    angular.module("services.navigation",[])

        .factory("NavService",[

            "RestFactory",
            "$rootScope",
            "$window",

            function(RestFactory,$rootScope,$window){
                /**
                 *
                 * @type {string}
                 * @private
                 */
                var _menu="/data/navigation.json";

                /**
                 *
                 * @param data
                 * @private
                 */
                function _permissions(data){
                    var array=[],menu=[];

                    var type=JSON.parse(localStorage['user']).type;

                    angular.forEach(data,function(item,i){

                        array.push({
                            "title":item.title,
                            "icon":item.icon,
                            "menu":[]
                        });

                        angular.forEach(item.menu,function(value,key){

                            var length=value.access.length;

                            for(var j= 0; j<length;j++){
                                if(value.access[j]==type){
                                    array[i].menu.push(value);

                                }
                            }
                        });
                    });

                    angular.forEach(array,function(item){
                        if(item.menu.length!=0){
                            menu.push(item);
                        }
                    });

                    //console.log("menu",menu);
                    $rootScope.Navigation = menu;


                }

                return{
                    /**
                     *
                     * @returns {*}
                     */
                    getMenu : function(){

                        RestFactory.request(_menu).then(
                            function(response){
                                _permissions(response);
                            }
                        );
                    },
                    /**
                     *
                     * @param path
                     * @returns {boolean}
                     */
                    checkPath : function(path){

                        angular.forEach($rootScope.Navigation,function(item,i){

                            angular.forEach(item.menu,function(value){

                                if("/"+value.url==path){
                                    console.log(value.url,'==',path);
                                    return true;
                                }
                            })
                        });
                        return false;
                    }
                }
            }
        ]);
})();
