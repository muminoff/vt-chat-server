# Authentication

Authentication should be performed through HTTP transport. Before authentication client must do signup process by sending `username` and `phone_number` simply via POST method. After server gets user data, it does validation and once server approves signup process, it returns `auth_token`.

### Signup API

URL: `http://121.135.130.247:3000`

Endpoint: `/signup`

Method: `POST`

Data: `username` string(16), `phone_number` string(15)

Return: `auth_token` string(32)

##### Example

```
$ curl -X POST -d username=foobar -d phone_number=8293529834 http://121.135.130.247:3000/signup
{ "auth_token": "o3gQY4qz7/1FWfvLvygHfGnhH2XWQMMA" }
```

### Authentication
