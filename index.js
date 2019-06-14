// Global Variables
const AWS = require('aws-sdk');
const ARN = 'arn:aws:sns:us-east-1:317241229763:oldAccessKeyAlert';
var TTL = 1; // In days
var REGION_NAME = 'us-east-1';

// This runs when event is triggered
exports.handler = async (event) => {
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
    var params = {
      };
    var users = await iam.listUsers(params);
    
    console.log(users);
    var oldKeyUsers = [];

    // Iterate through list of users to access each users' data
    var arrayLength = users.length;
    for (var i = 0; i < arrayLength; i++) {
        var params = {
            UserName: users[i]
           };
        var accessKey = [];
        var accessKeyData = await iam.listAccessKeys(params, function(err, data) {
            if (err) console.log(err, err.stack); // an error occurred
            else     console.log(data);           // successful response
            /*
            data = {
             AccessKeyMetadata: [
            {
                AccessKeyId: "AKIA111111111EXAMPLE", 
                CreateDate: <Date Representation>, 
                Status: "Active", 
                UserName: "Alice"
            }, 
                 {
                AccessKeyId: "AKIA222222222EXAMPLE", 
                CreateDate: <Date Representation>, 
                Status: "Active", 
                UserName: "Alice"
               }
              ]
             }
             */
           });
        var tsKey;
        tsKey = accessKeyData.AccessKeyMetadata.CreateDate;
        tsKey = toTimestamp(tsKey);
        
        // Creates todays' date in a unix timestamp format
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();

        today = mm + '/' + dd + '/' + yyyy;
        var tsToday = toTimestamp(today);
        var threshold = tsToday - (TTL*86400) 

        // Compares timestamps for when the keys were created and today's timestamp minus the required TTL (time to live) of the access key
        if (tsKey <=  threshold) {
            // Adds user to a list of users required to rotate their access keys
            var username;
            username = accessKeyData.AccessKeyMetadata.UserName;
            oldKeyUsers.push(username);
       }
    }

    // Sending an SNS push notifcation of all users in the list that are required to rotate thier access keys
    var sns = new AWS.SNS();
    var params = {
        Message: 'oldKeyUsers', /* required */
        MessageAttributes: {
          '<String>': {
            DataType: 'String.Array', /* required */
          },
          /* '<String>': ... */
        },
        Subject: 'Users That Are Required To Change Their Access Keys',
        TopicArn: ARN
      };
    await sns.publish(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });

    return oldKeyUsers;    
}
