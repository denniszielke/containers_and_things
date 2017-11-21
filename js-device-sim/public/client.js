var apiUrl = '/api/';

angular.module('SimulatorApp', [])
    .controller('SimulatorController',
        function ($scope, $http) {

            $scope.Init = function () {
                console.log("init");
                var getUrl = apiUrl + 'getappinsightskey';
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;'
                    }
                };                

                $http.get(getUrl, {}, config)
                    .success(function (response) { 
                        $scope.appInsightsKey = response;
                        console.log(response);
                        initAppInsights($scope.appInsightsKey);
                    });                
            };

            $scope.SendStatus = function (status) {
                var postUrl = apiUrl + 'sendstatus';
                var config = {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8;',
                        'devicestatus': status
                    }
                };
                window.appInsights.trackEvent("calculation-client-call-start", { value: status});
                $http.post(postUrl, { 'devicestatus': status }, config)
                    .success(function (response) { 
                        $scope.result = response;
                        console.log("received response:");
                        console.log(response);
                        if (window.appInsights){
                            window.appInsights.trackEvent("calculation-client-call-end", { value: status});
                        }    
                    });
            };
            
            $scope.Init();
        }
    );