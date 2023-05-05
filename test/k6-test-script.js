import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
    vus: __ENV.VUS, // This value will be set from the command line
    duration: __ENV.DURATION, // This value will be set from the command line
};

export default function () {
    let method = __ENV.HTTP_METHOD;
    let url = __ENV.TARGET;
    let payload = JSON.parse(__ENV.PAYLOAD || '{}');
    let headers = { 'Content-Type': 'application/json' };
    let res = http.request(method, url, payload, { headers: headers });

    check(res, {
        'status was 200': (r) => r.status == 200,
    });

    sleep(1);
}
