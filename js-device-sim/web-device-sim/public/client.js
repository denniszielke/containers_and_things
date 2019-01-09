var apiUrl = '/api/';
function loopClick() {
    console.log(document.getElementById('SendData'));
    document.getElementById('SendData').click();
};
angular.module('SimulatorApp', [])
    .controller('SimulatorController',
        function ($scope, $http) {

            $scope.Init = function () {
                              
            };

            $scope.SendStatus = function (status) {
                var postUrl = apiUrl + 'sendstatus';
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
                        'devicestatus': status
                    }
                };
                $http.post(postUrl, { 'devicestatus': status }, config)
                    .success(function (response) { 
                        $scope.result = response;
                        console.log("received response:");
                        console.log(response);  
                    });
            };

            $scope.UploadPhoto = function (name) {
                console.log("sending: " + name);
                var postUrl = apiUrl + 'upload';
                console.log(document.querySelector('#image').src);
                var imageEncoding = "" + document.querySelector('#image').src;
                var imageOutput = imageEncoding.replace('data:image/jpeg;base64,', '');
                console.log("posting: " + imageOutput.length);
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
                        'image': imageOutput
                    }
                };
                console.log(config);
                $http.post(postUrl, { }, config)
                    .success(function (response) { 
                        $scope.result = response;
                        console.log("received response:");
                        console.log(response);  
                    });
            };

            $scope.SendData = function () {
                var postUrl = apiUrl + 'senddata';
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
                        'temperature': $scope.temperature,
                        'humidity': $scope.humidity
                    }
                };
                console.log(config.headers);
                $http.post(postUrl, { 'temperature': $scope.temperature, 'humidity': $scope.humidity }, config)
                    .success(function (response) { 
                        $scope.result = response;
                        console.log("received response:");
                        console.log(response);  
                        if ($scope.loop){
                            window.setTimeout(loopClick, 1000);
                        }
                    });
            };
            
            $scope.Init();
        }
    );