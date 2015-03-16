(function() {

    angular.module("services.fileReader", [])


    .factory('FileReader', function ($q, $window) {

        if (!$window.FileReader) {
            throw new Error('Browser does not support FileReader');
        }

        function readAsDataUrl(file) {
            var deferred = $q.defer(),
                reader = new $window.FileReader();

            reader.onload = function () {
                deferred.resolve(reader.result);
            };

            reader.onerror = function () {
                deferred.reject(reader.error);
            };

            reader.readAsDataURL(file);

            return deferred.promise;
        }

        return {
            readAsDataUrl: readAsDataUrl
        };
    });

})();