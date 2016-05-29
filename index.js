var ldap = require('ldapjs');
var Promise = require('promise');

HOST = 'ldap://ad.unsw.edu.au:389';
BASE_DN = 'OU=IDM,DC=ad,DC=unsw,DC=edu,DC=au';
DN_SUFFIX = '@ad.unsw.edu.au';
CSE_DEGREE = /(4515|3978|3963|3968|3772|3969|3983),OU=Program/;


function queryAd(opts) {
	var client = ldap.createClient({
		url: HOST
	});

	var promise = new Promise(function(resolve, reject){
		
		var results = [];
		client.bind(opts.zid + DN_SUFFIX, opts.zpass, function(err){
			if (err) {
				reject(err);
			}

			opts = opts || {};
			client.search(BASE_DN, opts, function(err, res){
				if (err) {reject(err);}

				res.on('searchEntry', function(entry) {
				  results.push(entry.object);
				});
				
				res.on('error', function(err) {
				    reject(err.message);
				});
				
				res.on('end', function(result) {
					client.unbind(function(err){
						if (err){reject(err);}
						resolve(results);
					});
				});
			});
		});
	});
	return promise;
}

function getUserName(zid, zpass) {
	var opts = {
		zid: zid,
		zpass: zpass,
		filter: '(cn='+zid+')',
		scope: 'sub',
		attributes: ['displayName']
	};

	var promise = new Promise(function(resolve, reject){
		queryAd(opts).then(function(val){
			resolve(val[0].displayName);
		},
		function(){
			reject();
		});
	});

	return promise;
}

function isCSESoc(zid, zpass){
	var opts = {
		zid: zid,
		zpass: zpass,
		filter: '(cn='+zid+')',
		scope: 'sub',
		attributes: ['memberOf']
	};

	var d = new Date();
	var currentSem = d.getMonth() <= 5 ? '1' : '2';
	var year = d.getFullYear().toString().substring(2,4);
	var compCourse = new RegExp('COMP[0-9]{4}_T'+currentSem+'_5'+year);
	
	var promise = new Promise(function(resolve, reject){
		queryAd(opts).then(
			function(res){
				var membership = res[0].memberOf;
				membership.forEach(function(mem){
					if (mem.match(compCourse) || mem.match(CSE_DEGREE)){
						resolve(true);
					}
				});
				resolve(false);
			},
			function(){
				resolve(false);
			}
		);	
	});
	return promise;
}

module.exports = {
	getUserName: getUserName,
	isCSESoc: isCSESoc
}