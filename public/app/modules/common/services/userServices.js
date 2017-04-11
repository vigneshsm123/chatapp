'use strict';

angular.module('userServices', [])
    .factory('UserAccountService', function($http) {
        var userSignup = 'api/users',
            dataFactory = {};

        //User Signup Service call
        dataFactory.userSignup = function(formData) {        
            return $http.post(userSignup, formData);
        }
        return dataFactory;
    });

angular.module('authServices', [])
    .factory('Auth', function($http, $q, AuthToken) {
        var authFactory = {};
        authFactory.login = function(formData, handleSuccess, handleError){
            return $http.post('api/authenticate',formData).then(function(res){
                console.log(res.data.token);
                AuthToken.setToken(res.data.token);
                handleSuccess(res);
            });
        }
        authFactory.logout = function(){
             AuthToken.setToken();
        }
        authFactory.getUser  = function(){
            if(AuthToken.getToken()){
                return $http.post('/api/me');
            }else{
                $q.reject({"message":"User has no token"});
            }
        }
        authFactory.isLoggedIn = function(){
            if(AuthToken.getToken()){  
                return true;
            }
            else{
                return false;
            }
        }
        return authFactory;
    })
    .factory('AuthToken', function($window) {
        var authTokenFactory = {};

        authTokenFactory.setToken = function(token){
            if(token)
                $window.localStorage.setItem('token', token);
            else
                $window.localStorage.removeItem('token');
        }
        authTokenFactory.getToken = function(token){
            return $window.localStorage.getItem('token');
        }
        
        return authTokenFactory;
    })
    .factory('AuthInterceptors', function(AuthToken){
        var authInterceptorsFactory = {};
        authInterceptorsFactory.request = function(config){
            var token = AuthToken.getToken();
            if(token){
                config.headers['x-access-token'] = token;
            }
            return config;
        }
        return authInterceptorsFactory;
    }); 