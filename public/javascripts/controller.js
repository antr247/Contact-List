var AppCtrl = angular.module('AppCtrl', ['ui.router']);
/*
Make sure to include auth factory object into controller to use Authorization Bearer
*/

function mainController($scope, $http, $window, $state, auth )  { 												
	$scope.formData = {};
	$scope.isLoggedIn = auth.isLoggedIn;
	
	/*
		Wrap the whole get() method so that it can be reuse within controller whenever need
		refresh page with new updated contents. For instance, when editing single entry in
		contact the only way to get it live refresh with new updates is to reload the all entries
		collection.
	*/
	$scope.controllerRefreshAll = function() {
		/*
			Get current logged username from token
		 */
		var token1 = auth.getToken();
		var payload2 = JSON.parse($window.atob(token1.split('.')[1]));
		console.log(token1);
			
		/*
			Username extracted from token then stored in $scope.formData.authors
			so it can be passed to node in 'get method' to retrieve entries in mongodb
			under that username.
		*/
		$scope.formData.authors = payload2.username;
		console.log($scope.formData.authors);
			
		$http.get('/api/contacts/' + $scope.formData.authors)
			.success(function(data) {
				$scope.contacts = data;
				console.log(data);
			})
			.error(function(data) {
				console.log('Error: ' + data);
			})
	};
		/*
			This allows active logged in user to click 'Refresh' in browser & still see their own data.
		*/
		if(auth.isLoggedIn()) //If logged in is TRUE, then display current active user data
		{
			$scope.controllerRefreshAll();
		}
		
		/*
			This automatically get check when landing on /home page. If user not logged in then
			send user to login page.
		*/
		if(!auth.isLoggedIn())
		{
			$state.go('login');
		}
		/*
			This method when user click will create new contact entry into MongoDB. 
		*/
		$scope.createContact = function() {
			if(!auth.isLoggedIn())
			{
				alert('Please log in first to make changes!');
			}
			else {
				/*
					Below post method pass all the user entered data from
				 	formData (ng-model=formData.name,formData.email...)
				*/

				/*
					Extract current logged username from token.
				 */
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				console.log(payload);

				/*
				 Username extracted from token then stored in $scope.formData.authors
				 so it can be passed to node in 'post method' to insert contact-list
				 entries in mongodb under that username.
				 */
				$scope.formData.authors = payload.username;
				console.log($scope.formData.authors);

				$http.post('/api/contacts', $scope.formData, {headers: {Authorization: 'Bearer ' + auth.getToken()}})
					.success(function (data) {
						$scope.formData = {};
						$scope.contacts = data;
					})
					.error(function (data) {
						console.log('Error: ' + data);

					});
				/*
					Call the RefreshAll method to refresh the view with contact-list entries
					belong to current logged in user.
				 */
				$scope.controllerRefreshAll();
			}
		};
		
		/*
			This method when user click will remove user selected entry on the forms.
		*/
		$scope.removeContact = function(id) {
			if(!auth.isLoggedIn())
			{
				alert('Please log in first to make changes!');
			}
			else {
				$http.delete('/api/contacts/' + id, {headers: {Authorization: 'Bearer ' + auth.getToken()}})
					.success(function (data) {
						$scope.contacts = data;
						console.log(data);
					})
					.error(function (data) {
						console.log('Error: ' + data);
					//	alert('Please log in first to make changes!');
					});
				/*
				 Call the RefreshAll method to refresh the view with contact-list entries
				 belong to current logged in user.
				 */
				$scope.controllerRefreshAll();
			}
		};
		/*
			This method when user click will display user selected entry on the forms
			so new data can be entered.
		*/
		$scope.editContact = function(id) {
			if(!auth.isLoggedIn())
			{
				alert('Please log in first to make changes!');
			}
			else
			{
				/*
				 The 'id' passed through editContact(id) is the '_id' of 'contact' in the list
				 of ng-repeat="contact in contacts' in view/index.ejs
				 */
				console.log(id);

				
				/*
				 Extract current logged username from token.
				 */
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				console.log(payload);

				/*
				 Username extracted from token then stored in $scope.editUserId
				 so it can be passed to node in 'get method' to get contact-list
				 entries in mongodb under that username.
				 */
				$scope.editUserId = payload.username;
				console.log($scope.editUserId);


				/*
					Extracted username from payload token, assign to $scope.editUserId to pass to route in express
					with this format "http://localhost:3000/api/contacts/aa/555fab15fa9ab40407aee6e6"
				 */
				$http.get('/api/contacts/' + $scope.editUserId + '/' + id, {headers: {Authorization: 'Bearer ' + auth.getToken()}})
					.success(function (data) {
						/*
						 Here data is the AFTER CONVERTED JSON format of selected 'id' entry
						 then store them in formData which will AUTO DISTRIBUTE all ng-model
						 that has 'formData' connected to it in front like 'ng-model=formData.name'
						 */
						$scope.formData = data;

						console.log(data);
					})
					.error(function (data) {
						console.log('Error: ' + data);
					});
			}
		};
		
		/*
			This method use to update the contact list with new data and refresh page with new data.
		*/
		$scope.updateContact = function() {
			if (!auth.isLoggedIn()) {
				alert('Please log in first to make changes!');
			}
			else
			{
				/*
				 Extract current logged username from token.
				 */
				var token = auth.getToken();
				var payload = JSON.parse($window.atob(token.split('.')[1]));
				console.log(payload);

				/*
				 Username extracted from token then stored in $scope.updateUserId
				 so it can be passed to node in 'put method' to update contact-list
				 entries in mongodb under that username.
				 */
				$scope.updateUserId = payload.username;
				console.log($scope.updateUserId);


				/*
					$scope.formData._id has the '_id' scope of any entries that just got
				 	clicked "Edit' button
				*/
				console.log($scope.formData._id);

				$http.put('/api/contacts/' + $scope.updateUserId + '/' + $scope.formData._id, $scope.formData, {headers: {Authorization: 'Bearer ' + auth.getToken()}})
					.success(function (data) {
						$scope.formData = {};	//Set fields to blank after user input	//data is keyword do not change
						$scope.contacts = data;		//data = contacts in res.json(contacts) from route
						console.log(data);
					})
					.error(function (data) {
						console.log('Error: ' + data);
					});

				$scope.controllerRefreshAll();
			};
		}
}

