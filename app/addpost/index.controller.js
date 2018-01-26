(function () {
    'use strict';

    angular
        .module('app')
        .controller('Addpost.IndexController', Controller);

    function Controller($window, UserService, FlashService, Upload) {
        
        var vm = this;

        vm.user = null;
        vm.post = {};
        vm.placeholder = {};
        vm.sharetype = [];
        vm.progress = "";
        
        vm.upload = null;
        vm.submit = null;
        
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
            vm.post.uploadedfiles = [];
            vm.post.file = [];
            
            vm.placeholder.title = "Enter a post title";
            vm.placeholder.description = "Enter a post description";
            
            vm.sharetype = ['Public', 'Private'];
            
            vm.upload = function (file) {
                Upload.upload({
                    url: 'http://localhost:3000/upload', //webAPI exposed to upload the file
                    arrayKey: '',
                    data:{file: file} //pass file as data, should be user ng-model
                }).then(function (resp) { //upload function returns a promise
                    if(resp.data.error_code === 0){ //validate success
                        
                        vm.post.uploadedfiles = resp.data.files;
                        
                        cbAdd();
                        
                    } else if( resp.config.data.file.length > 2) {
                        FlashService.Error('Cannot upload more than two images');
                    } else {
                        FlashService.Error('Error occurred while uploading file');                                    console.log(resp);      
                    }
                }, function (resp) { //catch error
                    FlashService.Error('Error status: ' + resp.status);                
                }, function (evt) { 
//                    var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
//                    vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
                });
            };
            
            vm.submit = function(){ //function to call on form submit
                if (vm.upload_form.file.$valid && vm.post.file) { //check if from is valid
                    vm.upload(vm.post.file); //call upload function
                } else {                    
                    cbAdd();
                }               
            }
        }
        
        function addPost() {           
            vm.submit();
        }
        
        function cbAdd() {
            UserService.AddPost(vm.user, vm.post)
            .then(function () {
                FlashService.Success('Post added');
                vm.post.title = '';
                vm.post.description = '';
                vm.post.sharetype = 'Public';
            })
            .catch(function (error) {
                FlashService.Error(error);
            });
        }
    }

})();