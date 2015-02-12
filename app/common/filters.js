(function(){

    var arr=angular.module('commonFilters',[]);

        //var limitToFilter = $filter('limitTo');

        arr.filter('trim', function(limitToFilter){

            return function(input, limit){
                if (input.length > limit){
                    return limiToFilter(input, limit-3) + '...';
                }
                return input;
            };
        });
})();