AppCtrl.factory('auth', ['$http', '$window', function($http, $window)
{
	var auth = {};
	
	auth.saveToken = function(token)
	{
		$window.localStorage['contact-list-token'] = token;
	};
	
	
	auth.getToken = function ()
	{
		return $window.localStorage['contact-list-token'];
	}
	
	auth.isLoggedIn = function(){
		var token = auth.getToken();
		
		if(token)
		{
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			
			return payload.exp > Date.now() / 1000;
		} 
		else 
		{
			return false;
		}
	};
	
	auth.currentUser = function()
	{
		if(auth.isLoggedIn())
		{
			var token = auth.getToken();
			var payload = JSON.parse($window.atob(token.split('.')[1]));
			//console.log(payload);

			return payload.username;
		}
	};		
	
	auth.register = function(user)
	{
		return $http.post('/register', user).success(function(data){
		auth.saveToken(data.token);
		});
	};
	
	auth.logIn = function(user)
	{
		return $http.post('/login', user).success(function(data) {
			auth.saveToken(data.token);
		});
	};
	
	auth.logOut = function()
	{
		$window.localStorage.removeItem('contact-list-token');
	};
	return auth;
}])

AppCtrl.controller('NavCtrl', ['$scope','auth', function($scope, auth) {
	$scope.isLoggedIn = auth.isLoggedIn;
	$scope.currentUser = auth.currentUser;
	$scope.logOut = auth.logOut;
}]);

AppCtrl.controller('AuthCtrl', [
	'$scope',
	'$state',
	'auth',
	function($scope, $state, auth){
	  $scope.user = {};
		console.log($scope.user);
	  $scope.register = function(){
		auth.register($scope.user).error(function(error){
		  $scope.error = error;
		}).then(function(){
		  $state.go('home');
		});
	  };

	  $scope.logIn = function(){
		auth.logIn($scope.user).error(function(error){
		  $scope.error = error;
		}).then(function(){
		  $state.go('home');
		  $scope.controllerRefreshAll();
		});
	  };
}])

AppCtrl.config([
'$stateProvider',
'$urlRouterProvider',
function($stateProvider, $urlRouterProvider) {

  $stateProvider
    .state('home', {
      url: '/home',
	  templateUrl: '/home.html',
      controller: 'mainController',
    })
	.state('login', {
	  url: '/login',
	  templateUrl: '/login.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
		if(auth.isLoggedIn()){
		  $state.go('home');
		}
	  }]
	})
	.state('register', {
	  url: '/register',
	  templateUrl: '/register.html',
	  controller: 'AuthCtrl',
	  onEnter: ['$state', 'auth', function($state, auth){
		if(auth.isLoggedIn()){
		   console.log(auth.isLoggedIn());
		  $state.go('home');
		}
	  }]
	});
  $urlRouterProvider.otherwise('login');
}]);