const request = require('supertest');
const mongoose = require('mongoose');
const {Event} = require('../../models/event');
const {User} = require('../../models/user');

let server;

describe('/api/events', () => {

    let event;
    let host;
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
        hostId = host._id;

        event = new Event({
            title: 'event1',
            hostId: hostId,
            date: new Date(2019, 8, 6),
            location: 'NR29 4PJ'
        });
    });

    afterEach(async () => {
        await Event.remove({});
        await User.remove({});
        await server.close();
    });

    describe('GET/', () => {

        beforeEach(async () => {
            await event.save();
        });

        it('should get all available events', async () => {
            const res = await request(server).get('/api/events');

            expect(res.body.length).toBe(1);
            expect(res.body[0]).toHaveProperty('title', event.title);
        });
    });

    describe('GET/:id', () => {
        beforeEach(async () => {
            await event.save();
        });

        it('should return the event if a valid ID is provided', async () => {
            const res = await request(server).get(`/api/events/${event._id}`);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('title', event.title);
        });

        it('should return 400 if an invalid ID is passed', async () => {
            const res = await request(server).get(`/api/events/1`);

            expect(res.status).toBe(400);
        });

        it('should return 404 if no event exists with the given ID', async () => {
            const eventId = new mongoose.Types.ObjectId().toHexString();
            const res = await request(server).get(`/api/events/${eventId}`);

            expect(res.status).toBe(404);
        });
    });

    describe('POST/', () => {

        let token;

        const exec = async () => {
            return await request(server)
                .post('/api/events')
                .set('x-auth-token', token)
                .send(event);
        }

        beforeEach(() => {
            token = host.generateAuthToken();

            event = {
                title: 'event1',
                hostId: hostId,
                date: new Date(2019, 8, 6),
                location: 'NR29 4PJ'
            };
        });

        it('should return 401 if the user is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if the event object is invalid', async () => {
            event.title = 'hi';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if the event type does not exist', async () => {
            event.tags = ['Test'];
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if the date of the event is invalid', async () => {
            event.date = new Date(2016, 10, 10);
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 403 if isHost is not true', async () => {
            host.isHost = false;
            await host.save();
            token = host.generateAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 400 if the date of the event is before today', async () => {
            event.date = new Date(2018, 2, 4);
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should save the event if a valid object is passed', async () => {
            await exec();
            const eventFound = await Event.find({ title: event.title });

            expect(eventFound).not.toBeNull();
        });

        it('should return the event if a valid object is passed', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('title', event.title);
        });
    });

    describe('PUT/:id', () => {

        let id;
        let token;
        let newEvent;

        const exec = async () => {
            return await request(server)
                .put('/api/events/' + id)
                .set('x-auth-token', token)
                .send(newEvent);
        }

        beforeEach(async () => {
            await event.save();
            id = event._id;

            token = host.generateAuthToken();
            newEvent = {
                title: 'newEvent',
                hostId: host._id,
                location: event.location,
                date: event.date
            }
        });

        it('should return 401 if the client is not logged in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if an invalid event is sent', async () => {
            newEvent.title = 't';
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 404 if the event does not exist', async () => {
            id = new mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });
        
        it('should return the event if a valid object is sent', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('title', 'newEvent');
        }); 

        it('should update the event if a valid object is sent', async () => {
            await exec();
            const updatedEvent = await Event.findById(id);

            expect(updatedEvent.title).toBe('newEvent');
        });
    });

    describe('DELETE/:id', () => {

        let id;
        let token;

        const exec = async () => {
            return request(server)
                .delete('/api/events/' + id)
                .set('x-auth-token', token);
        }

        beforeEach(async () => {
            await event.save();
            id = event._id;

            token = host.generateAuthToken();
        });

        it('should return 400 if an invalid ID is sent', async () => {
            id = 1;
            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 401 if the client is not loggen in', async () => {
            token = '';
            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 404 if no event could be found by the logged in user', async () => {
            id = new mongoose.Types.ObjectId();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 403 if the user is not a host', async () => {
            host.isHost = false;
            token = host.generateAuthToken();
            const res = await exec();

            expect(res.status).toBe(403);
        });

        it('should return 404 if it cannot find event created by different user', async () => {
            host._id = new mongoose.Types.ObjectId();
            token = host.generateAuthToken();
            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should delete the event if a valid ID is provided', async () => {
            await exec();
            const eventExists = await Event.findById(id);

            expect(eventExists).toBeNull();
        });

        it('should return the event if a valid ID is sent', async () => {
            const res = await exec();

            expect(res.body).toHaveProperty('title', 'event1');
        });
    });
});