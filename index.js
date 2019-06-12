const AWS = require('aws-sdk');
const ARN = '';

// Global Variables
var TTL = 10; // In days
var REGION_NAME = 'us-east-1';

// This runs when event is triggered
exports.handler = async (event) => {
    return getOldKeys(TTL);
};

// Function to convert date format into unix timestamp
function toTimestamp(strDate){
    var datum = Date.parse(strDate);
    return datum/1000;
}


function getOldKeys(TTL){
    // Get the list of users
    var iam = new AWS.IAM();
    var params = {
        GroupName: 'None'
      };
    var users = iam.getGroup(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
      });
    
    var oldKeyUsers = [];

    // Iterate through list of users to access each users' data
    for (u in users) {
        var params = {
            UserName: u
           };
           var accessKey = iam.listAccessKeys(params, function(err, data) {
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
        
        // Scan each users' data to see when their keys were created
        for (key in accessKey['AccessKeyMetadata']){
            tsKey = toTimestamp(key['CreateDate']);

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
                var metadata = accessKey['AccessKeyMetaData']
                // Adds user to a list of users required to rotate their access keys
                oldKeyUsers.push(metadata['UserName']);

            }
       }
    }

    // Sending an SNS push notifcation of all users in the list that are required to rotate thier access keys
    var sns = new AWS.SNS();
    var params = {
        Message: oldKeyUsers, /* required */
        MessageAttributes: {
          '<String>': {
            DataType: 'String.Array', /* required */
          },
          /* '<String>': ... */
        },
        Subject: 'Users That Are Required To Change Their Access Keys',
        TargetArn: ARN,
        TopicArn: ARN
      };
    sns.publish(params, function(err, data) {
        if (err) console.log(err, err.stack); // an error occurred
        else     console.log(data);           // successful response
    });

    return oldKeyUsers;    
}
