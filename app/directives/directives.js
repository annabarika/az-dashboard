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

        function($timeout,$window){

            return{
                restrict:   "EA",
                templateUrl:   "/app/views/sidebar_two.html",
                scope:{
                    model:"="
                },
                link: function($scope){
                    console.log($scope.model);

                    $scope.getMenu=function(event,index){
                        console.log(event);
                        var navMenu=$scope.model[index];
                    };

                    function _openMenu($navmenu, $navgroup) {

                        $navmenu
                            .css({ height: 0 })
                            .velocity({ height: $navmenu.data('height') }, {
                                duration: 300,
                                begin: function () {
                                    $navgroup.addClass('active');
                                    isBusy = true;
                                },
                                complete: function () {
                                    $navmenu.removeAttr('style');
                                    isBusy = false;
                                }
                            }, 'ease-in-out');
                    };
                }
            }
        }
    ]);



//widget sidebar
    app.directive('navSidebar', ['$timeout', function ($timeout) {

        return {
            restrict: 'C',
            scope: {},
            link: function($scope, iElm) {
                $timeout(function () {
                    var isBusy = false;

                    var toggleMenu = function () {

                        var $this = jQuery(this),
                            $navGroup = $this.parent('.nav-group'),
                            $navMenu = $this.next('.nav-submenu');
                            //console.log($navMenu);
                        // store menu height before animation begin
                        $navMenu.data('height', $navMenu.height());

                        if($navGroup.hasClass('active')) {
                            //prevent rapid clicking
                            if(isBusy) { return false; }

                           // close menu
                            closeMenu($navMenu, $navGroup);
                        } else {
                            // prevent rapid clicking
                            if(isBusy) { return false; }

                            // close other active menu
                            jQuery(iElm.children('.nav-group')).each(function (index, value) {
                                if(jQuery(value).hasClass('active')) {
                                    jQuery(value).removeClass('active');
                                    closeMenu(jQuery(value).children('.nav-submenu'), jQuery(value));
                                }
                            });

                            //open menu
                            openMenu($navMenu, $navGroup);
                        }
                    };

                    var openMenu = function ($navmenu, $navgroup) {

                        $navmenu
                            .css({ height: 0 })
                            .velocity({ height: $navmenu.data('height') }, {
                                duration: 300,
                                begin: function () {
                                    $navgroup.addClass('active');
                                    isBusy = true;
                                },
                                complete: function () {
                                    $navmenu.removeAttr('style');
                                    isBusy = false;
                                }
                            }, 'ease-in-out');
                    };

                    var closeMenu = function ($navmenu, $navgroup) {
                        $navmenu
                            .css({ display: 'block', height: $navmenu.data('height') })
                            .velocity({ height: 0 }, {
                                duration: 300,
                                begin: function () {
                                    $navgroup.removeClass('active');
                                    isBusy = true;
                                },
                                complete: function () {
                                    $navmenu.removeAttr('style');
                                    isBusy = false;
                                }
                            }, 'ease-in-out');
                    };

                    iElm.on('click', '.nav-toggle', toggleMenu);
                });
            }
        };
    }]);
//widget sidebar

  /* file Uploader directive*/
    app.directive("fileInput",["$parse",function($parse){

        return{
            restrict:"A",
            link:function(scope,elm,attrs){
                elm.bind("change",function(){
                    $parse(attrs.fileInput)
                        .assign(scope,elm[0].files);
                        scope.$apply();
                });
            }
        }
    }]);
    app.directive('filePreview', function (FileReader) {
        return {
            restrict: 'A',
            scope: {
                filePreview: '='
            },
            link: function (scope, element, attrs) {
                scope.$watch('filePreview', function (filePreview) {
                    if (filePreview && Object.keys(filePreview).length !== 0) {
                        FileReader.readAsDataUrl(filePreview).then(function (result) {
                            element.attr('src', result);
                        });
                    }
                });
            }
        };
    });
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

    /**
     * drag-and-drop directive
     */

    app.directive('drop-files',["$parse",function($parse){

        return{
            restrict :"A",
            link:function(scope,elm,attr){

            }
        }
    }]);

    app.directive('dropzone', function () {
        return function (scope, element, attrs) {
            var config, dropzone;

            config = scope[attrs.dropzone];

            // create a Dropzone for the element with the given options
            dropzone = new Dropzone(element[0], config.options);

            // bind the given event handlers
            angular.forEach(config.eventHandlers, function (handler, event) {
                dropzone.on(event, handler);
            });
        };
    });



    app.directive("imagedrop", function ($parse) {
            return {
                restrict: "EA",
                link: function (scope, element, attrs) {
                    //The on-image-drop event attribute
                    var onImageDrop = $parse(attrs.onImageDrop);

                    //When an item is dragged over the document, add .dragOver to the body
                    var onDragOver = function (e) {
                        e.preventDefault();
                        $('body').addClass("dragOver");
                    };

                    //When the user leaves the window, cancels the drag or drops the item
                    var onDragEnd = function (e) {
                        e.preventDefault();
                        $('body').removeClass("dragOver");
                    };

                    //When a file is dropped on the overlay
                    var loadFile = function (file) {
                        scope.uploadedFile = file;
                        scope.$apply(onImageDrop(scope));
                    };

                    //Dragging begins on the document (shows the overlay)
                    $(document).bind("dragover", onDragOver);

                    //Dragging ends on the overlay, which takes the whole window
                    element.bind("dragleave", onDragEnd)
                        .bind("drop", function (e) {
                            onDragEnd(e);
                            loadFile(e.originalEvent.dataTransfer.files[0]); /* This is the file */
                        });
                }
            };
        });

})();