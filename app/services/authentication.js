(function(){

    angular.module("services.authentication",[])

        /* .constant("AUTH_PATH",{

            "PATH":"/testing/mocks/user.json"
        })*/
        .factory('AuthInterceptor', ['$q', '$window', '$rootScope',
            function ($q, $window, $rootScope) {
                var authHeaderName = 'x-access-token';
                return {
                    request: function (config) {
                        config.headers = config.headers || {};
                        if($window.localStorage.token) {
                            config.headers[authHeaderName] = $window.localStorage.token;
                        }
                        return config;
                    }
                    /*,responseError: function(rejection) {
                        if (rejection.status === 401) {
                            $rootScope.$broadcast('auth-required', {
                                reason: 'http-response-401',
                                rejection: rejection
                            });
                        }
                        return $q.reject(rejection);
                    }*/
                };
            }
        ])

        .factory("AuthFactory",["$rootScope","$location","RestFactory","$window",function($rootScope,$location,RestFactory,$window){

            var _path="/testing/mocks/user2.json";

            return{
                /**
                 *
                 * @param user
                 * @returns {*}
                 */
                runAuth : function(user){

                    /*var data={
                        name:user.login,
                        password:user.pass
                    };

                    return RestFactory.request(_path,"POST",data)*/

                    return RestFactory.request(_path);
                },
                /**
                 *
                 * @param data
                 */
                create : function(data) {
                    var type = data.type || ['developer'];
                    for (var key in data) {
                        if (typeof data[key] === "string") {
                            $window.localStorage['auth-'+key] = data[key];
                        }
                    }
                    $window.localStorage['auth-type'] = JSON.stringify(type);
                    $rootScope.authFlag=true;
                    $rootScope.username=data.name;
                    $rootScope.user = data;
                },
                /**
                 * logout
                 */
                destroy : function(){

                    for (var key in $window.localStorage) {
                        if (key.match(/^auth-/)) {
                            delete $window.localStorage[key];
                        }
                    }
                    $rootScope.authFlag=false;
                    delete $rootScope.username;
                },
                /**
                 *
                 * @param key
                 * @returns {*}
                 */
                getUser : function(key){

                    return $window.localStorage["auth-" + key];
                }
            }
        }])
})();
