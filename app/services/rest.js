(function(){

    angular.module("services.rest",['angularSpinner'])
        /**
        * REST FACTORY
        */
        .factory("RestFactory",
        [
            "$http",
            "$q",
            "usSpinnerService",
            "$rootScope",

            function($http,$q,usSpinnerService,$rootScope) {

            var service={};
            /**
            * REQUEST METHOD
            * @param url
            * @param method
            * @param data
            * @param contentType
            * @returns {T.promise|*|d.promise|promise|qFactory.Deferred.promise|m.ready.promise}
            */
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
                        deferred.reject(status);
                        usSpinnerService.stop('loader');
                    });
                return deferred.promise;
            };
            /**
            * FILE UPLOAD METHOD
            * @param url
            * @param files
            * @param data
            * @param progress
            */
            service.uploader=function(url,files,data,progress){

                var deferred = $q.defer();

                var xhr=new XMLHttpRequest();
                /**
                 * progress
                 * @param event
                 */
                xhr.upload.onprogress = function(event) {
                    console.log(event);
                    console.log(event.loaded + ' / ' + event.total);
                    $rootScope.$apply (function() {
                        var percentCompleted;
                        if (event.lengthComputable) {
                            percentCompleted = Math.round(event.loaded / event.total * 100);
                            if (progress) {
                                progress(percentCompleted);
                            } else if (deferred.notify) {
                                deferred.notify(percentCompleted);
                            }
                        }
                    });
                };
                /**
                 * upload complete
                 * @param e
                 */
                xhr.onload = function(e) {
                    $rootScope.$apply (function() {
                        var ret = {
                            files: files,
                            data: angular.fromJson(xhr.responseText)
                        };
                        deferred.resolve(ret);
                    })
                };
                /**
                 * XHR error
                 * @param e
                 */
                xhr.upload.onerror = function(e) {
                    var msg = xhr.responseText ? xhr.responseText : "An unknown error occurred posting to '" + url + "'";
                    $rootScope.$apply (function() {
                        deferred.reject(msg);
                    });
                };

                var formData = new FormData();

                if (data) {
                    Object.keys(data).forEach(function(key) {
                        formData.append(key, data[key]);
                    });
                }

                for (var idx = 0; idx < files.length; idx++) {
                    formData.append(files[idx].name, files[idx]);
                }

                xhr.open("POST", url);
                xhr.send(formData);

                return deferred.promise;

            };
            return service;
        }]);
})();