const log = console.log;
const AWS = require('aws-sdk');

// Global Variables
var TTL = 10
var REGION_NAME = 'us-east-1'


exports.handler = async (event) => {
    return getOldKeys(TTL);
};

function toTimestamp(strDate){
    var datum = Date.parse(strDate);
    return datum/1000
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
    
    oldKeyUsers = [];

    for (u in users) {
        var params = {
            UserName: u
           };
           accessKey = iam.listAccessKeys(params, function(err, data) {
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

        for (key in accessKey['AccessKeyMetadata']){
            tsKey = toTimestamp(key['CreateDate']);
            var today = new Date();
            var dd = String(today.getDate()).padStart(2, '0');
            var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
            var yyyy = today.getFullYear();

            today = mm + '/' + dd + '/' + yyyy;
            tsToday = toTimestamp(today);
            if (tsKey <=  tsToday) {
                

            }
       }
    }
    
}
