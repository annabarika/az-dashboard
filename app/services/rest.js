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
                    headers : headers,
                    timeout:60000
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
            * FILE UPLOAD METHOD 1
            * @param url
            * @param files
            * @param data
            * @param progress
            */
            service.uploader=function(url,files){

                var _resultData;
                /**
                 * start uploading
                 */
                _makeXHR(url,files,_result);
                /**
                 * callback function
                 * @param data
                 * @returns {*}
                 * @private
                 */
                function _result(data){
                    //_resultData = data;
                    $rootScope.$apply(function(){
                        $rootScope.resultUploadData=data;
                    });
                }
                /**
                 * make Ajax request
                 * @param url
                 * @param files
                 * @param callback
                 * @private
                 */
                function _makeXHR(url,files,callback){
                    var xhr=new XMLHttpRequest();

                    xhr.upload.onprogress=function(event){
                        console.log((event.loaded / event.total) * 100);
                        $rootScope.$apply(function(){
                            $rootScope.uploadProgress=(event.loaded / event.total) * 100;

                        })
                    };
                    xhr.onload = xhr.onerror = function(event) {

                        if (this.status == 200) {
                            var data=JSON.parse(event.currentTarget.response);
                            callback(data);
                        }
                        else {
                            console.log("error " + this.status);
                            callback(this.status)
                        }
                    };
                    xhr.open("POST", url, true);
                    xhr.send(files);
                }
            };
                /**
                 * uploader method 2
                 * @param url
                 * @param files
                 * @returns {service.UploadConstructor}
                 */
            service.fileUploader=function(url,files){

                function UploadConstructor(){};

                UploadConstructor.prototype._getXHR=function(){
                    var xhr=new XMLHttpRequest();
                    return xhr;
                };

                UploadConstructor.prototype._setUrl=function(url){
                    this.url=url;
                };

                UploadConstructor.prototype._setFiles=function(files){
                    this.files=files;
                };

                UploadConstructor.prototype._makeXHR=function(){
                    console.log(this.url);
                    console.log(this.files);
                    console.log(this._getXHR());
                };

                UploadConstructor._run=function(url,files){
                    this._setUrl(url);
                    this._setFiles(files);
                    this._makeXHR();
                };

                UploadConstructor.prototype._successUpload=function(){

                };
                UploadConstructor.prototype._errorUpload=function(){

                };
                UploadConstructor.prototype._progressUpload=function(){

                };




                var myUploader=new UploadConstructor();

                myUploader._run(url,files);
                //myUploader._makeXHR();
                return myUploader;

            };

            return service;
        }]);
})();