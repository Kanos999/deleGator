/*
myPageManager.js
*/

var app = angular.module("myPage", ["ngCookies"]);

app.controller("mainController", ["$scope", "$http", "$window", "$compile", function($scope, $http, $window, $compile) {

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
		console.log("CURRENT SIGN IN:", localStorage.getItem('username'));
		var params = {
			action: "getProjects",
			username: localStorage.getItem('username'),
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.projects = res.data.projects;
			if (currentProject == -1) currentProject = res.data.projects[0]._id.toString();
		}, function() {
			// failure
			console.log("FAIL");
		});
	}
	refreshProjects();
	manuallyGetStages(currentProject);


	$scope.getStages = function(projectID) {
		$scope.stages = [];
		currentProject = projectID;
		$(".card").removeClass("selectedProject");
		$("#project" + currentProject).addClass("selectedProject");
		var params = {
			action: "getStages",
			projectID: projectID
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.stages = res.data.stages;
		}, function() {
			// failure
			console.log("FAIL");
		});
	};

	$scope.getStories = function(stage, stageIndex) {
		//console.log(stage);
		var params = {
			action: "getStories",
			stageID: stage._id
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.stories[stageIndex] = res.data.stories;
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
				storyID: $scope.currentStory._id,
				newStageID: stage._id
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

	function manuallyGetStages(projectID) {
		$(".card").not("#project" + projectID).removeClass("selectedProject");
		$("#project" + projectID).addClass("selectedProject");
		var params = {
			action: "getStages",
			projectID: projectID
		};
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			$scope.stages = res.data.stages;
			$("#project" + projectID).addClass("selectedProject");
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
				username: localStorage.getItem("username"),
				projectName: $scope.newProjectName
			};
		} else {
			params = {
				action: "editProject",
				projectID: currentProject,
				newProjectName: $scope.newProjectName
			};
		}
		$http.get("myPageManager", { params: params }).then(function(res) {
			//success
			if(res.data.success) {
				$(".dim").fadeOut(200);
				$(".projectDropdown").fadeOut(200);
				refreshProjects();
				console.log("ONLY THING:", res.data);
				manuallyGetStages(res.data.project);
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
			projectID: currentProject,
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

	var currentStageID;
	var currentStoryID;
	$scope.openStoryDropdown = function(stageID, story) {
		currentStageID = stageID;
		if(story) {
			$scope.currentStoryName = "Edit story '" + story.name + "'";
			currentStoryID = story._id;
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
				stageID: currentStageID,
				newStoryName: $scope.newStoryName
			};
		} else {
			params = {
				action: "editStory",
				storyID: currentStoryID,
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
