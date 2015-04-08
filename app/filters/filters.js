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
        arr.filter('capitalize', function() {
            return function(input, all) {
                return (!!input) ? input.replace(/([^\W_]+[^\s-]*) */g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();}) : '';
            }
        })
})();
