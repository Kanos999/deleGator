/*
server.js
*/

// The one and only server function
/*jshint esversion: 6 */

exports.server = function() {

	var express = require("express"),
		app = express(),
		mysql = require("mysql"),
		cookie = require('cookie'),
		md5 = require("md5"),
		port = 81;

	var pool = mysql.createPool({
		connectionLimit: 5,
		host: "localhost",
		user: "kane",
		password: "kanos999",
		database: "mindmappr",
		timezone: "utc"
	});

	function dbQuery(sql, callback) {
		pool.getConnection((err, connection) => {
			if (!err) {
				connection.query(sql, function(err, rows) {
					if (!err) {
						callback(null, rows);
					}
					else {
						callback(err);
					}
				});
				connection.release();
			}
		});
	}

	////////////////////////////////////////////////////////////////////////////////
	//
	//	LOGIN + SIGNUP FUNCTIONS
	//

	app.get("/profileManager", (req, res) => {
		var action = req.query.action,
			sql;

		switch (action) {
			case "checkProfile":
				console.log(req.query);
			sql = `SELECT * from users WHERE (username = '${req.query.emailOrUsername}' OR email = '${req.query.emailOrUsername}') AND password = '${req.query.password}'`;
			dbQuery(sql, function(err, rows) {
				var result = { passwordOk: false };
				if (rows.length) {
					result.passwordOk = true;
					res.cookie("username", rows[0].username);
					res.cookie("password", rows[0].password);
				}
				res.json(result);
			});
			break;

			case "addProfile":
			sql = `SELECT * from users WHERE username = '${req.query.username}' OR email = '${req.query.email}'`;
			dbQuery(sql, function(err, rows) {
				var result = { newUser: true };
				if (rows.length) {
					result.newUser = false;
				}
				else {
					sql = `INSERT INTO users (username, email, password) VALUES ('${req.query.username}', '${req.query.email}', '${req.query.password}')`;
					dbQuery(sql, function(err, rows) {});
					res.cookie("username", req.query.username);
					res.cookie("password", req.query.password);
				}
				res.json(result);
			});
			break;

			case "changePassword":
			res.cookie("password", req.query.password);
			sql = `UPDATE users SET password = '${req.query.password}' WHERE username = '${req.query.username}'`;
			dbQuery(sql, function(err, rows) {});
			res.json({passwordOk:true});
			break;
		}
	});

	////////////////////////////////////////////////////////////////////////////////
	//
	//	MAIN PAGE FUNCTIONS
	//

	app.get("/myPageManager", (req, res) => {
		var action = req.query.action,
			sql;

		switch (action) {
		case "getProjects":
			sql = `SELECT * from projects WHERE owner = '${req.query.username}'`;
			dbQuery(sql, function(err, rows) {
				res.json({
					rows: rows
				});
			});
		break;

		case "createProject":
			sql = `INSERT INTO projects (name, owner) VALUES ('${req.query.projectName}', '${req.query.username}')`;
			dbQuery(sql, function(err, rows) {
				sql = `SELECT * from projects WHERE owner = '${req.query.username}'`;
				dbQuery(sql, function(err, rows) {
					var newProjectSerial = rows[rows.length-1].serial;
					sql = `INSERT INTO stages (name, projectSerial) VALUES ('To Do', '${newProjectSerial}'), ('Doing', '${newProjectSerial}'), ('Review', '${newProjectSerial}')`;
					dbQuery(sql, function(err, rows) {
						res.json({ success: true });
					});
				});
			});
		break;

		case "getStages":
			sql = `SELECT * from stages WHERE projectSerial = '${req.query.projectSerial}'`;
			dbQuery(sql, function(err, rows) {
				res.json({
					rows: rows
				});
			});
		break;

		case "createStage":
			sql = `INSERT INTO stages (name, projectSerial) VALUES ('${req.query.newStageName}', '${req.query.projectSerial}')`;
			dbQuery(sql, function(err, rows) {
				res.json({ success: true });
			});
		break;

		case "getStories":
			sql = `SELECT * from stories WHERE stageSerial = '${req.query.stageSerial}'`;
			dbQuery(sql, function(err, rows) {
				res.json({
					rows: rows
				});
			});
		break;

		case "createStory":
			sql = `INSERT INTO stories (name, stageSerial) VALUES ('${req.query.newStoryName}', '${req.query.stageSerial}')`;
			dbQuery(sql, function(err, rows) {
				res.json({ success: true });
			});
		break;

		case "changeStory":
			sql = `UPDATE stories SET stageSerial = '${req.query.newStageSerial}' WHERE serial = '${req.query.storySerial}'`;
			dbQuery(sql, function(err, rows) {
				res.json({success: true});
			});
		break;

		case "editStory":
			sql = `UPDATE stories SET name = '${req.query.newStoryName}' WHERE serial = '${req.query.storySerial}'`;
			dbQuery(sql, function(err, rows) {
				//console.log(sql);
				res.json({success: true});
			});
		break;

		case "editProject":
			sql = `UPDATE projects SET name = '${req.query.newProjectName}' WHERE serial = '${req.query.projectSerial}'`;
			dbQuery(sql, function(err, rows) {
				res.json({success: true});
			});
		break;
		}
	});

	// Where static content is served from.
	app.use(express.static(__dirname + "/../static/", { index: "index.html" }));

	// Start server
	app.listen(port);
	console.log("Starting server on port", port);
};
