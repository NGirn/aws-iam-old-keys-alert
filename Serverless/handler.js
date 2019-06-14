'use strict';

// Global Variables
const AWS = require('aws-sdk');
const TTL = 1;
const ARN = '';

module.exports.hello = async (event) => {
  await getOldKeys();
  };

// Function to convert date format into unix timestamp
async function toTimestamp(strDate){
  var datum = Date.parse(strDate);
  return datum/1000;
}

async function getOldKeys(){
  // Get the list of users
  var iam = await new AWS.IAM();
  var params = {};
  var users = await iam.listUsers(params).promise();
  
  var oldKeyUsers = [];
  
  //Iterate through list of users to access each users' data
  var arrayLength = users.Users.length;
  for (var i=0; i < arrayLength; i++) {
    var params = {
      UserName: users.Users[i].UserName
    };
    var accessKeyData = await iam.listAccessKeys(params).promise();
    var dateCreated = accessKeyData.AccessKeyMetadata[0].CreateDate;
    dateCreated = Date.parse(dateCreated);
    var tsCreated = dateCreated/1000
    
    //Creates today's date in a unix timestamp format
    var tsToday = Date.now() / 1000 | 0
    var threshold = tsToday - (TTL*86400)
    
    //Identifies which users are in need of rotating their keys
    if (tsCreated < threshold) {
      var usernameToRotate = accessKeyData.AccessKeyMetadata[0].UserName;
      oldKeyUsers.push(usernameToRotate);
    }

  }
  oldKeyUsers = oldKeyUsers.toString();
  //Sends SNS notification message containing a list of all the users that are required to rotate their access ID keys
  var sns = await new AWS.SNS();
  var params = {
      Message: oldKeyUsers, /* required */
      Subject: 'Users That Are Required To Change Their Access Keys',
      TopicArn: ARN
    };
  await sns.publish(params).promise();
}