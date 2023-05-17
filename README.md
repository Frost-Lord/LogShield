# LogShield

LogShield is a machine learning project that uses TensorFlow.js to detect malicious activity in web server access logs. It can be used to protect your web server from malitious users.

<p align="center">
    <img src="./display.png">
</p>

## How it works

# Middleware:

LogShield also includes a rate limiter feature to prevent abuse of the web server by limiting the number of requests from a single IP address within a specified time period. The rate limiter uses Redis as a storage backend to keep track of the number of requests made by each IP address.

The rate limiter can be configured with the following options:

. limit: the maximum number of requests allowed within the specified time period (default: 30).
. resetInterval: the time period in milliseconds after which the request count for an IP address should be reset (default: 1 minute).
. blockDuration: the time period in milliseconds for which requests from an IP address should be blocked after exceeding the limit (default: 2 minutes).
. nonceLimit: the maximum number of nonces allowed within the specified time period (default: 10).
. nonceWindow: the time period in milliseconds after which the nonce count for an IP address should be reset (default: 5 seconds).

Mass GET requests (3817)

```powershell
checks.........................: 0.26%  ✓ 10        ✗ 3817
data_received..................: 1.8 MB 29 kB/s
data_sent......................: 429 kB 7.0 kB/s
http_req_blocked...............: avg=56.39µs min=0s      med=0s      max=4.27ms  p(90)=0s      p(95)=0s
http_req_connecting............: avg=25.97µs min=0s      med=0s      max=3.01ms  p(90)=0s      p(95)=0s
http_req_duration..............: avg=12.73ms min=1.52ms  med=11.05ms max=66.48ms p(90)=23.5ms  p(95)=25.53ms
  { expected_response:true }...: avg=61.43ms min=57.89ms med=58.89ms max=66.48ms p(90)=66.48ms p(95)=66.48ms
http_req_failed................: 99.73% ✓ 3817      ✗ 10
http_req_receiving.............: avg=4.34ms  min=0s      med=3.66ms  max=19.72ms p(90)=8.08ms  p(95)=10.99ms
http_req_sending...............: avg=5.12µs  min=0s      med=0s      max=1ms     p(90)=0s      p(95)=0s
http_req_tls_handshaking.......: avg=0s      min=0s      med=0s      max=0s      p(90)=0s      p(95)=0s
http_req_waiting...............: avg=8.39ms  min=502.4µs med=7.18ms  max=65.05ms p(90)=14.49ms p(95)=19.3ms
http_reqs......................: 3827   62.710117/s
iteration_duration.............: avg=1.01s   min=1s      med=1.01s   max=1.06s   p(90)=1.02s   p(95)=1.02s
iterations.....................: 3827   62.710117/s
vus............................: 41     min=41      max=64
vus_max........................: 64     min=64      max=64
```

Blocked 99.73% of 3817 requests

## Environment Variables

The following environment variables are used in the application:

| Variable            | Description                           | Example Value                                      |
|---------------------|---------------------------------------|----------------------------------------------------|
| SECRET              | Secret key for session encryption     | sg809psargae9pr8gaertgheho9ar8g                    |
| DIFFICULTY          | Difficulty level for the proxy server  | 0                                                  |
| PORT                | Port number for the proxy server       | 7000                                               |
| TARGETURL           | URL of the target server to proxy      | http://127.0.0.1:3000                              |
| WHITELISTED         | Whitelisted IP addresses               | 127.0.0.1                                          |
| Redis_Username      | Username for Redis database connection | default                                            |
| Redis_Password      | Password for Redis database connection | qVFxATVuYmGMwJRengkJYm1Z0cz9V8bi                    |
| Redis_Host          | Host address for Redis database         | redis-15979.c21.us-east-1-3.ec2.cloud.redislabs.com |
| Redis_Port          | Port number for Redis database          | 6000                                              |
| Session_Time        | Session expiration time in minutes     | 30                                                 |
| Max_Requests        | Maximum number of requests per minute  | 100000                                             |
| Reset_Interval      | Request rate limiter reset interval    | 1                                                  |
| BlockDuration       | Duration to block IP for rate limiting | 2                                                  |


# AI:

LogShield uses a neural network model to analyze access logs and predict whether each user is malicious or legitimate based on their IP address, request method, response status code, and bytes sent. The model is trained on a combination of legitimate and malicious access logs, and can be retrained on new data to improve its accuracy.

To use LogShield, you need to prepare your access logs in a specific format and train the model on them. Then, you can use the trained model to analyze new access logs and detect any malicious activity.

## How to use it

To use LogShield, follow these steps:

1. Prepare your access logs in the following format:

```sql
IP_ADDRESS - - [TIMESTAMP] "METHOD URI PROTOCOL" STATUS_CODE BYTES_SENT "REFERER" "USER_AGENT"
```

For example:

```sql
192.168.1.1 - - [23/Apr/2023:12:34:56 +0000] "GET /index.html HTTP/1.1" 200 1024 "-" "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/89.0.4389.82 Safari/537.36"
```

2. Generate some malicious access logs and combine them with your legitimate access logs. You can use the accessmal.log file provided in this project as an example of malicious logs.

3. Install Node.js and the required packages by running the following command in your terminal:

```
npm i
```

4. Train the model by running the following command:

```
node index.js
```

This will train the model on your combined access logs and save the trained model to a file called model.json.

5. Once the model is trained, you can use it to analyze new access logs and detect malicious activity by running the following command:

```
npm run evaluate
```

This will load the trained model from the model.json file and analyze the access logs in the access.log file. If any malicious activity is detected, the script will output the IP addresses of the malicious users.

## Installing

```sh
apt-get update && apt-get upgrade -y
curl -fsSL https://deb.nodesource.com/setup_19.x | sudo -E bash -
apt-get install -y nodejs nginx
mkdir -p /etc/logshield
cd /etc/logshield

# Upload the files

npm install
cp example.env .env
# Edit .env
cp logshield.service /etc/systemd/system/logshield.service
systemctl enable --now logshield
```

## Updating

```sh
cd /etc/logshield
# upload new files
cp logshield.service /etc/systemd/system/logshield.service
systemctl daemon-reload
systemctl restart logshield
```

## Conclusion

LogShield is a powerful tool for protecting your web server from DDoS attacks. By using machine learning to analyze access logs, it can accurately detect malicious activity and allow you to take action before any damage is done.
