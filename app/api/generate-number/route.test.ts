import { request } from 'supertest';
import app from '../../../app';

describe('GET /api/generate-number', () => {
    it('should return a number', async () => {
        const response = await request(app).get('/api/generate-number');
        expect(response.status).toBe(200);
        expect(typeof response.body.number).toBe('number');
    });
});