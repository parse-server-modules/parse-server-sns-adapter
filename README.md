### Parse Amazon SNS Push Adapter

This project leverages the Amazon Simple Notification Service (SNS), which attempts to abstract away the complexities of 
different push notification systems.  Currently, there is only support for iOS (Apple Push Notification Service) and Android (Google Cloud Messaging) devices.   To add other push types, you simply need to know what kind of payload format to be sent.  This adapter leverages code from the [parse-server-push-adapter](https://github.com/parse-server-modules/parse-server-push-adapter) repo.  See the [Amazon documentation](http://docs.aws.amazon.com/sns/latest/dg/mobile-push-send-custommessage.html) if you wish to add other types.

[![Build
Status](https://travis-ci.org/parse-server-modules/parse-server-sns-adapter.svg?branch=master)](https://travis-ci.org/parse-server-modules/parse-server-sns-adapter)
[![codecov.io](https://codecov.io/github/parse-server-modules/parse-server-sns-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-server-modules/parse-server-sns-adapter?branch=master)
[![NPM Version](https://img.shields.io/npm/v/parse-server-sns-adapter.svg?style=flat-square)](https://www.npmjs.com/package/parse-server-sns-adapter)

#### Setup

The steps basically entail:

* Adding Platform endpoints to AWS console 
   * Apple requires you loading the prod/development certificates.
* Setup an IAM role for platform endpoints.
* Generate AWS access key and secret with this authorized IAM role.
* Enable CloudSearch logs for debugging.
* Configure Parse server

#### Configurating Platform Endpoints

1. Sign into the Amazon Web Services (AWS) Console.
2. Select the `SNS` Service.
3. Select `Create Platform Application`.
     * For GCM setup, you must provide an API key.  See the [instructions](https://github.com/ParsePlatform/parse-server/wiki/Push#gcm-android) about how to generate this key.
     * For APNS setup, you must generate an SSL certificate that can connect to Apple's servers.  See step #1 of this [tutorail](https://github.com/ParsePlatform/PushTutorial/blob/master/iOS/README.md#1-creating-the-ssl-certificate).  You will need to choose between `Apple Production` and `Apple Development` depending on the cert generated.
4. Record the Amazon Resource Number (ARN) associated with this new endpoint.
 
#### Setting up IAM Role

1. Go to the Amazon [IAM](https://console.aws.amazon.com/iam/home?#home) console.
2. Create a user that will be granted access to SNS.
3. Select the `Policies` tab and click on the `Create Policy` button.
4. Select `Create Your Own Policy` and fill out a `Policy Name`.
5. Copy this Policy document that will grant blanket access to SNS services.  You can add more [restrictions](http://docs.aws.amazon.com/sns/latest/dg/AccessPolicyLanguage_UseCases_Sns.html) later.
   ```json
   {
      "Version": "2012-10-17",
      "Statement": [
      {
        "Action": [
          "sns:*"
        ],
        "Effect": "Allow",
        "Resource": "*"
      }
     ]
    }
    ```
6. Make sure to `Validate the Policy` and click `Create Policy`.
7. Go back to the `Users` tab and select the user you created earlier.
8. In Permissions, select `Attach Policy` and find the policy we just created to attach it.
9. Click on `Security Credentials` and click on `Create Access Key`.
10. Record the credentials, which will be used to configure the Parse server.

#### Configuring Parse Server

Here is a sample config setup:

```javascript
var pushConfig =  { pushTypes : { android: {ARN : YOUR-ANDROID_ARN-HERE},
                                  ios: {ARN: YOUR-IOS_ARN-HERE}, production: false, bundleId: "beta.parseplatform.yourappname"}
                                 },
                   accessKey: process.env.SNS_ACCESS_KEY,
                   secretKey: process.env.SNS_SECRET_ACCESS_KEY,
                   region: "us-west-2"
                 };

var SNSPushAdapter = require('parse-server-sns-adapter/SNSPushAdapter').default;
var snsPushAdapter = new SNSPushAdapter(pushConfig);
pushConfig['adapter'] = snsPushAdapter;
```

You then need to instantiate the ParseServer info with the following:

```javascript
var api = new ParseServer({

  push: pushConfig
});
```
