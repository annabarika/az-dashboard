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
        "ngSanitize"
    ])

       /* .run(function (Authentication,Application) {

        Authentication.requestUser().then(

            function(){
                Application.makeReady()
            });
        })*/
        .run(["$rootScope","$route","AuthFactory",function($rootScope,$route,AuthFactory){

            console.log($route);
            AuthFactory.getUser();

        }])

        .config(function ($routeProvider, $locationProvider, $httpProvider){

            $locationProvider.html5Mode(true);

            $routeProvider

                .when("/",
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
                    redirectTo:'/'
                }
            );

            $httpProvider.interceptors.push('AuthInterceptor');
            //console.log($httpProvider.interceptors);
        })

        .controller("MainController",
        function($scope,$rootScope, NavigationModel,AuthFactory,$location,messageCenterService,RestFactory){

            NavigationModel.get().then(function(result){ $scope.Navigation = result.data; });
            /**
             *
             * @param user
             */
            $scope.auth=function(user){
                if(_.isObject(user)){

                    var data={
                        name:user.login,
                        password:user.pass
                    };

                        AuthFactory.runAuth(user).then(

                            function(response){

                                if(_.isArray(response)){

                                    angular.forEach(response, function(item){

                                        if(item.name==data.name && item.password==data.password){

                                            AuthFactory.create(item);


                                            $rootScope.username=data.name;
                                            console.log($scope.username);
                                            $location.path("/index");
                                            return;
                                        }
                                    })
                                }
                            }
                        )
                }
                else{
                    messageCenterService.add('danger', "Invalid username or password", {timeout: 3000});
                }
            };
            /**
             * logout
             */
            $scope.logout=function(){

                AuthFactory.destroy();
                $location.path("/");
            };



            /*$scope.$on("auth-required", function(event, reason) {
                console.log(event,reason);
                $rootScope.authFlag=false;
               // $location.url("/login?redir=" + encodeURIComponent(reason.route.originalPath) );
                $location.path("/login");
            });*/

            /**
             *  logIn
             * @param user
             */
            /*$scope.auth=function(user){

                if(_.isObject(user)){

                    var data={
                        name:user.login,
                        password:user.pass
                    };
                    var url="/testing/mocks/user.json";
                    RestFactory.request(url).then(
                        function(response){

                            if(_.isArray(response)){

                                angular.forEach(response, function(item){

                                    if(item.name==data.name && item.password==data.password){
                                       // console.log(item);
                                        Auth.create(item);
                                        $rootScope.authFlag=true;
                                        //$location.path($location.search().redir);
                                        $location.path("/index");
                                        return;
                                    }
                                })
                            }
                        },function(error){
                            messageCenterService.add('danger', 'error', {timeout: 3000});
                        }
                    )
                }
                else{
                    messageCenterService.add('danger', "Invalid username or password", {timeout: 3000});
                }
            };*/
            /**
             *  logout
             */
            /*$scope.logoff = function() {
                $rootScope.authFlag=false;
                Auth.destroy();
            }*/
        })

        .controller('BsAlertCtrl', ["$rootScope","$scope", function ($rootScope,$scope) {

        }]);

})();

