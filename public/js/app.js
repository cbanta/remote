'use strict';

/*jshint globalstrict:true*/
/*globals angular*/

angular.module('myApp', ['ngRoute'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/main', {templateUrl: 'partial/main', controller: 'MainCtrl'});
  $routeProvider.when('/page/:page', {templateUrl: 'partial/page', controller: 'PageCtrl'});
  $routeProvider.otherwise({redirectTo: '/main'});
}])



.controller('AppCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
  $http({method: 'GET', url: '/api/config'}).
    success(function(data, status, headers, config) {
      $scope.pages = data.pages;
      $location.path('/page/' + data.start_page);
    }).
    error(function(data, status, headers, config) {

    });
}])

.controller('MainCtrl', [function($scope, $http) {

}])

.controller('PageCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams) {
  var page = $routeParams.page;
  $scope.active_page = page;
  $scope.runScript = function runScript(groupid, scriptid){
    console.log(page, groupid, scriptid);
    //TODO: progress
    $http({method: 'POST', url: '/api/script/'+page+'/'+groupid+'/'+scriptid+'/run'}).
      success(function(data, status, headers, config) {
        //ok
      }).
      error(function(data, status, headers, config) {
        //error
      });

  };
  $http({method: 'GET', url: '/api/page/'+page}).
    success(function(data, status, headers, config) {
      $scope.groups = data.groups;
    }).
    error(function(data, status, headers, config) {
      $location.path('/main');
    });
}])


;

