var app = angular.module("veeryConsoleApp");

app.controller('FileEditController', ['$scope', '$filter', 'FileUploader', 'fileService', function ($scope, $filter, FileUploader, fileService) {

    $scope.file = {};
    var uploader = $scope.uploader = new FileUploader({
        url: fileService.UploadUrl,
        headers: fileService.Headers
    });

    // FILTERS

    uploader.filters.push({
        name: 'customFilter',
        fn: function (item /*{File|FileLikeObject}*/, options) {
            return this.queue.length < 10;
        }
    });

    //uploader.formData.push({'DuoType' : 'fax'});

    // CALLBACKS

    uploader.onWhenAddingFileFailed = function (item /*{File|FileLikeObject}*/, filter, options) {
        console.info('onWhenAddingFileFailed', item, filter, options);
    };
    uploader.onAfterAddingFile = function (fileItem) {
        console.info('onAfterAddingFile', fileItem);
    };
    uploader.onAfterAddingAll = function (addedFileItems) {
        if (!$scope.file.Category) {
            uploader.clearQueue();
            new PNotify({
                title: 'File Upload!',
                text: 'Please Select File Category.',
                type: 'error',
                styling: 'bootstrap3'
            });
            return;
        }
        console.info('onAfterAddingAll', addedFileItems);
    };
    uploader.onBeforeUploadItem = function (item) {
        item.formData.push({'fileCategory': $scope.file.Category});
        console.info('onBeforeUploadItem', item);
    };
    uploader.onProgressItem = function (fileItem, progress) {
        console.info('onProgressItem', fileItem, progress);
    };
    uploader.onProgressAll = function (progress) {
        console.info('onProgressAll', progress);
    };
    uploader.onSuccessItem = function (fileItem, response, status, headers) {
        console.info('onSuccessItem', fileItem, response, status, headers);
    };
    uploader.onErrorItem = function (fileItem, response, status, headers) {
        console.info('onErrorItem', fileItem, response, status, headers);
    };
    uploader.onCancelItem = function (fileItem, response, status, headers) {
        console.info('onCancelItem', fileItem, response, status, headers);
    };
    uploader.onCompleteItem = function (fileItem, response, status, headers) {
        console.info('onCompleteItem', fileItem, response, status, headers);
    };
    uploader.onCompleteAll = function () {
        console.info('onCompleteAll');
    };

    console.info('uploader', uploader);

    $scope.file = {};
    $scope.file.Category = {};
    $scope.loadFileService = function () {
        fileService.GetCatagories().then(function (response) {

            $scope.Categorys = $filter('filter')(response, {Owner: "user"});
            if ($scope.Categorys) {
                if ($scope.Categorys.length > 0) {
                    $scope.file.Category = $scope.Categorys[0].Category;
                }
            }
        }, function (error) {
            console.info("GetCatagories err" + error);

        });
    };

    $scope.loadFileService();


}]);

