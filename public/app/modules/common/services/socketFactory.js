angular.module('socketModule',[]).factory('Socket', ['socketFactory', function(socketFactory){
    return socketFactory();
}]);