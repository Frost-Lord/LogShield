# LogShield
LogShield is a machine learning project that uses TensorFlow.js to detect malicious activity in web server access logs. It can be used to protect your web server from malitious users.

<p align="center">
    <img src="./display.png">
</p>

## How it works
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
