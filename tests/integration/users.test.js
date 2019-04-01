const request = require('supertest');
const mongoose = require('mongoose');
const {User} = require('../../models/user');


describe('/api/users', () => {

    let server;
    let host;
    let token;
    let hostId;

    beforeEach(async () => { 
        server = require('../../index'); 
        
        host = new User({
            name: 'host1',
            isHost: true,
            email: 'host@email.com',
            password: 'password123', 
            isAdmin: true
        });

        await host.save();
        token = host.generateAuthToken();
        hostId = host._id;
    });

    afterEach(async () => {
        await server.close();
        await User.remove({});
    });

    describe('GET/', () => {

        const exec = async () => {
            return await request(server)
                .get('/api/users/me')
                .set('x-auth-token', token)
        }

        it('should return 401 if the user is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return the current logged in user', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'host1');
        });
    });

    describe('POST/', () => {

        const exec = async () => {
            return await request(server)
                .post('/api/users')
                .send(newHost)
        }

        beforeEach(async () => { 
            newHost = {
                name: 'host2',
                isHost: true,
                email: 'host2@email.com',
                password: 'password123', 
                isAdmin: true
            }
        });

        it('should return 400 if the object is invalid', async () => {
            newHost.name = 't';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return the user if a valid object is provided', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'host2')
        });

        it('should generate an auth token if a valid object is provided', async () => {
            const res = await exec();

            expect(res.header).toHaveProperty('x-auth-token')
        });
    });

    describe('PUT/', () => {

        const exec = async () => {
            return await request(server)
                .put('/api/users/' + hostId)
                .set('x-auth-token', token)
                .send(newHost)
        }

        beforeEach(() => { 
            newHost = {
                name: 'host2',
                isHost: false,
                email: 'host2@gmail.com',
                password: 'password123', 
                isAdmin: false
            };
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if the object is invalid', async () => {
            newHost.name = 't';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if the object is invalid', async () => {
            hostId = new mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return the user if a valid object is provided', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'host2')
        });

        it('should update the user if a valid object is sent', async () => {
            await exec();
            const updatedUser = await User.findById(hostId);

            expect(updatedUser.email).toBe('host2@gmail.com');
        });

    });

    describe('DELETE/', () => {

        const exec = async () => {
            return await request(server)
                .delete('/api/users/' + hostId)
                .set('x-auth-token', token)
        }

        it('should return 401 if the user is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if the object is invalid', async () => {
            hostId = new mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return the user if a valid object is provided', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', 'host1')
        });

        it('should update the user if a valid object is sent', async () => {
            await exec();
            const userExists = await User.findById(hostId);

            expect(userExists).toBeNull();
        });

    });
});