// service.js - this module installs the server as a service.
/*
*  os-service requires compiling on the target machine (which on a Windows machine requires MSVC++)
*  node-windows deploys normally so it is used when Windows is the OS.
*
* */

"use strict";

var isWindows = /^win/.test(process.platform),
	module = isWindows ? "node-windows" : "node-linux",
	Service = require(module).Service;

exports.install = function(appRoot, serviceName) {
	console.log("Installing...");
	var service = new Service({
			name: serviceName,
			description: serviceName,
			script: appRoot
		});
	service.on("install", function () {
		console.log("Installation complete\nStarting server...");
		service.start();
	});
	service.install();
};

exports.uninstall = function(appRoot, serviceName) {
	console.log("Uninstalling...");
	var service = new Service({
			name: serviceName,
			description: serviceName,
			script: appRoot
		});
	service.on("uninstall", function () {
		console.log("Uninstall complete.");
	});
	service.uninstall();
};
