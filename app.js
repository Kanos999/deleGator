
//
"use strict";

var server = require("./js/server").server,
	service = require("./js/service"),
	serviceName = "Kane's Green Server";

if (process.argv[2]) {
	var installing = process.argv[2] === "--install" || process.argv[2] === "-i",
		uninstalling = process.argv[2] === "--uninstall" || process.argv[2] === "-u",
		genericStart = process.argv[2] === "--run";

	if (installing) {
		service.install(__filename, serviceName);
	}
	else if (uninstalling) {
		service.uninstall(__filename, serviceName);
	}
	else if (genericStart) {
		service.runNonWinService();
	}
	else {
		console.log("\nTo install or uninstall as a service:\n")
		console.log("\tnode app [-i | -u ]");
		process.exit(0);
	}
}
else { // no params - run directly
	console.log("Use -i to install service, -u to uninstall");
	server();
}
