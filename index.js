var ldap = require('ldapjs');
var Promise = require('promise');

ZID = process.env.UNSW_ZID;
ZPASS = process.env.UNSW_ZPASS;
HOST = 'ldap://ad.unsw.edu.au:389';
BASE_DN = 'OU=IDM,DC=ad,DC=unsw,DC=edu,DC=au';
USER_DN = ZID + '@ad.unsw.edu.au';


function queryAd(opts) {
	var client = ldap.createClient({
		url: HOST
	});

	var promise = new Promise(function(resolve, reject){
		
		var results = [];
		client.bind(USER_DN, ZPASS, function(err){
			if (err) {
				console.log(err);
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

function getMe() {
	var opts = {
		filter: '(cn='+ZID+')',
		scope: 'sub',
		attributes: ['displayName']
	}
	return queryAd(opts);
}

function getUserName(zid) {
		var opts = {
		filter: '(cn='+zid+')',
		scope: 'sub',
		attributes: ['displayName']
	}
	return queryAd(opts);
}

module.exports = {
	getMe: getMe,
	getUserName: getUserName
}