/*
profile.js
*/

var app = angular.module("profilePage", ["ngCookies", "angular-md5"]); //

app.controller("profilePageController", ["$scope", "$http", "$window", "$cookies", "md5", function($scope, $http, $window, $cookies, md5) {
	$("#signup").hide();

	////////////////////////////////////////////////////////////////////////////////
	//
	//	LOGIN
	//

	$scope.loginSubmit = function () {
		if(!$scope.emailOrUsername || !$scope.loginPassword) {
			alert("Fields missing");
			console.log($scope.emailOrUsername, $scope.loginPassword)
			return;
		}

		var params = {
			action: "checkProfile",
			emailOrUsername: $scope.emailOrUsername,
			password: md5.createHash($scope.loginPassword)
		};

		$http.get("profileManager", { params: params }).then(function(res) {
			// success
			if (res.data.success) {
				console.log("Correct Password");
				localStorage.setItem('username', res.data.username);
				window.location.href = "main.html";
			}
			else {
				alert("Incorrect Username/Password");
			}
		}, function() {
			// failure
		});
	};

	////////////////////////////////////////////////////////////////////////////////
	//
	//	SIGNUP
	//

	$scope.signupSubmit = function () {
		if(!$scope.username || !$scope.email || !$scope.password) {
			alert("bad stuff");
			return;
		}

		var params = {
			action: "addProfile",
			name: $scope.name,
			username: $scope.username,
			email: $scope.email,
			password: md5.createHash($scope.password)
		};
		//console.log(params);
		$http.get("profileManager", { params: params }).then(function(res) {
			//success
			if (res.data.success) {
				window.location.href = "main.html";
			}
			else {
				alert("Username/Email already in use!");
			}
		}, function() {
			// failure
		});
	};

	$scope.swapTo = function(newForm) {
		$(".loginContainer").hide();
		$("#" + newForm).show();
	};

	////////////////////////////////////////////////////////////////////////////////
	//
	//	CHANGE PASSWORD
	//

	$scope.changePassword = function() {
		if(md5.createHash($scope.oldPassword) === $cookies.get("password")) {
			console.log("yo im here");
			var params = {
				action: "changePassword",
				username: $cookies.get("username"),
				password: md5.createHash($scope.newPassword)
			};
			//console.log(params);
			$http.get("profileManager", { params: params }).then(function(res) {
				//success
				if(res.data.passwordOk) {
					window.location.href = "myPage.html";
					console.log("going back");
				}

			}, function() {
				// failure
			});
		}
	};
	$scope.backToMainPage = function() {
		window.location.href = "myPage.html";
	};



}]);
