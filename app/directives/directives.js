(function() {
    var app = angular.module('directives', []);

    app.directive("sidebar", function () {
        return {
            restrict: 'E',
            templateUrl: "/app/views/sidebar.html"
        };
    });
    app.directive("header", function () {
        return {
            restrict: 'E',
            templateUrl: "/app/views/header.html"
        };
    });
    app.directive("footer", function () {
        return {
            restrict: 'E',
            templateUrl: "/app/views/footer.html"
        };
    });

    app.directive("navigation",
        [
            "$timeout",
            "$window",
            "$location",
            "$route",
            "$animate",
        function($timeout,$window,$location,$route,$animate){

            /**
             *
             * @type {c.originalPath|*}
             * @private
             */
            var _path=$route.current.originalPath;
            /**
             *
             * @param menu
             * @private
             */
            function _openMenu(menu) {
                $animate.addClass(menu, 'active');
            }

            /**
             *
             * @param menu
             * @private
             */
            function _closeMenu(menu) {
                $animate.removeClass(menu, 'active');
            }

            return{
                restrict:   "EA",
                templateUrl:   "/app/views/sidebar_two.html",
                scope:{
                    model:"="
                },
                link: function($scope){

                    var length=$scope.model.length;

                    for(var i=0;i<length;i++){
                        $scope.model[i]['class']="nav-group";
                        var subLength=$scope.model[i].menu.length;
                        for(var j=0;j<subLength;j++){
                            if(_path.indexOf($scope.model[i].menu[j].url)!=-1){
                                $scope.model[i]['class']="nav-group active";
                            }
                        }
                    }
                    /**
                     *
                     * @param event
                     * @param index
                     */
                    $scope.getMenu=function(event,index){
                        var navMenu=angular.element(event.currentTarget).parent();
                        var navGroup=angular.element(navMenu).parent();
                        if(navMenu.hasClass('active')) {
                            _closeMenu(navMenu);
                        } else {
                            for(var i=0;i<navGroup[0].children.length;i++){
                                if(navGroup[0].children[i].classList.contains("active")){
                                    _closeMenu(navGroup[0].children[i]);
                                }
                            }
                           _openMenu(navMenu);

                        }
                    };
                }
            }
        }
    ]);
    app.directive('numbersOnly', function(){
        return {
            require: 'ngModel',
            link: function(scope, element, attrs, modelCtrl) {
                modelCtrl.$parsers.push(function (inputValue) {
                    // this next if is necessary for when using ng-required on your input.
                    // In such cases, when a letter is typed first, this parser will be called
                    // again, and the 2nd time, the value will be undefined
                    if (inputValue == undefined) return ''
                    var transformedInput = inputValue.replace(/[^0-9\.]/g, '');
                    if (transformedInput!=inputValue) {
                        modelCtrl.$setViewValue(transformedInput);
                        modelCtrl.$render();
                    }
                    return transformedInput;
                });
            }
        };
    });
  /* file Uploader directive*/
    app.directive("fileInput",["$parse",function($parse){
        /**
         * validation for files types
         * @param files
         * @param accept
         * @returns {*}
         * @private
         */
        function _validFiles(files,accept){

            if(!accept){return files}

            var obj={},
                accept=accept.split(','),
                length=accept.length,
                counter=0;

            accept=accept.map(function(i){
                return i.replace(".","/").slice(0,3);
            });
            console.log(accept);

            for (key in files){

                if(!files[key].hasOwnProperty('type')){
                    continue;
                }
                if(files[key].type==""){
                    continue;
                }
                for (var i=0;i<length;i++){
                    if(files[key].type.indexOf(accept[i])!=-1){
                        obj[counter]=files[key];
                        counter++;
                    }
                }
            }
            obj['length']=counter;
            /*console.log(obj);*/
            return obj;
        }

        return{
            restrict:"A",
            link:function(scope,elm,attrs){
                //console.log(attrs);

                if(attrs.accept!=undefined){
                    //console.log(attrs.accept);
                }

                elm.bind("change",function(){

                    var files=_validFiles(elm[0].files,attrs.accept);

                    $parse(attrs.fileInput)
                        .assign(scope,files);
                        scope.$apply();
                });
            }
        }
    }]);
    /**
     * File preview
     */
    app.directive('filePreview', function (FileReader) {
        return {
            restrict: 'A',
            scope: {
                filePreview: '='
            },
            //@TODO add spinner of progress bar while image not show
            link: function (scope, element, attrs) {
                scope.$watch('filePreview', function (filePreview) {
                    if (filePreview) {
                        FileReader.readAsDataUrl(filePreview).then(function (result) {
                            element.attr('src', result);
                        });
                    }
                });
            }
        };
    });
    /**
     * DropZone
     */
    app.directive("imageDropzone",["$parse", function ($parse) {

            return {
                restrict: "A",
                link: function (scope, elm, attrs) {
                    /**
                     * file type validator
                     * @type array
                     */
                    if(attrs.accept!=undefined){
                        var accept=attrs.accept.split(",");
                        accept=accept.map(function(i){
                            return i.replace(".","/").slice(0,3);
                        });
                    }
                    /**
                     * array for files
                     * @type {Array}
                     */
                    var array=[];
                    /**
                     * element events for drag'n'drop
                     */
                    elm.bind("dragover",_eventBreak);
                    elm.bind("dragleave",_eventBreak);
                    elm.bind("drop",_dropFiles);
                    /**
                     *
                     * @param event
                     * @private
                     */
                    function _eventBreak(event){
                        event.preventDefault();
                    }
                    /**
                     *
                     * @param event
                     * @private
                     */
                    function _dropFiles(event){
                        _eventBreak(event);

                        if(navigator.userAgent.indexOf('Chrome')!=-1){
                            _chromeFileTransfer(event);
                        }
                        else{
                            console.log(navigator.userAgent);
                            _fileTransfer(event);
                        }
                    }

                    /**
                     * Chrome file transfer
                     * @param event
                     * @private
                     */
                    function _chromeFileTransfer(event){
                        var items = event.dataTransfer.items;
                        for (var i=0; i<items.length; i++) {
                            var item = items[i].webkitGetAsEntry();
                            if (item) {
                                _traverseFileTree(item);
                            }
                        }
                    }

                    /**
                     * common fileTransfer without folder transfer
                     * @param event
                     * @private
                     */
                    function _fileTransfer(event){
                        var files=_validAllTypes(event.dataTransfer.files);

                            $parse(attrs.imageDropzone)
                                .assign(scope, files);
                            scope.$apply();


                    }

                    /**
                     * get all files from folders if exist
                     * @param item
                     * @param path
                     * @private
                     */
                    function _traverseFileTree(item, path){
                       var path = path || "";
                        if (item.isFile){
                            item.file(function(file) {
                                var validType=_validType(file);
                                if(validType){
                                    array.push(file);
                                    $parse(attrs.imageDropzone)
                                        .assign(scope, array);
                                    scope.$apply();
                                }
                            });
                        } else if (item.isDirectory) {
                            var dirReader = item.createReader();
                            dirReader.readEntries(function(entries) {
                                for (var i=0; i<entries.length; i++) {
                                    _traverseFileTree(entries[i], path + item.name + "/");
                                }
                            });
                        }
                    }
                    /**
                     * validation file type
                     * @param file
                     * @returns {boolean}
                     * @private
                     */
                    function _validType(file){
                        if(!accept) return true;
                        var bool=false;
                        for(var i=0,length=accept.length;i<length;i++){
                            if(file.type.indexOf(accept[i])!=-1){
                                console.log(file.type.indexOf(accept[i]));
                                bool=true;
                            }
                        }
                        return bool;
                    }

                    /**
                     * validation files array
                     * @param files []
                     * @returns {{}}
                     * @private
                     */
                    function _validAllTypes(files){
                        var obj={},
                            counter=0;
                            for(var i= 0,length=files.length;i<length;i++){
                                /*if(!files[i].hasOwnProperty('type')){
                                    continue;
                                }
                                if(files[i].type==""){
                                    continue;
                                }*/
                                for(var j=0;j<accept.length;j++){
                                    if(files[i].type.indexOf(accept[j])!=-1){
                                        obj[counter]=files[i];
                                        counter++;
                                    }
                                }
                            }
                        obj['length']=counter;
                        console.log(obj);
                        return obj;
                    }

                }
            };
        }]);

    app.directive("breadCrumbs",function($location){
        /**
         * get breadcrumbs array
         * @param path
         * @returns {Array}
         * @private
         */
            function _getCrumbs(path){
                var array=[],
                    result=[],
                    index,
                    way;
                array=path.split("/");
                for(var i=0;i<array.length;i++){
                    if(array[i]!="" && !parseInt(array[i])){
                        index=path.indexOf(array[i])+array[i].length;
                        way=path.slice(0,index);
                        result.push({
                            name:array[i],
                            path:way
                        })
                    }
                }
                return result;
            }

        return{
            restrict:"EA",
            template:'<ol class="breadcrumb pull-right-sm mb-0" ><li ng-repeat="crumb in breadcrumbsModel"><a href="" ng-click="relocation(crumb.path)" ng-if="!$last">{{crumb.name}}</a><span ng-if="$last">{{crumb.name}}</span></li></ol>',
            link:function(scope){
                /**
                 * relocation
                 * @param path
                 */
                scope.relocation=function(path){
                    console.log(path);
                    $location.path(path);
                };
                /**
                 * watch location changes
                 */
                scope.$watch(
                    function(){return $location.$$path},
                    function(val){
                    scope.breadcrumbsModel=_getCrumbs($location.$$path);
                });

            }
        }
    })
})();