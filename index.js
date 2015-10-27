var request = require("request");
var async = require('async');

var baseUrl = 'https://developers.crittercism.com/v1.0'


// require that 3 arguments are provided or show expected syntax
if (process.argv.length < 5) {
	console.log('node index.js [client ID] [username] [password]');
	console.log('node index.js [client ID] [username] [password] [app  name]');
	process.exit();
}

var args = {
	clientId: process.argv[2],
	username: process.argv[3],
	password: process.argv[4],
	appName: process.argv[5]
};

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
		var parsed = JSON.parse(body);
		onLoginSuccess(parsed.access_token);
	  } else {
	  	console.log(body);
	  }
	});


function onLoginSuccess(access_token) {
	console.log('Token successfully generated.');
	doGet('/apps?attributes=appName,appType', access_token, function(e, r, body) {
		var apps = JSON.parse(body);
		var series = [];
		for (var id in apps) {
			if (!args.appName || apps[id].appName == args.appName)  {
				console.log('Found app id ' + id);
				series.push(showCrashCounts(id, apps[id], access_token));
			}
		}
		console.log(series.length + ' apps total.');
		async.series(series);
	});
}	


function showCrashCounts(id, app, access_token) {
	return function(callback) {
		var appTitle =  '"' + app.appName + '" (' + app.appType + ')';
		var path = '/app/' + id + '/crash/counts';
		console.log('Showing crash counts for ' + appTitle + ', taken from ' + path + ':');
		doGet(path, access_token, function(e, r, body) {
			var stats = JSON.parse(body);
			for (var i in stats) {
				console.log('--' + stats[i].date + ': ' + stats[i].value);
			}
			callback();
		});
	};
}

function doGet(path, access_token, callback) {
	request.get(baseUrl + path, callback).auth(null, null, true, access_token);	
}

function doGetToConsole(path, access_token, caption, callback) {
	request.get(baseUrl + path, function (e, r, body) {
		console.log(caption + ": " + body);
	}).auth(null, null, true, access_token);	
}