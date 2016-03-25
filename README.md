### Parse Amazon SNS Push Adapter

#### Setup

The steps basically entail:

* Adding Platform endpoints to AWS console
* Setup an IAM role for platform endpoints.
     * iOS requires you loading the prod/development certificates.
* Generate AWS access key and secret with this authorized IAM role.
* Enable CloudSearch logs for debugging.

Here is a sample config setup:

```javascript
var pushConfig =  { pushTypes : { android: {ARN : YOUR-ANDROID_ARN-HERE},
                                 ios: {ARN: YOUR-IOS_ARN-HERE}, production: false, bundleId: "beta.parseplatform.yourappname"}
                                 },
                   accessKey: process.env.SNS_ACCESS_KEY,
                   secretKey: process.env.SNS_SECRET_ACCESS_KEY,
                   region: "us-west-2"
                 };

var SNSPushAdapter = require('parse-server-sns-adapter/SNSPushAdapter');
var snsPushAdapter = new SNSPushAdapter(pushConfig);
pushConfig['adapter'] = snsPushAdapter;
```


