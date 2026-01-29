const request = require('supertest');
const app = require('../server');
const { sequelize } = require('../database/index');

describe('Health Checks', () => {
    beforeAll(async () => {
        // Authenticate generic database connection
        // Note: in a real test env, we might want to mock this or use a test DB
        try {
            await sequelize.authenticate();
        } catch (err) {
            console.error('Unable to connect to the database:', err);
        }
    });

    afterAll(async () => {
        await sequelize.close();
    });

    it('GET /api/health should return 200 OK', async () => {
        const res = await request(app).get('/api/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
    });

    it('GET /api/v1/health should return 200 OK', async () => {
        const res = await request(app).get('/api/v1/health');
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('status', 'ok');
        expect(res.body).toHaveProperty('version', 'v1');
    });
});
