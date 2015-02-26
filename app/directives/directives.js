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


//widget sidebar
    app.directive('navSidebar', ['$timeout', function ($timeout) {

        return {
            restrict: 'C',//EA
            scope: {},
            link: function($scope, iElm, iAttrs) {
                $timeout(function () {
                    var isBusy = false;

                    var toggleMenu = function () {
                        var $this = jQuery(this),
                            $navGroup = $this.parent('.nav-group'),
                            $navMenu = $this.next('.nav-submenu');

                        /** store menu height before animation begin */
                        $navMenu.data('height', $navMenu.height());

                        if($navGroup.hasClass('active')) {
                            /** prevent rapid clicking */
                            if(isBusy) { return false; }

                            /** close menu */
                            closeMenu($navMenu, $navGroup);
                        } else {
                            /** prevent rapid clicking */
                            if(isBusy) { return false; }

                            /** close other active menu */
                            jQuery(iElm.children('.nav-group')).each(function (index, value) {
                                if(jQuery(value).hasClass('active')) {
                                    jQuery(value).removeClass('active');
                                    closeMenu(jQuery(value).children('.nav-submenu'), jQuery(value));
                                }
                            });

                            /** open menu */
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

    //drag
    app.directive('ngDraggable', function($document, $window){
        function makeDraggable(scope, element, attr) {
            var startX = 0;
            var startY = 0;

            // Start with a random pos
            var x = Math.floor((Math.random() * 500) + 40);
            var y = Math.floor((Math.random() * 360) + 40);

            element.css({
                position: 'absolute',
                cursor: 'pointer',
                top: y + 'px',
                left: x + 'px'
            });

            element.on('mousedown', function(event) {
                event.preventDefault();

                startX = event.pageX - x;
                startY = event.pageY - y;

                $document.on('mousemove', mousemove);
                $document.on('mouseup', mouseup);
            });

            function mousemove(event) {
                y = event.pageY - startY;
                x = event.pageX - startX;

                element.css({
                    top: y + 'px',
                    left: x + 'px'
                });
            }

            function mouseup() {
                $document.unbind('mousemove', mousemove);
                $document.unbind('mouseup', mouseup);
            }
        }
        return {
            link: makeDraggable
        };
    });


  /* file Uploader directive*/
    app.directive("fileInput",["$parse",function($parse){

        return{
            restrict:"A",
            link:function(scope,elm,attrs){
                elm.bind("change",function(){
                    $parse(attrs.fileInput)
                        .assign(scope,elm[0].files);
                        scope.$apply();
                    //console.log(elm);
                });
            }
        }
    }]);

})();