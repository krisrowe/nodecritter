var request = require("request");
var async = require('async');
var dateFormat = require('dateformat');

var baseUrl = 'https://developers.crittercism.com/v1.0'


// require that 3 arguments are provided or show expected syntax
if (process.argv.length < 5) {
	console.log('node index.js [client ID] [username] [password]');
	console.log('node index.js [client ID] [username] [password] [app  name]');
	console.log('node index.js [client ID] [username] [password] [app  name] [app version]');
	process.exit();
}

// Read command line arguments.
var args = {
	clientId: process.argv[2],
	username: process.argv[3],
	password: process.argv[4],
	appName: process.argv[5],
	appVersion: process.argv[6]
};


main(); // run the script

function main() {
	var data = {
		grant_type: 'password',
		username: args.username,
		password: args.password
	}

	var params = {url: baseUrl + '/token', formData: data};
	params.auth = {
		user: args.clientId,
		password: '',
		sendImmediately: true
	}

	request.post(params, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	  	console.log('Token successfully generated.');
		var accessToken = JSON.parse(body).access_token;
		get('/apps?attributes=appName,appType,appVersions', accessToken, function(e, r, body) {
			var apps = JSON.parse(body);
			//console.log(body);
			var series = [];
			for (var id in apps) {
				if (!args.appName || apps[id].appName == args.appName)  {
					console.log('Found app id ' + id);
					//series.push(showCrashCounts(id, apps[id], accessToken));
					var appName =  '"' + apps[id].appName + '" (' + apps[id].appType + ')';
					series.push(createBuildTableAction(id, appName, accessToken));
				}
			}
			console.log(series.length + ' apps total.');
			async.series(series);
		});
	  } else {
	  	console.log('Failed to generate token: ' + error);
	  }
	});
}


function createBuildTableAction(appId, appName, accessToken)
{
	return function(callback) {
		buildTable(appId, appName, accessToken);
		callback();
	}
}

function createAddToTableAction(appId, subject, rows, accessToken) {
	return function(callback) { getGraph(appId, subject, accessToken, function(graph, values) {
			addToTable(rows, subject, graph, values);
			callback();
		}
	)};
}

function buildTable(appId, appName, accessToken) {
	var rows = [];
	var series = [];

	series.push(createAddToTableAction(appId, "dau", rows, accessToken));
	series.push(createAddToTableAction(appId, "appLoads", rows, accessToken));
	series.push(createAddToTableAction(appId, "crashes", rows, accessToken));
	series.push(createAddToTableAction(appId, "crashPercent", rows, accessToken));
	series.push(createAddToTableAction(appId, "affectedUsers", rows, accessToken));
	series.push(createAddToTableAction(appId, "affectedUserPercent", rows, accessToken));
	series.push(createAddToTableAction(appId, "rating", rows, accessToken));
	series.push(createAddToTableAction(appId, "mau", rows, accessToken));

	series.push(function(callback) {
		console.log('************ APP ' + appId + ' ' + appName + ' ******************')
		for (var i in rows) {
			var rowString = '';
			for (var j in rows[i]) {
				if (rowString.length > 0) {
					rowString += ',';
				}
				rowString += rows[i][j];
			}
			console.log(rowString);
		}
		callback();
	});

	async.series(series);
}

function addToTable(rows, fieldName, graph, values) {
	var startDate = new Date(graph.data.start);
	// When the JSON date/time is parsed above, it is recognized as UTC, so it computes an offset for 
	// local time and the date changes. We are correcting that with the below so that the Date object
	// will have the original values for date, hour, etc.
	startDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate(), 
		startDate.getUTCHours(), startDate.getUTCMinutes(), startDate.getUTCSeconds());
	// The start date as reported by the API is not actually included in the results, though the end
	// date (which is today) is included. We thus need to increment the reported start date by one day
	// in terms of how we interpret the rows of data and what date the apply to.
	startDate.setDate(startDate.getDate() + 1);
	if (rows.length > 0) {
		if (values.length != (rows.length - 1)) {
			throw "Values range mismatch.";
		}
	} else {
		// create header row
		rows.push([]);
	}
	// add columns in header row
	rows[0].push('Date');
	rows[0].push(fieldName);

	for (var i = 0; i < values.length; i++) {
		var rowDate = new Date(startDate.getTime()); // copy the start date
		rowDate.setDate(startDate.getDate() + i); // increment the day of the month by the row index
		// Ensure we have enough elements in the rows array to cover the header row 
		// and all data rows up to the current one being populated.
		if (rows.length < (i + 2)) {
			rows.push([]); // adds a row
		}
		rows[i + 1].push(dateFormat(rowDate, 'yyyy-mm-dd')); // add a column for the date
		rows[i + 1].push(values[i]); // add a column for the value
	}
}

// The subject may be "dau", "mau", "rating" "appLoads", "crashes", "crashPercent", "affectedUsers", or "affectedUserPercent".
function getGraph(appId, subject, accessToken, callback) {
	var body = {
		"params": {
			"appId": appId,
			"graph": subject, 
			"duration": 86400
		}
	};
	// note that 'mau' does not support filters
	if (args.appVersion && subject != "mau") {
		body.params.filters = { appVersion: args.appVersion };
	}

	post('/errorMonitoring/graph', body, accessToken, function(body) {
		var values = [];
		if (!body) {
			console.log('No data available.');
		} else {
			for (var i in body.data.series[0].points) {
				values.push(body.data.series[0].points[i]);
			}
		}
		callback(body, values);
	});
}

/*
function showCrashCounts(id, app, accessToken) {
	return function(callback) {
		var appTitle =  '"' + app.appName + '" (' + app.appType + ')';
		var path = '/app/' + id + '/crash/counts';
		console.log('Showing crash counts for ' + appTitle + ', taken from ' + path + ':');
		get(path, accessToken, function(e, r, body) {
			var stats = JSON.parse(body);
			for (var i in stats) {
				console.log('--' + stats[i].date + ': ' + stats[i].value);
			}
			callback();
		});
	};
}
*/

function post(path, body, accessToken, callback)  {
	var params = {url: baseUrl + path, json: body};
	request.post(params, function (error, response, body) {
	  if (!error && response.statusCode == 200) {
	    callback(body);
	  } else {
	  	console.log('failed post: ' + JSON.stringify(body));
	  	callback(error);
	  }
	}).auth(null, null, true, accessToken);
}

function get(path, accessToken, callback) {
	request.get(baseUrl + path, callback).auth(null, null, true, accessToken);	
}