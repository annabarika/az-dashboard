(function(){
    /**
     *  table widget
     */
    var app=angular.module("widgets.table",[]);


    /**
     * Factory for
     */
    app.factory("tableFactory", ["$filter","$rootScope",function($filter,$rootScope){

        var service={};

        service.date_filter=function(value){
            var date;

            date=$filter('date')(value,"dd/MM/yyyy");

            return date;
        };

        service.getRow=function(row){
            $rootScope.row=row;
        };

        service.getMethod=function(method){
            $rootScope.method=method;
        };

        service.prepareData = function(header, data){

        };
        return service;
    }]);
    app.filter('orderByEx', orderByExFilter);

    function orderByExFilter($parse){ // modified version of native Angular orderBy filter

        return function(array, dataheader, sortPredicate, reverseOrder) {


            if (!(array instanceof Array)) return array;
            if (!sortPredicate) return array;

            sortPredicate = angular.isArray(sortPredicate) ? sortPredicate: [sortPredicate];
            sortPredicate = map(sortPredicate, function(predicate){
                var descending = false, list, get = predicate || identity;
                if (angular.isString(predicate)) {
                    if ((predicate.charAt(0) == '+' || predicate.charAt(0) == '-')) {
                        descending = predicate.charAt(0) == '-';
                        predicate = predicate.substring(1);
                    }
                    get = $parse(predicate);
                }
                // if list of values specified
                if (list = find(dataheader,predicate)) {
                    return reverseComparator(function(a,b){ // return list-based comparator
                        return compare(list[get(a)],list[get(b)]);
                    }, descending);
                }
                return reverseComparator(function(a,b){ // else use native comparator
                    return compare(get(a),get(b));
                }, descending);
            });

            var arrayCopy = [];
            for ( var i = 0; i < array.length; i++) { arrayCopy.push(array[i]); }
            //console.log(sortPredicate);
            return arrayCopy.sort(reverseComparator(comparator, reverseOrder));

            function comparator(o1, o2){
                for ( var i = 0; i < sortPredicate.length; i++) {
                    var comp = sortPredicate[i](o1, o2);
                    if (comp !== 0) return comp;
                }
                return 0;
            }
            function reverseComparator(comp, descending) {
                return !!(descending)
                    ? function(a,b){return comp(b,a);}
                    : comp;
            }
            function compare(v1, v2){
                var t1 = typeof v1;
                var t2 = typeof v2;
                if (t1 == t2) {
                    if (t1 == "string") v1 = v1.toLowerCase();
                    if (t1 == "string") v2 = v2.toLowerCase();
                    if (v1 === v2) return 0;
                    return v1 < v2 ? -1 : 1;
                } else {
                    return t1 < t2 ? -1 : 1;
                }
            }
            function map (obj, iterator, context) { // copy of native Angular map function
                var results = [];
                angular.forEach(obj, function(value, index, list) {
                    results.push(iterator.call(context, value, index, list));
                });
                return results;
            }
        }
    }
    orderByExFilter.$inject = ['$parse'];

    app.directive("widgetTable", ["tableFactory",function(tableFactory){
        return{

            restict:'EA',
            templateUrl:"/app/widgets/table.wgt.html",
            //require:"",
            scope:{
                datarows:"="
                ,dataheader:"="
                ,edit:"&"
                ,row:"="
                ,toolbarButtons:"="
                ,buttonAction:"&"
                ,caption:"@"
            },

            link:function($scope){

                $scope.sortBy = function() {

                    //console.log($scope.dataheader);

                    var order = [];
                    angular.forEach($scope.dataheader, function(h){
                        if (h.sort>0) order[h.sort-1] = h.name;
                        if (h.sort<0) order[Math.abs(h.sort)-1] = '-'+h.name;
                    });
                    return order;
                };

                $scope.sortReorder = function(col,e) {

                    if (e.shiftKey) {
                        var sortIndex = 0;
                        angular.forEach($scope.dataheader, function(el) {
                            if (Math.abs(el.sort)>sortIndex) sortIndex = Math.abs(el.sort);
                        });
                        angular.forEach($scope.dataheader, function(el) {
                            if (el.name==col) el.sort = el.sort?-el.sort:sortIndex+1;
                        });
                    } else {
                        angular.forEach($scope.dataheader, function(el) {
                            if (el.name == col) el.sort = el.sort>0?-1:1; else el.sort = null;
                        });
                    }
                };

                $scope.column_sorter=function(key){
                    console.log(key);
                    $scope.sortField = key;
                    $scope.reverse = !$scope.reverse;
                };

                $scope.row_info=function(row){
                    // console.log("order_info",row);
                };

                $scope.delete_row=function(row){
                    //console.log("order_delete",row);
                };

                $scope.$watch('datarows',function(newVal,oldVal){

                    // console.log(oldVal,newVal);

                    if(newVal!=undefined){

                        var length= newVal.length,
                            date=/date/i,
                            num;

                        for(var i=0;i<length;i++){

                            angular.forEach( newVal[i], function(value,key){

                                if(date .exec(key)!=null){

                                    newVal[i][key]=tableFactory.date_filter(value);

                                }
                                else{

                                    num = parseInt(value);

                                    if(num){

                                        newVal[i][key]=num;

                                    }
                                }
                            });
                        }

                    }
                });

                $scope.edit_row=function(row){
                    tableFactory.getRow(row);
                    if($scope.edit) {
                        $scope.edit(row);
                    }
                };

                $scope.buttons=function(row,method){
                    tableFactory.getRow(row);
                    tableFactory.getMethod(method);

                    if($scope.buttonAction){
                        $scope.buttonAction();
                    }
                }
            }

        }
    }])

})();