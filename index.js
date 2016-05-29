var ldap = require('ldapjs');
var Promise = require('promise');

HOST = 'ldap://ad.unsw.edu.au:389';
BASE_DN = 'OU=IDM,DC=ad,DC=unsw,DC=edu,DC=au';
DN_SUFFIX = '@ad.unsw.edu.au';


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
				  results.push(entry.object.displayName);
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
	}
	return queryAd(opts);
}

module.exports = {
	getUserName: getUserName
}