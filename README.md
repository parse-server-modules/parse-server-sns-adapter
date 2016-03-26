### Parse Amazon SNS Push Adapter

[![Build
Status](https://travis-ci.org/parse-server-modules/parse-server-sns-adapter.svg?branch=master)](https://travis-ci.org/parse-server-modules/parse-server-sns-adapter)
[![codecov.io](https://codecov.io/github/parse-server-modules/parse-server-sns-adapter/coverage.svg?branch=master)](https://codecov.io/github/parse-server-modules/parse-server-sns-adapter?branch=master)
[![NPM Version](https://img.shields.io/npm/v/parse-server-sns-adapter.svg?style=flat-square)](https://www.npmjs.com/package/parse-server-sns-adapter)

This adapter can be used with Parse open source to leverage the Amazon Simple Notification Service (SNS), which attempts to abstract away the complexities of different push notification systems.  Currently, there is only support for iOS (Apple Push Notification Service) and Android (Google Cloud Messaging) devices.

To add other push types, you simply need to know what kind of payload format to be sent and this adapter will need to be modified to send it.  This adapter leverages code from the [parse-server-push-adapter](https://github.com/parse-server-modules/parse-server-push-adapter) repo.  See the [Amazon documentation](http://docs.aws.amazon.com/sns/latest/dg/mobile-push-send-custommessage.html) if you wish to add other types.  Make sure to add test coverage for any additional ones inside the `spec` folder.

#### Known limitations

* The adapter always makes a network call to Amazon's service to exchange a device token for an Amazon Resource Number (ARN).

* Amazon will disable devices that have ARN.  There is currently no check to see if the ARN used to send is enabled.

* SNS does not appear to have batching sends with GCM.

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
     * For APNS setup, you must generate an SSL certificate that can connect to Apple's servers.  See step #1 of this [tutorial](https://github.com/ParsePlatform/PushTutorial/blob/master/iOS/README.md#1-creating-the-ssl-certificate).  You will need to choose between `Apple Production` and `Apple Development` depending on the cert generated.
        * If you do not use a passpharse with the certificate, you can click on the `Load Credentials File` and the `Private Key` section should be auto filled out.  Otherwise, you will need to enter the correct passphrase in order to load.
4. Record the Amazon Resource Number (ARN) associated with this new endpoint.

#### Setting up IAM Role

1. Go to the Amazon [IAM](https://console.aws.amazon.com/iam/home?#home) console.
2. Create a user that will be granted access to SNS.
3. Select the `Policies` tab and click on the `Create Policy` button.
4. Select `Create Your Own Policy` and fill out a `Policy Name`.
5. Copy this Policy document that will grant blanket access to SNS services.  You can add more [restrictions](http://docs.aws.amazon.com/sns/latest/dg/AccessPolicyLanguage_UseCases_Sns.html) later.

       ```javascript
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
10. Record the credentials, which will be used to configure the Parse server.  You will need to set the access and secret key as the environment variables `SNS_ACCESS_KEY` and `SNS_SECRET_ACCESS_KEY` respectively.

#### Configuring Parse Server

You will need add this NPM package to the `package.json` used in conjunction with the Parse open source package:

```javascript
"dependencies": {
  "parse-server-sns-adapter": "~0.0.6"
}
```

Type `npm install` and make sure this module got added to your `node_modules` dir.

Here is a sample config setup.  You can specify the `SNS_ACCESS_KEY` and `SNS_SECRET_ACCESS_KEY`
as environment variables, or you can hard-code them here.

For iOS certificates, make sure to set the `production` and `bundleId` according to the type
of certificate generated.

```javascript
var pushConfig =  { pushTypes : { android: {ARN : 'arn:aws:sns:us-west-2:12345678:app/GCM/Android'},
                                  ios: {ARN:'arn:aws:sns:us-west-2:12345678:app/APNS_SANDBOX/ParseAppleTest', production: false, bundleId: "beta.parseplatform.yourappname"}
                                 },
                   accessKey: process.env.SNS_ACCESS_KEY,
                   secretKey: process.env.SNS_SECRET_ACCESS_KEY,
                   region: "us-west-2"
                 };

var SNSPushAdapter = require('parse-server-sns-adapter').default;
var snsPushAdapter = new SNSPushAdapter(pushConfig);
pushConfig['adapter'] = snsPushAdapter;
```

You then need to instantiate the ParseServer info with the following:

```javascript
var api = new ParseServer({

  push: pushConfig
});
```

#### Troubleshooting

* Inside the Amazon SNS Console, click on the `Applications` tab, select an endpoint and choose the
`Actions` dropdown to select `Delivery status`.  Click on `Create IAM roles` which will enable SNS to write to CloudWatch.   You can then go to the CloudWatch console, click on the `Logs`, and view the results of any pushes that may have been issued.

* Make sure that you use the right Apple certificate for production/development purposes.  Your Parse push configuration needs to have the `production` flag set to be `true` or `false`, and you must configure your Amazon endpoints.  Also verify the `bundleId` corresponds to the app that can receive these push notifications.

* If you wish to test this adapter locally and assuming you have a Parse open source server setup locally, make sure to install `node-inspector`:

  ```bash
  npm install node-inspector
  ```

  Assuming you've hard-coded your configuration inside `index.js`, run your Parse server with the following line:

  ```bash
  node --debug index.js
  ```

  Run `node-inspector` in a separate window:

  ```bash```
  node_modules/.bin/node-inspector
  ```

  Open up http://127.0.0.1:8080/?port=5858 locally. You can use the Chrome debugging tools to set breakpoints in the JavaScript code.
