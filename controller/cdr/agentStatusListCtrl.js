/**
 * Created by dinusha on 9/6/2016.
 */
(function () {
    var app = angular.module("veeryConsoleApp");

    var agentStatusListCtrl = function ($scope, $filter, cdrApiHandler) {

        $scope.showAlert = function (tittle, type, content) {

            new PNotify({
                title: tittle,
                text: content,
                type: type,
                styling: 'bootstrap3'
            });
        };

        $scope.moment = moment;


        $scope.obj = {
            startDay : moment().format("YYYY-MM-DD"),
            endDay : moment().format("YYYY-MM-DD")
        };


        var isEmpty = function (map) {
            for (var key in map) {
                if (map.hasOwnProperty(key)) {
                    return false;
                }
            }
            return true;
        };


        $scope.getAgentStatusList = function ()
        {
            $scope.obj.isTableLoading = 0;
            var momentTz = moment.parseZone(new Date()).format('Z');
            momentTz = momentTz.replace("+", "%2B");

            var startDate = $scope.obj.startDay + ' 00:00:00' + momentTz;
            var endDate = $scope.obj.endDay + ' 23:59:59' + momentTz;

            try
            {
                cdrApiHandler.getAgentStatusList(startDate, endDate).then(function (agentListResp)
                {
                    $scope.agentStatusList = {};
                    if(agentListResp && agentListResp.Result)
                    {
                        for(var resource in agentListResp.Result)
                        {
                            if(agentListResp.Result[resource] && agentListResp.Result[resource].length > 0 && agentListResp.Result[resource][0].ResResource && agentListResp.Result[resource][0].ResResource.ResourceName)
                            {
                                var caption = agentListResp.Result[resource][0].ResResource.ResourceName;
                                $scope.agentStatusList[caption] = agentListResp.Result[resource];
                            }

                        }

                    }

                    $scope.obj.isTableLoading = 1;

                }).catch(function(err)
                {
                    $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading agent status events');
                    $scope.obj.isTableLoading = 1;
                });


            }
            catch (ex)
            {
                $scope.showAlert('Error', 'error', 'ok', 'Error occurred while loading agent status events');
                $scope.obj.isTableLoading = 1;
            }

        };



    };
    app.controller("agentStatusListCtrl", agentStatusListCtrl);

}());


