/**
 * Created by slessans on 6/16/15.
 */

(function (module) {
    module.directive('sclCollectionBlankStateView', function () {
        return {
            scope: {},
            restrict: 'E',
            require: ['^sclCollection'],
            transclude: true,
            template: '<div ng-transclude ng-show="isVisible()"></div>',
            link: function (scope, attrs, element, controllers) {
                var collectionController = controllers[0];

                scope.isVisible = function () {
                    return !collectionController.isLoading() && !collectionController.hasItems();
                };
            }
        };
    });
})(angular.module('scl.collection'));