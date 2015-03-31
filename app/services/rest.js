(function(){

    angular.module("services.rest",['angularSpinner'])


        /**
         * REST FACTORY
         * @param1:url,
         * @param2:type,
         * @param3:data,
         * @param4:header
         */
        .factory("RestFactory", ["$http","$q", "usSpinnerService", function($http,$q, usSpinnerService) {

            var service={};

            service.request=function(url,method,data, contentType) {

                var headers = {};
                var contentTypes ={
                    default: "application/x-www-form-urlencoded; charset=utf-8",
                    multipart: "multipart/form-data",
                    undefined: "undefined"
                };

                headers = {'Content-Type': (contentType) ? contentTypes[contentType] : contentTypes.default};

                if( method==undefined) method = 'get';

                var deferred = $q.defer();
				var req ={
					method: method,
					url: url,
					data: data,
                    headers : headers
				};

                usSpinnerService.spin('loader');
				$http(req)
                    .success(function (response) {
                        if (response) {
                            deferred.resolve(response)
                        }
                        else {
                            deferred.resolve(response);
                        }

                        usSpinnerService.stop('loader');
                    })
                    .error(function (data, status, headers, config) {
                        //console.log("You can not send Cross Domain AJAX requests:"+data, status, headers, config);

                        deferred.reject(status);
                        usSpinnerService.stop('loader');
                    });

                return deferred.promise;
            };
            return service;
        }]);
})();