# Alimt provider for Strapi Translate Plugin

Configure the provider through the providerOptions:

```js
module.exports = {
  // ...
  translate: {
    enabled: true,
    config: {
      // Choose one of the available providers
      provider: 'alimt',
      // Pass credentials and other options to the provider
      providerOptions: {
        // your API key ID - required and wil cause errors if not provided
        accessKeyId: 'key',
        // your API key Secret - required and wil cause errors if not provided
        accessKeySecret: 'xxxxx',
        // required and wil cause errors if not provided
        endpoint: 'mt.aliyuncs.com',
        // required and wil cause errors if not provided
        region: 'cn-hongkong',
        // split length threshold, default is 2000
        splitLengthThreshold: 2000,
        // manually overwrite the Strapi Locale to LibreTranslate Locale mapping.
        // default is the string before the `-` character for every locale
        localeMap: {
          'zh-Hant': 'zh-tw',
        },
      },
      // other options ...
    },
  },
  // ...
}
```

or use the default environment variables:

- `ALIMT_ACCESS_KEY_ID` - default `undefined`
- `ALIMT_ACCESS_KEY_SECRET` - default `undefined`
- `ALIMT_ENDPOINT` - default `undefined`
- `ALIMT_REGION` - default `undefined`
- `ALIMT_SPLIT_LENGTH_THRESHOLD` - default `2000`

Note that environment variables take precedence over values `providerOptions`. To force no limit on requests per second or maximum characters, set them to -1

## Limitations

- Only the [alimt supported languages](https://help.aliyun.com/zh/machine-translation/support/supported-languages-and-codes) can be translated
- The API-Limits of Alimt ([see](https://help.aliyun.com/zh/machine-translation/developer-reference/limits)) should be respected. If one field is larger than the request size limit, the content needs to be split and merged at some character, which may break the content layout!

## Quick Links

- [ErrorCode](https://api.aliyun.com/document/alimt/2018-10-12/errorCode)
- [Usage](https://mt.console.aliyun.com/service)
