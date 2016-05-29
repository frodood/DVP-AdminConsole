/**
 * Created by Pawan on 5/29/2016.
 */

'use strict';

mainApp.controller('callmonitorcntrl', function ($scope,callMonitorSrv,notificationService) {

    // Update the dataset at 25FPS for a smoothly-animating chart
    $scope.CallObj={};
    var onCallsDataReceived = function (response) {

        if(response.data.Exception)
        {
            onError(response.data.Exception.Message);
        }
        else
        {
            /*notificationService.success({
                title: 'ok',
                text: "ok",
                hide: false
            });*/
            //var callObj=JSON.stringify('{"Exception":null,"CustomMessage":"Operation Successfull","IsSuccess":true,"Result":{"cc392087-76f0-4bac-aebb-caff14d2de6c":[{"Channel-State":"CS_EXCHANGE_MEDIA","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/internal/dave@124.43.64.26:13776","Call-Direction":"outbound","Caller-Destination-Number":"dave","Caller-Unique-ID":"cc392087-76f0-4bac-aebb-caff14d2de6c","variable_sip_auth_realm":"null","variable_dvp_app_id":"3","Caller-Caller-ID-Number":"charlie","Other-Leg-Unique-ID":"dd64403b-35ef-400a-bf36-2d7ef7607dc7","Channel-Call-State":"ACTIVE"},{"Channel-State":"CS_EXECUTE","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/internal/charlie@159.203.160.47","Call-Direction":"inbound","Caller-Destination-Number":"2004","Caller-Unique-ID":"dd64403b-35ef-400a-bf36-2d7ef7607dc7","variable_sip_auth_realm":"159.203.160.47","variable_dvp_app_id":"null","Caller-Caller-ID-Number":"charlie","Channel-Call-State":"ACTIVE","Application-Type":"EXTENDED","Other-Leg-Unique-ID":"cc392087-76f0-4bac-aebb-caff14d2de6c","Bridge-State":"Bridged"}],"d453d7a7-3c19-48e8-9047-e347287a1474":[{"Channel-State":"CS_EXECUTE","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/internal/eve@159.203.160.47","Call-Direction":"inbound","Caller-Destination-Number":"2002","Caller-Unique-ID":"d453d7a7-3c19-48e8-9047-e347287a1474","variable_sip_auth_realm":"159.203.160.47","variable_dvp_app_id":"null","Caller-Caller-ID-Number":"eve","Channel-Call-State":"ACTIVE","Application-Type":"EXTENDED","Other-Leg-Unique-ID":"d3808e91-a5e0-456c-a4bd-39a0003d81e6","Bridge-State":"Bridged"},{"Channel-State":"CS_EXCHANGE_MEDIA","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/internal/bob@124.43.64.26:14490","Call-Direction":"outbound","Caller-Destination-Number":"bob","Caller-Unique-ID":"d3808e91-a5e0-456c-a4bd-39a0003d81e6","variable_sip_auth_realm":"null","variable_dvp_app_id":"3","Caller-Caller-ID-Number":"eve","Other-Leg-Unique-ID":"d453d7a7-3c19-48e8-9047-e347287a1474","Channel-Call-State":"ACTIVE"}],"5fedd42a-7f44-4548-8b18-19613c1fe24b":[{"Channel-State":"CS_EXECUTE","FreeSWITCH-Switchname":"1","Channel-Name":"sofia/external/18705056540@45.55.184.114","Call-Direction":"inbound","Caller-Destination-Number":"94777400400","Caller-Unique-ID":"5fedd42a-7f44-4548-8b18-19613c1fe24b","variable_sip_auth_realm":"null","variable_dvp_app_id":"null","Caller-Caller-ID-Number":"18705056540","Channel-Call-State":"ACTIVE","Application-Type":"HTTAPI"}]}}');
            ValidCallsPicker(response.data);
        }

    };

    var onError = function (error) {
        notificationService.Error({
            title: 'Error',
            text: error,
            hide: false
        });
    };


    $scope.LoadCurrentCalls = function()
    {
        callMonitorSrv.getCurrentCalls().then(onCallsDataReceived,onError);
    };


    var ValidCallsPicker = function (callObj) {

        var curCallArr=[];

        var callObjLen = Object.keys(callObj.Result).length;
        console.log("DB Call count "+callObjLen);

        for(var i=0;i<callObjLen;i++)
        {
            var keyObj=callObj.Result[Object.keys(callObj.Result)[i]];

            if(keyObj.length>1)
            {
                var callObject=CallObjectCreator(keyObj);
                if(callObject)
                {
                    curCallArr.push(callObject);
                    $scope.CallObj=curCallArr;
                    console.log("Call Object "+$scope.CallObj);
                }
                else
                {
                    $scope.CallObj={}
                }

            }


            if(i==callObjLen-1)
            {
                console.log(curCallArr);
            }
        }

    };

    var CallObjectCreator= function(objKey)
    {
        var bargeID="";
        var FromID="";
        var ToID="";
        var Direction ="";
        var Receiver ="";
        var Bridged=false;
        var newKeyObj={};

        for(var j=0;j<objKey.length;j++)
        {

            if(objKey[j]["DVP-Call-Direction"])
            {
                Direction = objKey[j]["DVP-Call-Direction"];
            }

            if(objKey[j]['Call-Direction']=="inbound")
            {
                FromID=objKey[j]['Caller-Caller-ID-Number'];
                ToID=objKey[j]['Caller-Destination-Number'];
                bargeID=objKey[j]['Caller-Unique-ID'];

            }
            else if(objKey[j]['Call-Direction']=="outbound")
            {
                Receiver=objKey[j]['Caller-Destination-Number'];
            }

            if(objKey[j]['Bridge-State']=="Bridged")
            {
                Bridged=true;
            }

            if(j==objKey.length-1)
            {
                if(Bridged)
                {
                    newKeyObj.FromID=FromID;
                    newKeyObj.ToID=ToID;
                    newKeyObj.BargeID=bargeID;
                    newKeyObj.Direction=Direction;
                    newKeyObj.Receiver=Receiver;

                    return newKeyObj;
                }
                else
                {
                    return false;
                }

            }

        }
    };

    $scope.LoadCurrentCalls();


});
