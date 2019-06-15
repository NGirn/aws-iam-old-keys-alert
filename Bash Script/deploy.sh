#!/bin/bash

aws cloudformation create-stack --stack-name awsIamOldKeyAlertScript --template-url https://ngirntest.s3.amazonaws.com/cloudformer.serverless.iamKeyAlert.template

echo Stack Created Successfully
echo Check Your AWS Account To Monitor Cloud Formation Progress
