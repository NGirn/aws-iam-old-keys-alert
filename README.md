# AWS IAM Old Key Alert

This scans users created by IAM for the dates when their public access keys were created. It then checks to see how old they are. If they are older than a certain age (in days), SNS sends a push notification to all subscription methods. The notification will contain a list of all the users that are required to rotate their public access keys.

The architecture is as follows:

![overviewLambda](https://user-images.githubusercontent.com/49638854/59151733-5758a000-8a30-11e9-8135-9ecaf08f13df.png)

As you can see, we have a CloudWatch Event based trigger which feeds into a Lambda function which accesses IAM and then sends push notifications via SNS.

![cloudwatch2minrate](https://user-images.githubusercontent.com/49638854/59151962-6bea6780-8a33-11e9-901d-0a32e122045b.png)

CloudWatch is set to trigger the Lambda function every 2 minutes

![sns2](https://user-images.githubusercontent.com/49638854/59151968-7efd3780-8a33-11e9-9aea-9d44b7a796ab.png)

SNS is configured to send out an Email notification. The ARN corresponds to the ARN in the code which can of course be changed. Likewise, other subscription methods can also be added.

![roles](https://user-images.githubusercontent.com/49638854/59151964-76a4fc80-8a33-11e9-9fb3-4214fe8ed813.png)

The above roles are for the Lambda function ensuring it has all the permissions it needs to execute its job.

Once you are aware of which users require new access keys, create the new keys and update any applications using the old keys then test to see if everything still works.
Change the state of the old keys to inactive and once again check to see that everything still works. Now it is safe to delete the old keys.