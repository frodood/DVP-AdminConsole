/**
 * Created by Damith on 5/28/2016.
 */

'use strict';
mainApp.controller('mainCtrl', function ($scope, $state, $interval,
                                         dashboardService, moment) {

    $scope.clickDirective = {
        goDashboard: function () {
            $state.go('console.dashboard');
        },
        goProductivity: function () {
            $state.go('console.productivity');
        }
    };

    //#services call handler
    $scope.total = {
        calls: 0,
        queued: 0,
        queueAnswered: 0,
        queueDropped: 0,
        waiting: 0,
        briged: 0
    };


    $scope.chartymax = {

        calls: 1,
        briged: 1,
        queued: 1,
        channels: 1

    }


    var ServerHandler = (function () {
        $scope.data = [];
        $scope.dataSetAll = [{
            data: [], lines: {
                fill: true
            }
        }];
        $scope.dataSetQueued = [{
            data: [], lines: {
                fill: false
            }
        }];
        $scope.dataSetBriged = [{
            data: [], lines: {
                fill: false
            }
        }];
        $scope.dataSetChannels = [{
            data: [], lines: {
                fill: false
            }
        }];
        return {
            getDataAll: function () {
                dashboardService.GetAll().then(function (response) {
                    response.pop();
                    var max = 0;
                    $scope.dataSetAll[0].data = response.map(function (c, index) {
                        var item = [];
                        item[0] = c[1];
                        item[1] = c[0];


                        if(c[0] > max){

                            max = c[0];
                        }

                        return item;
                    });

                    if(max == 0)
                    {
                        max = 1;
                    }

                    if($scope.chartymax.calls !=  Math.ceil(max)){

                        $scope.chartymax.calls = Math.ceil(max);
                        $scope.myChartOptions.yaxis.max = $scope.chartymax.calls;
                    }
                });
            }, getAllQueued: function () {
                dashboardService.GetAllQueued().then(function (response) {
                    response.pop();
                    var max = 0;
                    $scope.dataSetQueued[0].data = response.map(function (c, index) {
                        var item = [];
                        item[0] = c[1];
                        item[1] = c[0];
                        if(c[0] > max){

                            max = c[0];
                        }


                        return item;
                    });


                    if(max == 0)
                    {
                        max = 1;
                    }

                    if($scope.chartymax.queued !=  Math.ceil(max)){

                        $scope.chartymax.queued = Math.ceil(max);
                        $scope.myChartOptions2.yaxis.max = $scope.chartymax.queued;
                    }

                });
            }, getAllBriged: function () {
                dashboardService.GetAllBriged().then(function (response) {
                    response.pop();
                    var max = 0;
                    $scope.dataSetBriged[0].data = response.map(function (c, index) {
                        var item = [];
                        item[0] = c[1];
                        item[1] = c[0];

                        if(c[0] > max){

                            max = c[0];
                        }

                        return item;
                    });


                    if(max == 0)
                    {
                        max = 1;
                    }

                    if($scope.chartymax.briged !=  Math.ceil(max)){

                        $scope.chartymax.briged = Math.ceil(max);
                        $scope.myChartOptions3.yaxis.max = $scope.chartymax.briged;
                    }

                });
            }, getAllChannels: function () {
                dashboardService.GetAllChannels().then(function (response) {
                    response.pop();
                    var max = 0;
                    $scope.dataSetChannels[0].data = response.map(function (c, index) {
                        var item = [];
                        item[0] = c[1];
                        item[1] = c[0];

                        if(c[0] > max){

                            max = c[0];
                        }


                        return item;
                    });


                    if(max == 0)
                    {
                        max = 1;
                    }

                    if($scope.chartymax.channels !=  Math.ceil(max)){

                        $scope.chartymax.channels = Math.ceil(max);
                        $scope.myChartOptions4.yaxis.max = $scope.chartymax.channels;
                    }

                });
            },
            getTotalCall: function () {
                dashboardService.GetTotalCalls().then(function (response) {
                    $scope.total.calls = response;
                });
            },
            getTotalQueued: function () {
                dashboardService.GetTotalQueued().then(function (response) {
                    $scope.total.queued = response;
                });
            },
            getTotalQueueAnswered: function () {
                dashboardService.GetTotalQueueAnswered().then(function (response) {
                    $scope.total.queueAnswered = response;
                });
            },
            getCurrentWaiting: function () {
                dashboardService.GetCurrentWaiting().then(function (response) {
                    $scope.total.waiting = response;
                });
            },
            getTotalQueueDropped: function () {
                dashboardService.GetTotalQueueDropped().then(function (response) {
                    $scope.total.queueDropped = response;
                });
            },
            getTotalBriged: function () {
                dashboardService.GetTotalBriged().then(function (response) {
                    $scope.total.briged = response;
                });
            },
            callAllServices: function () {
                ServerHandler.getDataAll();
                ServerHandler.getAllQueued();
                ServerHandler.getAllBriged();
                ServerHandler.getAllChannels();
            },
            getAllNumTotal: function () {
                ServerHandler.getTotalCall();
                ServerHandler.getTotalQueueAnswered();
                ServerHandler.getTotalQueued();
                ServerHandler.getCurrentWaiting();
                ServerHandler.getTotalQueueDropped();
                ServerHandler.getTotalBriged();
            }
        }
    })();
    ServerHandler.callAllServices();
    ServerHandler.getAllNumTotal();

    //loop request
    var t = $interval(function updateRandom() {
        ServerHandler.callAllServices();
    }, 1000);
    var tt = $interval(function updateRandom() {
        ServerHandler.getAllNumTotal();
    }, 60000);


    $scope.myChartOptions = {
        grid: {borderColor: '#fff'},
        series: {shadowSize: 0, color: "#db4114"},
        color: {color: '#5566ff'},
        legend: {
            container: '#legend',
            show: true
        },
        yaxis: {
            min: 0,
            max: $scope.chartymax.calls
        },
        xaxis: {
            tickFormatter: function (val, axis) {
                return moment.unix(val).minute() + ":" + moment.unix(val).second();
            }
        }
    };

    $scope.myChartOptions2 = {
        grid: {
            borderColor: '#fff',
            show: false
        },
        series: {shadowSize: 0, color: "#63a5a2"},
        color: {color: '#63a5a2'},
        legend: {
            container: '#legend',
            show: true
        },
        yaxis: {
            min: 0,
            max: $scope.chartymax.queued
        }, xaxis: {
            tickFormatter: function (val, axis) {
                return moment.unix(val).minute() + ":" + moment.unix(val).second();
            }
        },




    };

    $scope.myChartOptions3 = {
        grid: {
            borderColor: '#fff',
            show: false
        },
        series: {shadowSize: 0, color: "#114858"},
        color: {color: '#63a5a2'},
        legend: {
            container: '#legend',
            show: true
        },
        yaxis: {
            min: 0,
            max: $scope.chartymax.briged
        }, xaxis: {
            tickFormatter: function (val, axis) {
                return moment.unix(val).minute() + ":" + moment.unix(val).second();
            }
        }
    };
    $scope.myChartOptions4 = {
        grid: {
            borderColor: '#fff',
            show: false
        },
        series: {shadowSize: 0, color: "#f8b01d"},
        color: {color: '#63a5a2'},
        legend: {
            container: '#legend',
            show: true
        },
        yaxis: {
            min: 0,
            max: $scope.chartymax.channels

        }, xaxis: {
            tickFormatter: function (val, axis) {
                return moment.unix(val).minute() + ":" + moment.unix(val).second();
            }
        }
    };
    //chart js
});

