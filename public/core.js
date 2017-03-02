// public/core.js
var stackOver = angular.module('stackOver', []);

function mainController($scope, $http) {
    $scope.formData = {};

    $scope.pageType;

    //getting all tags
    $scope.getAlltags = function () {
        $http.get('/api/tags')
            .success(function (data) {
                $scope.pageType = "tags";
                $scope.tags = data;
                $scope.resultLength = Object.keys(data).length;
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    }

    $scope.getAllPosts = function () {
            $scope.pageType = "postList";
            $http.get('/api/posts')
                .success(function (data) {
                    $scope.posts = data;
                    $scope.resultLength = data.length;
                })
                .error(function (data) {
                    console.log('Error: ' + data);
                });
        }
        // when submitting the add form, send the text to the node API
    $scope.searchPost = function () {
        $scope.pageType = "postList";
        $http.post('/api/posts', $scope.formData)
            .success(function (data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.posts = data;
                $scope.resultLength = data.length;
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    $scope.getPosts = function (postId) {
        $scope.pageType = "postList";

        $scope.formData.text = postId;
        $http.post('/api/posts', $scope.formData)
            .success(function (data) {
                $scope.formData = {}; // clear the form so our user is ready to enter another
                $scope.posts = data;
                $scope.resultLength = data.length;
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

    // openPost
    $scope.openPost = function (id) {
        $scope.pageType = "postPage";
        $http.get('/api/posts/' + id)
            .success(function (data) {
                $scope.QA = data;
                $scope.resultLength = Object.keys(data.answers).length;
                console.log(data);
            })
            .error(function (data) {
                console.log('Error: ' + data);
            });
    };

}