/*
app.js
*/

/*jshint esversion: 6 */


var express = require("express"),
	app = express(),
	cookie = require('cookie'),
	md5 = require("md5"),
	port = process.env.PORT || 80;
var ObjectId = require('mongodb').ObjectID;

const { MongoClient } = require('mongodb');
const uri = require("./mongoConfig").uri;

async function dbInsert(collection, data) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	try {
		await client.connect();
		const table = client.db("dele").collection(collection);
		const result = await table.insertOne(data);
		return result.insertedId;
	} catch (err) {
		console.log(err);	
	} finally {
		await client.close();
	}
}

async function dbFetch(collection, query) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	try {
		await client.connect();
		const table = client.db("dele").collection(collection);
		// Query for a movie that has the query
		const result = await table.find(query, {})
		.toArray()
		.then(items => {
			return items
		});
		// since this method returns the matched document, not a cursor, print it directly
		//console.log(result);
		return result;
	} finally {
		await client.close();
	}
}

async function dbUpdate(collection, id, newRow) {
	const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
	try {
		await client.connect();
		const table = client.db("dele").collection(collection);
		console.log("ID to update:", id);
		const filter = { _id: ObjectId(id) };
		const options = { upsert: false };
		const updateDoc = {
			$set: newRow,
		};

		const result = await table.updateOne(filter, updateDoc, options);
		// since this method returns the matched document, not a cursor, print it directly
		//console.log(result);
		//return result;
	} finally {
		await client.close();
	}
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
			dbFetch("users", { $or: [{ username: req.query.emailOrUsername }, { email: req.query.emailOrUsername }]})
			.then((matchingUser) => {
				console.log(matchingUser);
				if (matchingUser.length == 0) res.json({ success: false });
				else if (matchingUser[0].password != req.query.password) res.json({ success: false });
				else {
					res.json({ 
						success: true,
						username: matchingUser[0].username
					});
				}
			}).catch(console.dir);
			break;

		case "addProfile":
			dbFetch("users", { $or: [{ username: req.query.username }, { email: req.query.email }]})
			.then((matchingUser) => {
				var result = { success: true };
				if (matchingUser) result.success = false;
				else {
					const data = {
						username: req.query.username,
						email: req.query.email,
						password: req.query.password
					};
					dbInsert("users", data)
					.then(() => {
						result.username = req.query.username;
						res.json(result)
					}).catch(console.dir);
				}
			}).catch(console.dir);
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
		dbFetch("projects", { owner: req.query.username })
		.then((rows) => {
			res.json({ projects: rows });
		}).catch(console.dir);
	break;

	case "createProject":
		dbInsert("projects", {
			name: req.query.projectName,
			owner: req.query.username
		})
		.then((newProjectID) => {
			// dbInsert("stages", {
			// 	name: "Empty Stage",
			// 	projectID: newProjectID.toString()
			// })
			// .then(() => {
			// 	res.json({ 
			// 		success: true,
			// 		project: newProjectID 
			// 	});
			// }).catch(console.dir);
			res.json({ 
				success: true,
				project: newProjectID 
			});
		}).catch(console.dir);
	break;

	case "getStages":
		dbFetch("stages", { projectID: req.query.projectID })
		.then((rows) => {
			res.json({ stages: rows });
		}).catch(console.dir);
	break;

	case "createStage":
		dbInsert("stages", {
			name: req.query.newStageName,
			projectID: req.query.projectID
		}).then(() => {
			res.json({ success: true });
		}).catch(console.dir);
	break;

	case "getStories":
		dbFetch("stories", { stageID: req.query.stageID })
		.then((rows) => {
			res.json({ stories: rows });
		}).catch(console.dir);
	break;

	case "createStory":
		dbInsert("stories", {
			name: req.query.newStoryName,
			stageID: req.query.stageID
		}).then(() => {
			res.json({ success: true });
		}).catch(console.dir);
	break;

	case "changeStory":
		dbUpdate("stories", req.query.storyID, {
			stageID: req.query.newStageID
		}).then(() => {
			res.json({ success: true });
		}).catch(console.dir);
	break;

	case "editStory":
		dbUpdate("stories", req.query.storyID, {
			name: req.query.newStoryName
		}).then(() => {
			res.json({ success: true });
		}).catch(console.dir);
	break;

	case "editProject":
		dbUpdate("projects", req.query.projectID, {
			name: req.query.newProjectName
		}).then(() => {
			res.json({ 
				success: true,
				project: req.query.projectID
			});
		}).catch(console.dir);
	break;
	}
});

// Where static content is served from.
app.use(express.static(__dirname + "/static/", { index: "index.html" }));

// Start server
app.listen(port);
console.log("Starting server on port", port);


