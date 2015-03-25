angular.module('angularjsAuth', [])

 /**
  * For every single http request, we set auth. header so the server reads it 
  * This module does not register this interceptor, thus
  * You need to register as follows
  * ```
  * app.config(function($httpProvider) {
  *   $httpProvider.interceptors.push('AuthInterceptor');
  * });
  * ```
  * For every single http response with 401 error
  * it broadcase message 'auth-required' with 'http-response-401' param
  * Users can use this to redirect to login page or to show a login block
  * ```
  * $scope.on('auth-required', function(reason) {
  *   if (reason == 'http-response-401') {
  *     $location.url("/login?redir=" + encodeURIComponent($location.url()) );
  *   }
  * });
  * ```
  */
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

 /**
  * Provides Auth. related functions
  */
.factory('Auth', ['$route', '$window', '$rootScope', 
  function($route, $window, $rootScope) {
    
    /**
     * get all auth. values from window session storage
     */
    this.get = function(key) {
      var authKey = "auth-" + key;
      return $window.sessionStorage[authKey];
    }
    
    this.isLoggedIn = function() {
      for (var key in $window.sessionStorage) {
       if (key.match(/^auth-/)){
        return true;
       }
      }
      return false;
    }
    
    /**
     * Returns if the current user has the given role
     */
    this.permittedTo = function(role)  {
      var userRoles = JSON.parse($window.sessionStorage['auth-roles'] || '[]');
      return userRoles.indexOf(role) !== -1
    };
    
    /**
     * save auth. data to session storage
     */
    this.create = function(data) {
      var roles = data.roles || ['admin']; // default admin roles
      for (var key in data) {
        if (typeof data[key] === "string") {
          $window.sessionStorage['auth-'+key] = data[key];
        }
      }
      $window.sessionStorage['auth-roles'] = JSON.stringify(roles);
    };
  
    /**
     * delete username and roles from session storage
     */
    this.destroy = function() {
      for (var key in $window.sessionStorage) {
        if (key.match(/^auth-/)) {
          delete $window.sessionStorage[key];
        }
      }
    };
  
    return this;
  }
])

/**
 * listens to rootScope "$routeChangeSuccess" 
 * and broadcast 'auth-required' with params 'route' when a role is required
 * Users can use this to redirect to login page or show login block as follows
 * ``` 
 * $scope.on('auth-required', function(reason) {
 *   if (reason == 'route') {
 *     $location.url("/login?redir=" + encodeURIComponent($location.url()) );
 *   }
 * });
 * ```
 */
.run(['$rootScope', '$route', 'Auth', 
  function($rootScope, $route, Auth) {
    $rootScope.Auth = Auth;
    $rootScope.$on("$routeChangeSuccess", function(route) {
      var role = $route.current && 
        $route.current.$$route && 
        $route.current.$$route.authRequired;
      if (role && !Auth.permittedTo(role)) {
        $rootScope.$broadcast('auth-required', {
          reason: 'route', 
          route: $route.current.$$route
        });
      }
    });
  }
])
