(function(){

    angular.module('Azimuth', [
        "ngRoute",
        "directives",
        "models.navigation",
        "multi-select",
        "widgets",
        "ui.bootstrap",
        "services",
        "modules.buyer",
        'MessageCenterModule',
        "ang-drag-drop",
        "ngSanitize",
        "flow"//library for uploading files
    ])

        .run(["$rootScope","$route","AuthFactory","$location","NavService",function($rootScope,$route,AuthFactory,$location,NavService){

            $rootScope.username=AuthFactory.getUser('name');

            if(!_.isUndefined($rootScope.username)){
                $rootScope.authFlag=true;
                NavService.getMenu();

            }
            else{
                $location.path("/login");
            }

        }])

        .config(function ($routeProvider, $locationProvider, $httpProvider){

            $locationProvider.html5Mode(true);

            $routeProvider

                .when("/login",
                {
                    templateUrl: "/app/views/login.html",
                    controller: "MainController"
                }
            )
                .when("/index",
                {
                    templateUrl: "/app/views/startpage.html",
                    controller:"MainController"
                }
            )

                .otherwise(
                {
                    redirectTo:'/index'
                }
            );

            $httpProvider.interceptors.push('AuthInterceptor');
            //console.log($httpProvider.interceptors);
        })

        .controller("MainController",
        function($scope,$rootScope,AuthFactory,$location,messageCenterService,RestFactory,$route,NavService){
            /**
             *
             * @param user
             * @param event
             */
            $scope.auth=function(user,event){

                if(!_.isUndefined(event)){

                    if(event.keyCode!=13){

                        return;
                    }

                }
                if(_.isObject(user)){

                    var data={
                        name:user.login,
                        password:user.pass
                    };
                    _auth(data);
                }
                else{
                    messageCenterService.add('danger', "Invalid username or password", {timeout: 3000});
                }
            };
            /**
             *
             * @param data
             * @private
             */
            function _auth(data){

                AuthFactory.runAuth(data).then(

                    function(response){

                        if(_.isArray(response)){

                            angular.forEach(response, function(item){

                                if(item.name==data.name && item.password==data.password){

                                    AuthFactory.create(item);

                                    NavService.getMenu();

                                    if(_.isUndefined($scope.currentPath)){

                                        $location.path("/index");
                                    }
                                    else{
                                        if(NavService.checkPath($scope.currentPath)){


                                            $location.path($scope.currentPath);
                                        }
                                        else{

                                            console.log("check path", NavService.checkPath($scope.currentPath));

                                            $location.path("/index");
                                        }
                                    }
                                    return;
                                }
                            })
                        }
                        else{
                            messageCenterService.add('danger', "Error: "+response, {timeout: 3000});
                        }
                    },function(error){
                        messageCenterService.add('danger', "Error: "+error, {timeout: 3000});
                    }
                )
            }

            /**
             * logout
             */
            $scope.logout=function(){
                delete $rootScope.Navigation;
                $scope.currentPath=$route.current.originalPath;
                console.log("current Path",$scope.currentPath);
                //Auth
                AuthFactory.destroy();
                $location.path("/");
            };
            /**
             *
             * @type {string}
             */
            $rootScope.documentTitle="Welcome to Azimuth";

        })

        .controller('BsAlertCtrl', ["$rootScope","$scope", function ($rootScope,$scope) {

        }]);

})();

