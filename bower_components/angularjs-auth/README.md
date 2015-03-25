angularjs-auth
==============

Role-Based Angular JS Client-Side Authentication and Authorization Module

Example
--------
<a href="http://plnkr.co/edit/BNg4vEMBA1X2aawHtMU8?p=preview">
 <img src="http://i.imgur.com/cZonIWa.png?1" height="190" />
 <img src="http://i.imgur.com/A5AH0pb.png?1" height="190" />
</a>


This Module Does
----------------

* Set auth. token to all http requests header once logged in 

* Broadcast a message from $rootScope whenever;

  * accessed a route defined with `authRequired` without login
  * received 401 response from http requests
  
* Provides methods to access the related window.sessionStorage data

  * Auth.create(data), to save credentials
  * Auth.destroy(), to delete all credentials
  * Auth.permittedTo(role), to check if the current user has the given role
  * Auth.get(key), to retrieve auth data

This Module Does **NOT**
------------------------

* Encode or decode access token, i.e. JWT (This should be done at server-side)
* Do anything until you catch `ahth-required` message AND use it

For server-side implementation with Node/Express, please refer [this example](https://gist.github.com/allenhwkim/911e6dd6dbc1da197918)

Install
---------

1. Include `angularjs-auth` module as yor app dependency

        <script src="angularjs-auth.js"></script>
        ...
        var app = angular.module('myapp', ['ngRoute', 'angularjsAuth']);

2. Add `authRequired` with the value of required role to your route config.
  and, register $http interceptor, `AuthInterceptor`, to set `x-access-token` for all http requests
  and to broadcast `auth-required` event for all errored http responses, 401(Unauthorized)
  
      app.config(function($routeProvider) {
        $routeProvider
          .when('/public', {templateUrl: 'public.html', controller: 'MyController'}) 
          .when('/admin',  {
            templateUrl: 'admin.html',
            controller: 'MyController',
            authRequired: 'admin'  // <------ LIKE THIS
          }) 
          .otherwise({ redirectTo: '/public' });
        $httpProvider.interceptors.push('AuthInterceptor');   // <------- AND THIS
      });

3. Include `Auth` service in your controller as a dependency.

        app.controller('MyController', function($scope, $http, $location, Auth) { 
          ... 
        }
      
DONE!! Now you are ready to login and logoff

Usage
------
#### Login ####

1. Whenever login is required, you receive `auth-required` message, then you show login page to users as follows. It's your decision what to do with this message; redirect to login page, show login section, or show alert message.

        $scope.$on("auth-required", function(event, reason) {
          $location.url("/login?redir=" + encodeURIComponent(reason.route.originalPath) );
        });

2. User enters and submits credentials and receive the response  
      
        $scope.submitLogin = function () {
          $http({
            url: '/login', 
            params: {username: $scope.username, password: $scope.password}
          }).success(function (data) {
            Auth.create(data);                        // create sessionStorage data
            $location.path($location.search().redir); // redirect to the url user asked
          }).error(function () {
            $scope.message = "Invalid username or password";
          });
        };

#### Logout  ####

You simply invoke `Auth.destroy()` method

    $scope.logoff = function() {
      Auth.destroy();
    }

#### Login/Logout Links Section ####

Use `Auth.isLoggedIn()` to check if the user is logged in or not

    <div ng-controller="MyController">
      <div ng-if="Auth.isLoggedIn()">
        Hello, {{Auth.get('username')}} <a ng-href="#/login" ng-click="logoff()">logoff</a>
      </div>
      <div ng-if="!Auth.isLoggedIn()">
        <a ng-href="#/login">Login</a>
      </div>
    </div>

#### Role-Only Section ####

Use `Auth.permittedTo(ROLE)` method to check if the user has the given role or not

    <div ng-if="Auth.permittedTo('admin')">
      !!! Only user with admin role can see this !!!!
    </div>
    

