const express = require('express');
const router = express.Router();

let totalUpload = 0;
let totalDownload = 0;
let totalRequests = 0;

function formatBytes(bytes, decimals = 2) {
  if (bytes === 0) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const bandwidth = {
  totalUpload: () => formatBytes(totalUpload),
  totalDownload: () => formatBytes(totalDownload),
  avgUploadSize: () => formatBytes(totalUpload / totalRequests),
  avgDownloadSize: () => formatBytes(totalDownload / totalRequests),
};

router.use((req, res, next) => {
  const requestBodySize = JSON.stringify(req.body).length;
  totalUpload += requestBodySize;
  totalRequests++;

  const originalWrite = res.write;
  const originalEnd = res.end;
  let responseSize = 0;

  res.write = function (chunk) {
    responseSize += chunk.length;
    originalWrite.apply(this, arguments);
  };

  res.end = function (chunk) {
    if (chunk) {
      responseSize += chunk.length;
    }
    totalDownload += responseSize;
    originalEnd.apply(this, arguments);
  };

  next();
});

module.exports = router;
module.exports.bandwidth = bandwidth;