app.controller("FileListController", function ($scope, $location, $log, $filter, $http, $state, $uibModal, $anchorScroll, fileService, jwtHelper, authService, baseUrls) {

    $anchorScroll();
    $scope.countByCategory = [];
    $scope.categoryId = 0;
    $scope.showPaging = false;
    $scope.currentPage = "1";
    $scope.pageTotal = "1";
    $scope.pageSize = "50";
    $scope.isLoading = true;
    $scope.noDataToshow = false;
    $scope.getPageData = function (Paging, page, pageSize, total) {
        $scope.files = [];
        $scope.noDataToshow = false;
        if ($scope.categoryId) {
            fileService.GetFilesCategoryID($scope.categoryId, pageSize, page).then(function (response) {
                $scope.files = response;
                $scope.noDataToshow = response ? (response.length == 0) : true;
            }, function (err) {
            });

        }
        else {
            $scope.loadFileList(pageSize, page);
        }
    };


    $scope.internalUrl = baseUrls.fileServiceInternalUrl;
    $scope.isImage = function (source) {
        Utils.isImage(source).then(function (result) {
            $log.debug("isImage" + result);
            return result;
        });
    };

    $scope.Catagories = [];
    $scope.loadCatagories = function () {
        $scope.Catagories = [];
        fileService.GetCatagories().then(function (response) {
            $scope.Catagories = $filter('filter')(response, {Owner: "user"});

            /*angular.forEach($scope.Catagories, function (item) {
             fileService.GetFileCountCategoryID(item.id).then(function (counts) {
             if (counts) {
             $scope.countByCategory.push(counts);
             }
             }, function (error) {
             console.info("GetFileCountCategoryID err" + error);
             });
             });*/

        }, function (error) {
            console.info("GetCatagories err" + error);
        });
    };
    $scope.loadCatagories();

    //get all file - page load
    $scope.files = [];
    $scope.loadFileList = function (pageSize, currentPage) {
        $scope.files = [];
        $scope.noDataToshow = false;
        fileService.GetFiles(pageSize, currentPage).then(function (response) {
            $scope.files = response;
            $scope.noDataToshow = response ? (response.length == 0) : true;
            $scope.isLoading = false;
        }, function (err) {
            $scope.isLoading = false;
        });
    };
    $scope.loadFileList($scope.pageSize, 1);

    $scope.reloadPage =function(){
        $scope.fileToDelete = [];
        $scope.loadCatagories();
        $scope.getPageData("Paging",1, $scope.pageSize, $scope.pageTotal);
    };

    $scope.loadFilesByCat = function (cat) {
        $scope.getFilesCategoryID(cat, 1);
    };

    $scope.getFilesCategoryID = function (category, currentPage) {
        $scope.isLoading = true;
        $scope.noDataToshow = false;

        $scope.pageTotal = category.fileCount.Count;
        $scope.currentPage = 1;
        $scope.categoryId = category.id;
        $scope.showPaging = false;
        fileService.GetFilesCategoryID(category.id, $scope.pageSize, currentPage).then(function (response) {
            $scope.files = response;
            $scope.showPaging = true;
            $scope.isLoading = false;
            $scope.noDataToshow = response ? (response.length == 0) : true;

        }, function (err) {
        });
    };

    $scope.showConfirm = function (tittle, label, okbutton, cancelbutton, content, OkCallback, CancelCallBack, okObj) {

        (new PNotify({
            title: tittle,
            text: content,
            icon: 'glyphicon glyphicon-question-sign',
            hide: false,
            confirm: {
                confirm: true
            },
            buttons: {
                closer: false,
                sticker: false
            },
            history: {
                history: false
            }
        })).get().on('pnotify.confirm', function () {
                OkCallback("confirm");
            }).on('pnotify.cancel', function () {

            });

    };

    $scope.showAlert = function (tittle, label, button, content) {

        new PNotify({
            title: tittle,
            text: content,
            type: 'success',
            styling: 'bootstrap3'
        });
    };

    $scope.showError = function (tittle, content) {

        new PNotify({
            title: tittle,
            text: content,
            type: 'error',
            styling: 'bootstrap3'
        });
    };
    $scope.deleteFile = function (file) {

        $scope.showConfirm("Delete File", "Delete", "ok", "cancel", "Do you want to delete " + file.Filename, function (obj) {

            fileService.DeleteFile(file).then(function (response) {
                if (response) {

                    $scope.loadFileList($scope.pageSize, 1);
                    $scope.showAlert("Deleted", "Deleted", "ok", "File " + file.Filename + " Deleted successfully");
                }
                else
                    $scope.showError("Error", "Error", "ok", "There is an error ");
            }, function (error) {
                $scope.showError("Error", "Error", "ok", "There is an error ");
            });

        }, function () {

        }, file)
    };

    $scope.deleteMultipleFiles = function () {

        $scope.showConfirm("Delete File", "Delete", "ok", "cancel", "Do you want to delete Selected["+$scope.fileToDelete.length+"] Files.", function () {

            var delCount=0;
            angular.forEach($scope.fileToDelete,function(file){

                fileService.DeleteFile(file).then(function (response) {
                    delCount++;
                    if($scope.fileToDelete.length===delCount){
                        $scope.reloadPage();
                        $scope.showAlert("Deleted", "Deleted", "ok", "Delete Process Complete.");
                    }
                }, function (error) {
                    delCount++;
                    if($scope.fileToDelete.length===delCount){
                        $scope.reloadPage();
                        $scope.showAlert("Deleted", "Deleted", "ok", "Delete Process Complete.");
                    }
                });

            });


        }, function () {

        }, undefined)
    };

    $scope.downloadFile = function (file) {
        fileService.DownloadFile(file.UniqueId, file.Filename);
    };

    $scope.GetToken = function () {
        fileService.Headers = {'Authorization': fileService.GetToken};
    };
    $scope.GetToken();

    $scope.tenant = 0;
    $scope.company = 0;
    $scope.getCompanyTenant = function () {
        var decodeData = jwtHelper.decodeToken(authService.TokenWithoutBearer());
        console.info(decodeData);
        $scope.company = decodeData.company;
        $scope.tenant = decodeData.tenant;
    };
    $scope.getCompanyTenant();


    /* Video Modal*/
    $scope.items = ['item1', 'item2', 'item3'];

    $scope.playVideo = function (file) {

        var modalInstance = $uibModal.open({
            animation: false,
            templateUrl: 'file_gallery/view/myModalContent.html',
            controller: 'ModalInstanceCtrl',
            size: 'sm',
            resolve: {
                file: function () {
                    return file;
                }
            }
        });

        modalInstance.result.then(function (selectedItem) {
            $scope.selected = selectedItem;
        }, function () {
            $log.info('Modal dismissed at: ' + new Date());
        });
    };

    /* Video Modal*/

    $scope.showDeleteSelection = false;
    $scope.showDelete=function(){
        $scope.showDeleteSelection=!$scope.showDeleteSelection;
    };

    $scope.fileToDelete = [];
    $scope.addToDelete = function (file) {
        if (file.delete) {
            $scope.fileToDelete.push(file);
        }
        else {
            var index = $scope.fileToDelete.indexOf(file);
            if (index > 0)
                $scope.fileToDelete.splice(index, 1);
        }
    }
});

