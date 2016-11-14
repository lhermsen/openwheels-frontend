'use strict';

angular.module('owm.resource.parkingpermit', ['alertService'])
.directive('parkingpermit', function ($compile) {
  return {
    restrict: 'E',
    scope: {
      resource: '=',
      resourceList: '='
    },
    templateUrl: 'resource/components/parkingpermit.tpl.html',
    controller: 'ParkingpermitController'
  };
})
    
.controller('ParkingpermitController', function($scope, $log, alertService, resourceService, dialogService, $state) {
//  $log.log($scope.resourceList);
  var show = function (permits) {
    if(permits.length === 0) {
      $scope.create = true;
      $scope.update = false;
    } else {
      $scope.create = false;
      $scope.permit_id = permits[0].id;
      $scope.update = true;
    }
  };
  
  $scope.createParkingPermit = function () {
    resourceService.getMembers({resource: $scope.resource.id})
    .then(function (members) {
      return dialogService.showModal({
        templateUrl: 'resource/components/parking-create.tpl.html'
      }, {resource: $scope.resource, members: members});
    }).then(function () {
      alertService.load($scope, 'success', 'vergunning aanvragen');
      return resourceService.createParkingpermit({resource: $scope.resource.id});
    }).then(function(permit) {
      $log.debug('vergunning aangevraagt', permit);
      alertService.loaded($scope);
      alertService.add($scope, 'success', 'Vergunning brief verzonden.');
      return [permit];
    }).then(show, function (error) {
      if(error === 'cancel') {
        return;
      }
      alertService.loaded($scope);
      alertService.addError(error);
    });
  };
  
  $scope.updateParkingPermit = function (permit) {
    resourceService.getMembers({resource: $scope.resource.id})
    .then(function (members) {
      return dialogService.showModal({
        templateUrl: 'resource/components/parking-edit.tpl.html'
      }, {
        resource: $scope.resource,
        resourceList: $scope.resourceList,
        members: members
      });
    }).then(function (resource) {
      $log.log('resource', $scope.resource.id);
      if(!resource) {
        return $state.go('owm.resource.replace', {
          resourceId: $scope.resource.id
        });
      }
      
      alertService.load($scope, 'success', 'vergunning wijzigen');
      return resourceService.alterParkingpermit({
        parkingpermit: permit,
        resource: resource.id
      }).then(function(permit) {
        $log.debug('vergunning aangevraagt', permit);
        alertService.loaded($scope);
        alertService.add($scope, 'success', 'Vergunning brief verzonden.');
        return [permit];
      }).then(show, function (error) {
        if(error === 'cancel') {
          return;
        }
        alertService.loaded($scope);
        alertService.addError(error);
      });
    });
  };

  
  $scope.removeParkingPermit = function (permit) {
    alertService.load($scope, 'success', 'vergunning verwijderen');
    resourceService.removeParkingpermit({parkingpermit: permit})
    .then(function(permit) {
      $log.debug('vergunning opgezecht', permit);
      alertService.loaded($scope);
      alertService.add($scope, 'success', 'Vergunning opzeg brief verzonden.');
      return [];
    }).then(show, function (error) {
      alertService.loaded($scope);
      alertService.addError(error);
    });
  };

  resourceService.getParkingpermits({
    resource: $scope.resource.id
  }).then(show);
});