/**
 * Created by slessans on 6/15/15.
 */

(function (module) {

    module.directive('sclCollection', function($log) {
        return {
            transclude: true,
            scope: {
                promise: '=?',  // promise should resolve array of objects
                items: '=?',
                onLoadingChanged: '&?'
            },
            restrict: 'E',
            require: ['sclCollection'],
            template: '<div ng-transclude></div>',

            controller: function($scope, $attrs, $stateParams, $state) {
                $scope.loading = false;
                $scope.items = null;

                this.isLoading = function () {
                    return $scope.loading;
                };

                this.getItems = function () {
                    return $scope.items;
                };

                this.hasItems = function () {
                    return $scope.items && $scope.items.length > 0;
                };

                this._load = function () {
                    if (!$scope.promise) {
                        return;
                    }

                    $scope.loading = true;
                    $scope.items = null;

                    $scope.promise
                        .then(function (items) {
                            $scope.items = items;
                            $scope.loading = false;
                        })
                        .catch(function () {
                            $log.debug("Error");
                        });
                };
            },

            link: function(scope, element, attrs, controllers, transclude) {
                var controller = controllers[0];
                scope.$watch('promise', function () {
                    controller._load();
                });
                scope.$watch('loading', function () {
                    if (scope.onLoadingChanged) {
                        scope.onLoadingChanged({loading: !!scope.loading});
                    }
                });
            }

        };
    });


})(angular.module('scl.collection'));
