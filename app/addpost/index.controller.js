(function () {
    'use strict';

    angular
        .module('app')
        .controller('Addpost.IndexController', Controller);

    function Controller($window, UserService, FlashService) {
        var vm = this;

        vm.user = null;
        vm.post = {};
        vm.placeholder = {};
        vm.sharetype = [];
        
        vm.addPost = addPost;
        
        initController();

        function initController() {
            // get current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
            vm.post.title = '';
            vm.post.description = '';
            vm.post.sharetype = 'Public';
            vm.post.date = '';
            
            vm.placeholder.title = "Enter a post title";
            vm.placeholder.description = "Enter a post description";
            
            vm.sharetype = ['Public', 'Private'];
        }
        
        function addPost() {
            
            UserService.AddPost(vm.user, vm.post)
                .then(function () {
                    FlashService.Success('Post added');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }        
    }

})();