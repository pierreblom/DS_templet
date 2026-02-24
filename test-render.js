const express = require('express');
const app = require('./server'); // This starts the server or exports app? Wait, server.js has `if (require.main === module) startServer(); module.exports = app;`
const request = require('supertest');

async function test() {
    console.log('Testing GET /');
    try {
        const res = await request(app).get('/');
        console.log('Status:', res.status);
        console.log('Body:', res.body);
        console.log('Text:', res.text.substring(0, 100)); // Maybe it's not JSON
    } catch (e) {
        console.error(e);
    }
}
test();
