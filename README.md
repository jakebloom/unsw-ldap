# UNSW-LDAP
This npm package provides basic funcitonality for interacting with UNSW's active directory server.

## Installation
    npm install unsw-ldap

## Usage
So far, we only have the two functions: `getUserName` and `isCSESoc`. They return promises - for `getUserName`, it resolves to the Full Name associated with the zID provided, if the password provided is correct. For `isCSESoc`, it resolves to either `true` or `false`, if the given zID is a CSESoc member. (This isn't perfect... yet)

## Example
    var unsw = require('unsw-ldap');
    
    unsw.getUserName("z1234567", "Password123").then(function(result){
        console.log(result) // Displays the name of whoever has zid z1234567
    });

    unsw.isCSESoc("z1234567", "Password123").then(function(result){
        console.log(result) // true if z1234567 is a CSESoc member, false otherwise
    });