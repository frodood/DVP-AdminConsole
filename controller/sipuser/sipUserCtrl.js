/**
 * Created by dinusha on 6/2/2016.
 */

(function ()
{
    var app = angular.module("veeryConsoleApp");

    var sipUserCtrl = function ($scope, sipUserApiHandler)
    {

        //User List Operations
        $scope.showAlert = function (title, type, content) {

            new PNotify({
                title: title,
                text: content,
                type: type,
                styling: 'bootstrap3'
            });
        };


        $scope.reloadUserList = function()
        {
            sipUserApiHandler.getSIPUsers().then(function(data)
            {
                if(data.IsSuccess)
                {
                    $scope.sipUsrList = data.Result;
                    $scope.total = data.Result.length;
                }
                else
                {
                    var errMsg = data.CustomMessage;

                    if(data.Exception)
                    {
                        errMsg = data.Exception.Message;
                    }
                    $scope.showAlert('Error', 'error', errMsg);

                }

                $scope.dataReady = true;

            }, function(err)
            {
                var errMsg = "Error occurred while getting pabx user list";
                if(err.statusText)
                {
                    errMsg = err.statusText;
                }
                $scope.showAlert('Error', 'error', errMsg);
                $scope.dataReady = true;
            });
        };

        $scope.reloadUserList();

        //User Configuration Operations

        $scope.IsEdit = false;

        var clearFormOnSave = function()
        {
            $scope.basicConfig = {};
        };

        $scope.onSavePressed = function()
        {
            if($scope.IsEdit)
            {
                sipUserApiHandler.updateUser($scope.basicConfig).then(function(data1)
                {
                    if(data1.IsSuccess)
                    {

                        if($scope.basicConfig.UsePublic)
                        {
                            $scope.basicConfig.Domain = '';
                            sipUserApiHandler.setPublicUser($scope.basicConfig).then(function(data2)
                            {

                            })
                        }


                    }
                    else
                    {
                        $scope.showAlert('Error', 'error', 'Error updating user');
                    }

                }, function(err)
                {
                    var errMsg = "Error updating user";
                    if(err.statusText)
                    {
                        errMsg = err.statusText;
                    }
                    $scope.showAlert('Error', 'error', errMsg);
                });
            }
            else
            {
                //Save
                $scope.basicConfig.Enabled = true;
                sipUserApiHandler.saveSIPUser($scope.basicConfig).then(function(data1)
                {
                    if(data1.IsSuccess)
                    {

                        var extObj = {
                            Extension: $scope.basicConfig.Extension,
                            ExtensionName: $scope.basicConfig.SipUsername,
                            ExtraData: "",
                            AddUser: "",
                            UpdateUser: "",
                            Enabled: true,
                            ExtRefId: $scope.basicConfig.SipUsername,
                            ObjCategory: "USER"
                        };

                        sipUserApiHandler.addNewExtension(extObj).then(function(data2)
                        {
                            if(data2.IsSuccess)
                            {

                                sipUserApiHandler.assignExtensionToUser(extObj.Extension, data1.Result.id).then(function(data3)
                                {
                                    if(data3.IsSuccess)
                                    {
                                        clearFormOnSave();
                                        $scope.showAlert('Success', 'info', 'Sip User Saved Successfully');
                                    }
                                    else
                                    {
                                        var errMsg = data3.CustomMessage;

                                        if(data3.Exception)
                                        {
                                            errMsg = 'Assign user to extension error : ' + data3.Exception.Message;
                                        }
                                        clearFormOnSave();

                                        $scope.showAlert('Saved with errors', 'error', errMsg);
                                    }
                                }, function(err)
                                {
                                    clearFormOnSave();
                                    $scope.showAlert('Saved with errors', 'error', 'Communication error occurred - while assigning extension');

                                })
                            }
                            else
                            {
                                var errMsg = data2.CustomMessage;

                                if(data2.Exception)
                                {
                                    errMsg = 'Create extension error : ' + data2.Exception.Message;
                                }

                                clearFormOnSave();

                                $scope.showAlert('Saved with errors', 'error', errMsg);
                            }
                        }, function(err)
                        {
                            clearFormOnSave();
                            $scope.showAlert('Saved with errors', 'error', 'Communication error occurred - while creating extension');
                        })

                    }
                    else
                    {
                        var errMsg = data1.CustomMessage;

                        if(data1.Exception)
                        {
                            errMsg = 'Get context Error : ' + data1.Exception.Message;
                        }

                        $scope.showAlert('Error', 'error', errMsg);
                    }

                }, function(err)
                {
                    $scope.showAlert('Error', 'error', 'Communication error occurred - user not saved');
                });
            }

        };


        sipUserApiHandler.getContexts().then(function(data)
        {
            if(data.IsSuccess)
            {
                $scope.contextList = data.Result;
            }
            else
            {
                var errMsg = data.CustomMessage;

                if(data.Exception)
                {
                    errMsg = 'Get context Error : ' + data.Exception.Message;
                }
                $scope.showAlert('Error', 'error', errMsg);
            }

        }, function(err)
        {
            var errMsg = "Error occurred while getting context list";
            if(err.statusText)
            {
                errMsg = err.statusText;
            }
            $scope.showAlert('Error', 'error', errMsg);


        });


        sipUserApiHandler.getDomains().then(function(data)
        {
            if(data.IsSuccess)
            {
                $scope.endUserList = data.Result;
            }
            else
            {
                var errMsg = data.CustomMessage;

                if(data.Exception)
                {
                    errMsg = 'Get enduser Error : ' + data.Exception.Message;
                }
                $scope.showAlert('Error', 'error', errMsg);
            }

        }, function(err)
        {
            var errMsg = "Error occurred while getting end user list";
            if(err.statusText)
            {
                errMsg = err.statusText;
            }
            $scope.showAlert('Error', 'error', errMsg);


        });

        if($scope.IsEdit)
        {
            sipUserApiHandler.getSIPUser($scope.basicConfig).then(function(data)
            {
                if(data.IsSuccess)
                {
                    $scope.basicConfig = data.Result;

                    if(data.Result && data.Result.Extension)
                    {
                        $scope.basicConfig.Extension = data.Result.Extension.Extension;
                    }

                }
                else
                {
                    var errMsg = data.CustomMessage;

                    if(data.Exception)
                    {
                        errMsg = 'Get sip user error : ' + data.Exception.Message;
                    }
                    $scope.showAlert('Error', 'error', errMsg);
                }

            }, function(err)
            {
                var errMsg = "Error occurred while getting sip user";
                if(err.statusText)
                {
                    errMsg = err.statusText;
                }
                $scope.showAlert('Error', 'error', errMsg);


            });
        }

    };

    app.controller("sipUserCtrl", sipUserCtrl);
}());
