'use strict'
var myApp = angular.module('myApp', ['ngRoute','myControllers']);
myApp.config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {
    $routeProvider
        .when('/', {templateUrl: 'views/tpl/index.html', controller: 'indexContrl'})
        .when('/u/:name/:day/:title',{templateUrl:'',controller:''})
        .otherwise({redirectTo: '/'});
}]);

