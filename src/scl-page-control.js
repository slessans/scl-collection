/**
 * Created by slessans on 6/16/15.
 */

(function (module) {
    var DEFAULT_BOX_COUNT = 7;

    var _range = function (start, end) {
        var array = [], i;
        for(i = start; i < end; i++){
            array.push(i);
        }
        return array;
    };

    module.directive('sclPageControl', function ($log) {
        return {
            scope: {
                currentPageIn: '@currentPage',
                pageCountIn: '@pageCount',
                boxCountIn: '@boxCount',
                changePage: '&?',
                showPager: '@',
                hideForSinglePage: '@'
            },
            restrict: 'E',
            require: ['sclPageControl', '^sclCollection'],
            templateUrl: '/templates/components/scl-collection/scl-page-control.html',

            controller: function ($scope) {

                var _reset = function () {
                    $scope.currentPage = null;
                    $scope.pageCount = null;
                    $scope.boxCount = null;
                    $scope.pages = null;
                    $scope.previousButtonEnabled = null;
                    $scope.nextButtonEnabled = null;
                    $scope.firstButtonEnabled = null;
                    $scope.lastButtonEnabled = null;
                    $scope.previousEllipsisVisible = null;
                    $scope.nextEllipsisVisible = null;
                };

                _reset();

                var _parseInputs = function () {
                    var currentPage = parseInt($scope.currentPageIn);
                    var pageCount = parseInt($scope.pageCountIn);
                    var boxCount = $scope.boxCountIn ? parseInt($scope.boxCountIn) : DEFAULT_BOX_COUNT;

                    if (isNaN(pageCount) || pageCount <= 0) {
                        $log.debug("invalid page count");
                        return false;
                    }

                    if (isNaN(currentPage) || currentPage < 0 || currentPage >= pageCount)  {
                        $log.debug("invalid current page");
                        return false;
                    }

                    if (boxCount < 3 || (boxCount % 2) != 1) {
                        $log.debug("invalid box count, must be >=3 and odd.");
                        return false;
                    }

                    $scope.currentPage = currentPage;
                    $scope.pageCount = pageCount;
                    $scope.boxCount = boxCount;

                    return true;
                };

                this.sync = function () {
                    var boxesPerSide, start, end;

                    _reset();

                    if (!_parseInputs()) {
                        return;
                    }

                    $scope.previousButtonEnabled = $scope.currentPage > 0;
                    $scope.nextButtonEnabled = $scope.currentPage < ($scope.pageCount - 1);
                    $scope.firstButtonEnabled = $scope.previousButtonEnabled;
                    $scope.lastButtonEnabled = $scope.nextButtonEnabled;
                    $scope.previousEllipsisVisible = false;
                    $scope.nextEllipsisVisible = false;

                    if ($scope.pageCount <= $scope.boxCount) {
                        $scope.pages = _range(0, $scope.pageCount);
                    } else {
                        // box count is more than page count
                        boxesPerSide = ($scope.boxCount - 1) / 2;
                        start = $scope.currentPage - boxesPerSide;
                        end = $scope.currentPage + boxesPerSide;

                        if (start < 0) {
                            end += Math.abs(start);
                            start = 0;
                        } else if (end > ($scope.pageCount - 1)) {
                            start -= (end - ($scope.pageCount - 1));
                            end = $scope.pageCount - 1;
                        }

                        if (start > 0) {
                            $scope.previousEllipsisVisible = true;
                            start++;
                        }

                        if (end < ($scope.pageCount - 1)) {
                            $scope.nextEllipsisVisible = true;
                            end--;
                        }

                        $scope.pages = _range(start, end + 1);
                    }
                };

            },

            link: function (scope, element, attrs, controllers) {
                var controller = controllers[0];
                var collectionController = controllers[1];

                scope.goToPage = function (event, pageNumber) {
                    if (event) {
                        event.stopPropagation();
                        event.preventDefault();
                    }
                    if (scope.changePage && pageNumber != scope.currentPage &&
                            pageNumber >= 0 && pageNumber < scope.pageCount) {
                        scope.changePage({'page': pageNumber});
                    }
                };

                scope.goToNextPage = function (event) {
                    scope.goToPage(event, scope.currentPage + 1);
                };

                scope.goToPreviousPage = function (event) {
                    scope.goToPage(event, scope.currentPage - 1);
                };

                scope.goToFirstPage = function (event) {
                    scope.goToPage(event, 0);
                };

                scope.goToLastPage = function (event) {
                    scope.goToPage(event, scope.pageCount - 1);
                };

                scope.isVisible = function () {
                    return scope.currentPage !== null &&
                        scope.pageCount !== null &&
                        !collectionController.isLoading() &&
                        collectionController.hasItems() &&
                        !(scope.pageCount === 1 && scope.hideForSinglePage === 'true');
                };

                scope.$watchGroup(['currentPageIn', 'pageCountIn', 'boxCountIn'], function () {
                    controller.sync();
                });
            }
        };
    });
})(angular.module('scl.collection'));