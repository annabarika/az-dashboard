(function(){

    angular.module("services.authentication",[])

        /* .constant("AUTH_PATH",{

            "PATH":"/testing/mocks/user.json"
        })*/
        .factory('AuthInterceptor', ['$q', '$window', '$rootScope',
            function ($q, $window, $rootScope) {
                var authHeaderName = 'x-access-token';
                return {

                    /**
                     * For every single http request, we add access token to the header
                     * so that, the server-side read this token to authorize the access to resource
                     */
                    request: function (config) {
                        config.headers = config.headers || {};
                        if($window.sessionStorage.token) {
                            config.headers[authHeaderName] = $window.sessionStorage.token;
                        }
                        return config;
                    },

                    responseError: function(rejection) {
                        if (rejection.status === 401) {
                            $rootScope.$broadcast('auth-required', {
                                reason: 'http-response-401',
                                rejection: rejection
                            });
                        }
                        return $q.reject(rejection);
                    }
                };
            }
        ])

        .factory("AuthFactory",["$rootScope","$location","RestFactory","$window",function($rootScope,$location,RestFactory,$window){

            var _path="/testing/mocks/user.json";

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
                            $window.sessionStorage['auth-'+key] = data[key];
                        }
                    }
                    $window.sessionStorage['auth-type'] = JSON.stringify(type);
                    $rootScope.authFlag=true;
                },
                /**
                 * logout
                 */
                destroy : function(){

                    for (var key in $window.sessionStorage) {
                        if (key.match(/^auth-/)) {
                            delete $window.sessionStorage[key];
                        }
                    }
                    $rootScope.authFlag=false;
                },

                getUser : function(){

                }
            }
        }])
})();