app.controller('SidebarController', function ($scope, sidebar) {
        $scope.sidebar = sidebar;
    }
);

app.controller('VideoController', function ($sce, $scope) {
        $scope.playVideo = function (file) {
            $scope.sources = [
                {
                    src: $sce.trustAsResourceUrl("http://0.s3.envato.com/h264-video-previews/80fad324-9db4-11e3-bf3d-0050569255a8/490527.mp4"),
                    type: "video/mp4"
                }
            ];
        };

        this.config = {
            preload: "none",
            sources: [
                {
                    src: $sce.trustAsResourceUrl("http://static.videogular.com/assets/videos/videogular.mp4"),
                    type: "video/mp4"
                }
            ]
        };
    }
);

app.directive('onErrorSrc', function () {
    return {
        link: function (scope, element, attrs) {
            element.bind('error', function () {
                if (attrs.src != attrs.onErrorSrc) {
                    attrs.$set('src', attrs.onErrorSrc);
                }
            });
        }
    }
});


app.controller('ModalInstanceCtrl', function ($scope, $sce, $uibModalInstance, baseUrls, file) {

    $scope.selectedFile = file;

    $scope.ok = function () {
        $uibModalInstance.close($scope.selectedFile.Filename);
    };

    $scope.cancel = function () {
        $uibModalInstance.dismiss('cancel');
    };

    /*{{internalUrl}}File/Download/{{tenant}}/{{company}}/{{file.UniqueId}}/{{file.Filename}}*/
    $scope.config = {
        preload: "auto",
        sources: [
            {
                src: $sce.trustAsResourceUrl(baseUrls.fileServiceInternalUrl + "File/Download/" + file.TenantId + "/" + file.CompanyId + "/" + file.UniqueId + "/" + file.Filename),
                type: file.FileStructure
            }
        ],
        tracks: [
            {
                src: "http://www.videogular.com/assets/subs/pale-blue-dot.vtt",
                kind: "subtitles",
                srclang: "en",
                label: "English",
                default: ""
            }
        ],
        theme: {
            url: "bower_components/videogular-themes-default/videogular.css"
        },
        "analytics": {
            "category": "Videogular",
            "label": "Main",
            "events": {
                "ready": true,
                "play": true,
                "pause": true,
                "stop": true,
                "complete": true,
                "progress": 10
            }
        }
    };


});

