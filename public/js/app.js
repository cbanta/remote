'use strict';

/*jshint globalstrict:true*/
/*globals angular, console, setTimeout*/

var playURL;

angular.module('myApp', ['ngRoute','ngFileUpload'])

.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/main', {templateUrl: 'partial/main', controller: 'MainCtrl'});
  $routeProvider.when('/page/:page', {templateUrl: 'partial/page', controller: 'PageCtrl'});
  $routeProvider.when('/stream', {templateUrl: 'partial/stream', controller: 'StreamCtrl'});
  $routeProvider.when('/stream/:name', {templateUrl: 'partial/stream', controller: 'StreamCtrl'});
  $routeProvider.when('/upload', {templateUrl: 'partial/upload', controller: 'UploadCtrl'});
  $routeProvider.when('/play', {templateUrl: 'partial/play', controller: 'PlayCtrl'});
  $routeProvider.otherwise({redirectTo: '/main'});
}])



.controller('AppCtrl', ['$scope', '$http', '$location', function($scope, $http, $location) {
  $http({method: 'GET', url: 'api/config'}).
    success(function(data, status, headers, config) {
      $scope.pages = data.pages;
      $scope.start_page = data.start_page;
      $location.path('/page/' + data.start_page);
    }).
    error(function(data, status, headers, config) {

    });
}])

.controller('MainCtrl', [function($scope, $http) {

}])

.controller(
  'PageCtrl', ['$scope', '$http', '$location', '$routeParams', '$timeout',
  function($scope, $http, $location, $routeParams, $timeout) {
    var page = $routeParams.page;
    $scope.active_page = page;
    $scope.runScript = function runScript(groupid, scriptid){
      // console.log(page, groupid, scriptid);
      $scope.groups[groupid].scripts[scriptid].isDisabled = true;
      $timeout(function(){
        // console.log('reset');
        $scope.groups[groupid].scripts[scriptid].isDisabled = false;
      }, 5000);

      //TODO: progress
      $http({method: 'POST', url: 'api/script/'+page+'/'+groupid+'/'+scriptid+'/run'}).
        success(function(data, status, headers, config) {
          //ok
        }).
        error(function(data, status, headers, config) {
          //error
        });
      setTimeout(function(){
        $scope.groups[groupid].scripts[scriptid].isDisabled = false;
      }, 5000);
    };
    $http({method: 'GET', url: 'api/page/'+page}).
      success(function(data, status, headers, config) {
        console.log(data.groups);
        Object.keys(data.groups).forEach(function(groupid){
          Object.keys(data.groups[groupid].scripts).forEach(function(scriptid){
            data.groups[groupid].scripts[scriptid].isDisabled = false;
          });
        });
        $scope.groups = data.groups;
      }).
      error(function(data, status, headers, config) {
        $location.path('main');
      });
  }
])

.controller('StreamCtrl', ['$scope', '$http', '$location', '$routeParams', function($scope, $http, $location, $routeParams){
  var name = $routeParams.name;
  $scope.active_page = 'stream';
  var url = 'api/stream';
  if( name ){ url = url + '/' + name;}
  $scope.playLink = function(link){
    playURL = link;
    $location.path('play');
    return true;
  };
  $scope.cats = [];
  $http({method: 'GET', url: url})
    .success(function(data, status, headers, config){
      // console.log(data);
      $scope.cats = data;
    })
    .error(function(err){
      console.error(err);
    });
}])

.controller('UploadCtrl', [
  '$scope', '$http', '$routeParams', 'Upload', '$location',
  function($scope, $http, $routeParams, Upload, $location){
    var url = 'api/upload';
    $scope.active_page = 'upload';
    $scope.progress = 0;

    $scope.upload = function (file) {
        Upload.upload({
            url: 'api/upload',
            data: {file: file}
        }).then(function (resp) {
            console.log('Success ' + resp.config.data.file.name + 'uploaded. Response: ' + resp.data);
            playURL = 'upload';
            $location.path('play');
        }, function (resp) {
            console.log('Error status: ' + resp.status);
        }, function (evt) {
            $scope.progress = parseInt(100.0 * evt.loaded / evt.total);
            // console.log('progress: ' + $scope.progress + '% ' + evt.config.data.file.name);
        });
    };
  }
])

.controller('PlayCtrl', ['$scope', '$http', '$routeParams', function($scope, $http, $routeParams){
  $scope.play = function() {
    $http({method: 'POST', url: 'api/play/start', data: {url:playURL}})
      .success(function(data, status, headers, config){
        console.log(data);
      })
      .error(function(err){
        console.error(err);
      });
  };
  $scope.stop = function() {
    $http({method: 'POST', url: 'api/play/stop'})
      .success(function(data, status, headers, config){
        console.log(data);
      })
      .error(function(err){
        console.error(err);
      });
  };
  $http({method: 'POST', url: 'api/play', data: {url:playURL}})
    .success(function(data, status, headers, config){
      console.log(data);
      $scope.meta = data;
    })
    .error(function(err){
      console.error(err);
    });
}])

;


