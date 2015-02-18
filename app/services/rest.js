(function(){

    angular.module("services.rest",[])


        /**
         * REST FACTORY
         * @param1:url,
         * @param2:type,
         * @param3:data,
         * @param4:header
         */
        .factory("RestFactory", ["$http","$q",function($http,$q){

            var service={};

            service.request=function(url,method,data,header) {
               // console.log("Rest",url,method,data,header);

                var headers ={
                    default: "application/x-www-form-urlencoded; charset=utf-8",
                    multipart: "multipart/form-data"
                };

                if(!header) header = 'default';
                header = headers[header];

                if(method==undefined) method='get';

                var deferred = $q.defer();

                $http(
                    {
                        method: method,
                        url: url,
                        data: data,
                        headers: header
                    }
                )
                    .success(function (response) {
                        if (response) {
                            deferred.resolve(response)
                        }
                        else {
                            deferred.resolve(response);
                        }
                    })
                    .error(function (data, status, headers, config) {
                        //console.log("You can not send Cross Domain AJAX requests:"+data, status, headers, config);

                        deferred.reject(status);
                    });

                return deferred.promise;

            };
            return service;
        }]);
})();