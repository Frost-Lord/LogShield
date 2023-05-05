const express = require('express');
const router = express.Router();

function generateRayId(ip, difficulty) {
    let encryptedSecret = '';

    for (let i = 0; i < process.env.SECRET.length; i++) {
        const secretChar = process.env.SECRET.charCodeAt(i);
        const ipChar = ip.charCodeAt(i % ip.length);
        const encryptedChar = secretChar ^ ipChar;
        encryptedSecret += ('0' + encryptedChar.toString(16)).slice(-2);
    }

    return encryptedSecret;
}

function checkRayId(rayId, ip, difficulty) {
    console.log('Expected Ray ID:', process.env.SECRET, 'Received Ray ID:', rayId);
    return rayId === process.env.SECRET;
}

router.get('/verify-ray', async (req, res) => {
    const userIp = req.ip || req.headers['x-forwarded-for'];
    const rayId = req.query.ray;

    if (checkRayId(rayId, userIp, Difficulty)) {
        req.session.whitelisted = true;
        res.sendStatus(200);
    } else {
        res.sendStatus(400);
    }
});

module.exports = router;
