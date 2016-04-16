/*
 * Serve JSON to our AngularJS client
 */

var Promise = require('bluebird');
var exec = require('child_process').exec;
var debug = require('debug')('api');
var fs = require('fs');
var doT = require('dot');

var config;

var loadConfig = function loadConfig(){
	var rawconfig = fs.readFileSync(__dirname + '/../config.json', {encoding:'utf8'});
	var config1 = JSON.parse(rawconfig);
	if( config1.variables ){
		config = JSON.parse( doT.template(rawconfig)(config1.variables) );
	}else{
		config = config1;
	}
	rawconfig = null;
	config1 = null;
	require('debug')('config')('CONFIG', JSON.stringify(config, null, 2));
}
loadConfig();

exports.config = function(req, res){
  var pages = {};
  for (var page in config.pages) {
  	pages[page] = config.pages[page].name;
  }
  res.json({
  	start_page: config.start_page || "Main",
  	pages: pages
  });
}

exports.page = function (req, res) {
	var id = req.params.id;
	var page = config.pages[id];
	if( page ){
		var ret = {
			name: page.name,
			id: id,
			groups: {}
		};
		var groups = page.groups;
		for( var groupid in groups ){
			var group = groups[groupid];
			var g_ret = {
				id: groupid,
				name: group.name,
				scripts: {}
			};
			for( var scriptid in group.scripts ){
				var script = group.scripts[scriptid];
				var s_ret = {
					id: scriptid,
					name: script.name,
					glyph: script.glyph,
					btn: script.btn
				};
				g_ret.scripts[scriptid] = s_ret;
			}
			ret.groups[groupid] = g_ret;
		}

		res.json( ret );
		return;
	}
	res.status(404).send('Not Found');
};

var in_progress = {};

var execPromise = function execPromise(cmd){
	return new Promise(function(resolve, reject){
		debug('EXEC', cmd);
		var child = exec(cmd);
		var output = [];
		child.addListener('error', reject);
		child.stdout.on('data', function(data){
			output.push(data);
		});
		child.stderr.on('data', function(data){
			output.push(data);
		});
		child.addListener('exit', function(code, signal){
			debug('EXEC exit', code);
			resolve(output.join(''));
		});
	});
}
var doScript = function doScript(cmdKey, commands){
	debug('Running command set', cmdKey);
	if( in_progress[cmdKey] ){
		debug('Command set in progress');
		return 'in_progress';
	}
	in_progress[cmdKey] = 'true';
	var output = [];
	var async_cmds = [];
	var p = Promise.resolve('');
	commands.forEach(function(cmd){
		if( cmd.startsWith('&') ){
			output.push('>>' + cmd + '\n');
			async_cmds.push(execPromise(cmd.substring(1)));
		}else{
			p = p.then(function(out){
				output.push(out);
				output.push('>>' + cmd + '\n');
				return execPromise(cmd);
			});
		}
	});
	async_cmds.push(p);
	Promise.all(async_cmds).then(function(outs){
		for(var i=0; i<outs.length; i++)
			output.push(outs[i]);
		debug('Command set Done', cmdKey);
		debug(output);
		in_progress[cmdKey] = false;
	}).catch(function(err){
		debug('ERROR', err);
		debug(output.join(''));
		in_progress[cmdKey] = false;
	});
	return 'queued';
};

exports.runScript = function (req, res) {
	var page_id = req.params.page_id;
	var group_id = req.params.group_id;
	var script_id = req.params.script_id;
	var page = config.pages[page_id];
	if( !page ){return res.status(404).send('Not Found');}
	var group = page.groups[group_id];
	if( !group ){return res.status(404).send('Not Found');}
	var script = group.scripts[script_id];
	if( !script ){return res.status(404).send('Not Found');}

	var cmdKey = page_id + ':' + group_id + ':' + script_id;
	var result = doScript(cmdKey, script.commands);
	res.json({result:result});
}
