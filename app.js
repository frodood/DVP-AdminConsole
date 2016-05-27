/**
 * Created by Damith on 5/27/2016.
 */


var mainApp = angular.module('veeryConsoleApp', ['ngAnimate', 'ui.bootstrap',
    'ui.router', "chart.js"]);

mainApp.config(["$httpProvider", "$stateProvider", "$urlRouterProvider",
    function ($httpProvider, $stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise('/login');
        $stateProvider
            .state("console", {
                url: "/console",
                templateUrl: "views/main-home.html",
            }).state('console.dashboard', {
            url: "/dashboard",
            templateUrl: "views/test-app/test.html",
        }).state('login', {
            url: "/login",
            templateUrl: "views/login.html",
        });
    }]);

//main console directive
//menu Collapse

// TODO: This is some kind of easy fix, maybe we can improve this
var setContentHeight = function () {
    // reset height
    $RIGHT_COL.css('min-height', $(window).height());

    var bodyHeight = $BODY.outerHeight(),
        footerHeight = $BODY.hasClass('footer_fixed') ? 0 : $FOOTER.height(),
        leftColHeight = $LEFT_COL.eq(1).height() + $SIDEBAR_FOOTER.height(),
        contentHeight = bodyHeight < leftColHeight ? leftColHeight : bodyHeight;
    // normalize content
    contentHeight -= $NAV_MENU.height() + footerHeight;
    $RIGHT_COL.css('min-height', contentHeight);
};

mainApp.directive('menuCollapse', function () {
    return {
        link: function (scope, element, att) {
            var $element = element.find('a');
            $element.on('click', function (ev) {
                var $li = $(this).parent();
                if ($li.is('.active')) {
                    $li.removeClass('active');
                    $('ul:first', $li).slideUp(function () {
                        setContentHeight();
                    });
                } else {
                    // prevent closing menu if we are on child menu
                    if (!$li.parent().is('.child_menu')) {
                        $SIDEBAR_MENU.find('li').removeClass('active');
                        $SIDEBAR_MENU.find('li ul').slideUp();
                    }
                    $li.addClass('active');
                    $('ul:first', $li).slideDown(function () {
                        setContentHeight();
                    });
                }
            });
        }
    }
}).directive('navToggle', function () {
    return {
        link: function (scope, element, att) {
            element.on('click', function () {
                var $BODY = $('body');
                if ($BODY.hasClass('nav-md')) {
                    $BODY.removeClass('nav-md').addClass('nav-sm');
                    if ($SIDEBAR_MENU.find('li').hasClass('active')) {
                        $SIDEBAR_MENU.find('li.active').addClass('active-sm').removeClass('active');
                    }
                } else {
                    $BODY.removeClass('nav-sm').addClass('nav-md');

                    if ($SIDEBAR_MENU.find('li').hasClass('active-sm')) {
                        $SIDEBAR_MENU.find('li.active-sm').addClass('active').removeClass('active-sm');
                    }
                }
            });
            setContentHeight();
        }
    }
});