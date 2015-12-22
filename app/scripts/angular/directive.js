
myApp.directive("header", function() {
    return {
        restrict: 'A',
        templateUrl: 'views/tpl/header.html',
        scope: true,
        transclude : false
        //controller: 'FooterController'
    };
});