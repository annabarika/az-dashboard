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
                    redirectTo:'/login'
                }
            );

            $httpProvider.interceptors.push('AuthInterceptor');
            //console.log($httpProvider.interceptors);
        })

        .controller("MainController",
        function($scope,$rootScope, NavigationModel,Auth,$location,messageCenterService,RestFactory){

            NavigationModel.get().then(function(result){ $scope.Navigation = result.data; });

            $scope.$on("auth-required", function(event, reason) {
                $rootScope.authFlag=false;
                $location.url("/login?redir=" + encodeURIComponent(reason.route.originalPath) );

            });
            /**
             *  logIn
             * @param user
             */
            $scope.auth=function(user){

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
            };
            /**
             *  logout
             */
            $scope.logoff = function() {
                $rootScope.authFlag=false;
                Auth.destroy();
            }
        })

        .controller('BsAlertCtrl', ["$rootScope","$scope", function ($rootScope,$scope) {

        }]);

})();

