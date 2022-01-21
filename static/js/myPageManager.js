/*
myPageManager.js
*/

var app = angular.module("myPage", ["ngCookies"]);

app.controller("mainController", ["$scope", "$http", "$window", "$cookies", "$compile", function($scope, $http, $window, $cookies, $compile) {

	$(".dim").hide();
	$(".projectDropdown").hide();
	$(".stageDropdown").hide();
	$(".storyDropdown").hide();

	////////////////////////////////////////////////////////////////////////////////
	//
	//	FETCHING FUNCTIONS
	//

	$scope.stories = [];
	var currentProject = -1;
	function refreshProjects() {
		var params = {
			action: "getProjects",
			username: $cookies.get("username"),
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.projects = res.data.rows;
			manuallyGetStages(res.data.rows[0].serial);
			$("#project" + res.data.rows[0].serial).addClass("selectedProject");
		}, function() {
			// failure
			console.log("FAIL");
		});
	}
	refreshProjects();


	$scope.getStages = function(serial) {
		currentProject = serial;
		$(".card").removeClass("selectedProject");
		$("#project" + currentProject).addClass("selectedProject");
		var params = {
			action: "getStages",
			projectSerial: serial
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.stages = res.data.rows;
		}, function() {
			// failure
			console.log("FAIL");
		});
	};

	$scope.getStories = function(stage, stageIndex) {
		//console.log(stage);
		var params = {
			action: "getStories",
			stageSerial: stage.serial
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.stories[stageIndex] = res.data.rows;
		}, function() {
			// failure
			console.log("FAIL");
		});
	};

	////////////////////////////////////////////////////////////////////////////////
	//
	//	DRAG AND DROP FUNCTIONALITY
	//

	var oldX;
	$("body").mousemove(function(e) {
		//console.log(e);
		var degree = (e.pageX - oldX);
		if($scope.currentStory !== 0) {
			$("#tempStory").css({
				"top": e.pageY,
				"left": e.pageX,
				WebkitTransform: 'rotate(' + degree + 'deg)',
				opacity: 0.6
			});
		}
		oldX = e.pageX;
	});

	$scope.currentStory = 0;
	$scope.moveStory = function(story) {
		$scope.currentStory = story;
		$("body").css({"user-select": "none"});
	};
	$scope.dropStory = function(stage) {
		if($scope.currentStory !== 0) {
			$("#tempStory").css({opacity: 0});
			$("body").css({"user-select": "auto"});

			var params = {
				action: "changeStory",
				storySerial: $scope.currentStory.serial,
				newStageSerial: stage.serial
			};
			$http.get("myPageManager", { params: params }).then(function(res) {
				//success
				if(res.data.success) {
					manuallyGetStages(currentProject);
				}
			}, function() {
				// failure
				console.log("FAIL");
			});
			$scope.currentStory = 0;
		}
	};

	function manuallyGetStages(projectSerial) {
		$(".card").removeClass("selectedProject");
		$("#project" + projectSerial).addClass("selectedProject");
		var params = {
			action: "getStages",
			projectSerial: projectSerial
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.stages = res.data.rows;
		}, function() {
			// failure
			console.log("FAIL");
		});
	}

	////////////////////////////////////////////////////////////////////////////////
	//
	//	PROJECT-RELATED FUNCTIONS
	//

	$scope.openProjectDropdown = function(project) {
		if(project) {
			$scope.currentProjectName = "Edit project '" + project.name + "'";
		} else {
			$scope.currentProjectName = "Create a Project";
		}
		$(".dim").fadeIn(200);
		$(".projectDropdown").fadeIn(200);
	};

	$scope.hideAll = function() {
		$(".dim").fadeOut(200);
		$(".projectDropdown").fadeOut(200);
		$(".stageDropdown").fadeOut(200);
		$(".storyDropdown").fadeOut(200);
	};

	$scope.submitProjectChanges = function() { //Fuction for creating and editing projects
		var params;
		if($scope.currentProjectName === "Create a Project") {
			params = {
				action: "createProject",
				username: $cookies.get("username"),
				projectName: $scope.newProjectName
			};
		} else {
			params = {
				action: "editProject",
				projectSerial: currentProject,
				newProjectName: $scope.newProjectName
			};
		}
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			if(res.data.success) {
				$(".dim").fadeOut(200);
				$(".projectDropdown").fadeOut(200);
				refreshProjects();
			}
		}, function() {
			// failure
			console.log("FAIL");
		});
	};

	////////////////////////////////////////////////////////////////////////////////
	//
	//	STAGE-RELATED FUNCTIONS
	//

	$scope.openStageDropdown = function(stage) {
		$scope.currentStageName = "Add a Stage";
		$(".dim").fadeIn(200);
		$(".stageDropdown").fadeIn(200);
	};

	$scope.submitStageChanges = function() { //Fuction for creating and editing stages
		var params = {
			action: "createStage",
			projectSerial: currentProject,
			newStageName: $scope.newStageName
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			if(res.data.success) {
				$(".dim").fadeOut(200);
				$(".stageDropdown").fadeOut(200);
				manuallyGetStages(currentProject);
			}
		}, function() {
			// failure
			console.log("FAIL");
		});
	};

	////////////////////////////////////////////////////////////////////////////////
	//
	//	STORY-RELATED FUNCTIONS
	//

	var currentStageSerial;
	var currentStorySerial;
	$scope.openStoryDropdown = function(stageSerial, story) {
		currentStageSerial = stageSerial;
		if(story) {
			$scope.currentStoryName = "Edit story '" + story.name + "'";
			currentStorySerial = story.serial;
		} else {
			$scope.currentStoryName = "Add a Story";
		}
		$(".dim").fadeIn(200);
		$(".storyDropdown").fadeIn(200);
	};

	$scope.submitStoryChanges = function() { //Fuction for creating and editing stories
		console.log("REEEE");
		var params;
		if($scope.currentStoryName === "Add a Story") {
			params = {
				action: "createStory",
				stageSerial: currentStageSerial,
				newStoryName: $scope.newStoryName
			};
		} else {
			params = {
				action: "editStory",
				storySerial: currentStorySerial,
				newStoryName: $scope.newStoryName
			};
		}
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			if(res.data.success) {
				$(".dim").fadeOut(200);
				$(".storyDropdown").fadeOut(200);
				manuallyGetStages(currentProject);
			}
		}, function() {
			// failure
			console.log("FAIL");
		});
	};

}]);
