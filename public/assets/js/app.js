var app = angular.module('myApp', ['ui.router','myAppRouter','ngMessages','userServices','authServices','btford.socket-io','socketModule']);

app.config(function($httpProvider){
    $httpProvider.interceptors.push('AuthInterceptors'); //push tokens in header
});
app.run(['$rootScope', 'Auth', function($rootScope,Auth,$anchorScroll){
    $rootScope.$on('$stateChangeStart', function(event, next, current){
     if(next.authenticated == true){
            if(Auth.isLoggedIn()){}
            else{
                  alert('you dont have permission to access this' + " " + next.name + " Page please login" );
                  event.preventDefault();
            }
        }
    });
}]); 
app.controller('myAppController', ['$scope','UserAccountService','$http','$state','$timeout','$rootScope','Auth','Socket','$anchorScroll','$location', function($scope, UserAccountService, $http, $state, $timeout, $rootScope, Auth, Socket, $anchorScroll, $location) {
    $rootScope.showLoader = false;
    $scope.currentUser = {};
    $scope.getCurrentUser = function(){
        if(Auth.isLoggedIn()){
            Auth.getUser().then(function(res){
                $scope.currentUser = res.data;
                console.log($scope.currentUser.email +' - is logged in');
                $scope.promptUsername();
                // $scope.connectChat($scope.currentUser.email);
            });
        }else{
            console.log('User is not logged in');
        }
    }

    //user login
    $scope.loginData = {};
    $scope.login = function(valid, formData){
        if(valid){
            $rootScope.showLoader = true;
            Auth.login(formData,function(res){
                $scope.loginData.res = res.data;
                if(res.data.txStatus == 'success'){
                    $timeout(function(){
                        $rootScope.showLoader = false;
                        $state.go('home');
                        $scope.loginData.res = null;
                        $scope.getCurrentUser();
                      
                    },1000);
                }else
                    $rootScope.showLoader = false;
            },function(){
                    //error callback
            });
        }
    }
    //logout
    $scope.logout = function(){
        $rootScope.showLoader = true;
        Auth.logout();
        $timeout(function(){
            $rootScope.showLoader = false;
            $state.go('login');
            Socket.disconnect(true);
        },1000);
    }

    //chat session
    $scope.users= [];
    $scope.messages=[];
    $scope.msg = '';
    $scope.gotoBottom = function(){
    }
    $scope.promptUsername = function(message) {
        Socket.connect();
        $scope.messages=[];
        if(!message)
            Socket.emit('add-user', {username: $scope.currentUser.email});
        else
            alert(message);
    }

    $scope.sendMessage = function(msg) {
        $scope.msgbox = '';
        if(msg != null && msg != '') {
            Socket.emit('message', {message: msg});
        }   
    }
    Socket.emit('request-users', {});
    Socket.on('users', function(data){
        $scope.users = data.users;
    });
    Socket.on('message', function(data){
        data.time = new Date();
        $scope.messages.push(data);
          $scope.gotoBottom();
    });
    Socket.on('add-user', function(data){
        $scope.users.push(data.username);
        data.time = new Date();
        $scope.messages.push({ username: data.username, message: data.username+' has entered the channel', time: data.time}); $scope.gotoBottom();
    });
    Socket.on('remove-user', function(data){
        $scope.users.splice($scope.users.indexOf(data.username), 1);
        data.time = new Date();
        $scope.messages.push({ username: data.username, message: data.username+' has left the channel', time: data.time}); $scope.gotoBottom();
    });
    Socket.on('prompt-username', function(data){
        $scope.promptUsername(data.message);
    });
    $scope.registerUser = function(valid, formData){
        if(valid){
            $rootScope.showLoader = true;
            UserAccountService.userSignup(formData).then(function(res){
                //success callback
                if(res.data.txStatus=='success'){
                    console.log(res.data.message);
                    $timeout(function(){
                        $rootScope.showLoader = false;
                        $scope.login(true,formData);
                    },2000);
                }else{
                    console.log(res.data.message);
                }
            },function(){
                //error callback
            });
        }
    }
}]);