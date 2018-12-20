/*
 * control the motion program
 *
 * node index.js
 *
 * (c) Uwe Gerdes, entwicklung@uwegerdes.de
 */
'use strict';

var exec = require('child_process').execFile;

var verbose = false;
var status = { running: false };
var motionProcess = null;

function start(id, callback) {
	var cmd = "motion";
	var args = ['-n'];
	if (verbose) {
		console.log('starting: ' + cmd + ' ' + args.join(' '));
	}
	status.running = false;
	stop(id);
	status.running = true;
	motionProcess = exec(cmd, args,
		function (error, stdout, stderr) {
			console.log('finished ' + id + ((error) ? 'error: ' + error : ', all ok'));
		}
	);
	motionProcess.stdout.on('data', function(data) { console.log(id + ': ' + data.trim()); });
	motionProcess.stderr.on('data', function(data) { console.log(id + ' stderr: ' + data.trim()); });
	motionProcess.on('error', function(err) { console.log(id + ' error: ' + err.trim()); });
	motionProcess.on('close', function(code) {
		if (code > 0) {
			console.log('load ' + id + ' exit: ' + code);
		}
		status.running = false;
		if (callback) {
			callback(status);
		}
	});
}

function stop(id) {
	if (running()) {
		console.log('stopping motion ' + id);
		motionProcess.kill('SIGTERM');
		status.running = false;
	}
}

function running() {
	if (motionProcess && ! motionProcess.killed) {
		console.log("motion running");
		return true;
	} else {
		console.log("motion not running");
		return false;
	}
}

module.exports = {
	running: running,
	start: start,
	stop: stop
};

