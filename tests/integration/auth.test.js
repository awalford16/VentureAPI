const request = require('supertest');
const bcrypt = require('bcrypt');
const {User} = require('../../models/user');

let server;

describe('/api/auth', () => {

    let user;
    let userReq;

    beforeEach(async () => { 
        server = require('../../index'); 
        
        user = new User({
            name: 'host1',
            isHost: true,
            email: 'host@email.com',
            password: 'password123', 
            isAdmin: true
        });

        const salt = await bcrypt.genSalt(16); 
        user.password = await bcrypt.hash(user.password, salt);
        await user.save();

        userReq = {
            email: 'host@email.com',
            password: 'password123'
        };
    });

    afterEach(async () => {
        await server.close();
        await User.remove({});
    });

    describe('POST/', () => {
        
        const exec = async () => {
            return await request(server)
                .post('/api/auth')
                .send(userReq);
        }

        // Should return 400 if an invalid object is passed
        it('should return 400 if an invalid object is passed', async () => {
            delete userReq.email;
            const res = await exec();

            expect(res.status).toBe(400);
        }); 

        // Should return 400 if no user could be found with the provided email
        it('should return 400 if an invalid object is passed', async () => {
            userReq.email = 'invalidemail@email.com';
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.text).toMatch('Invalid email or password.');
        }); 

        // Should return 400 if no user could be found with the provided password
        it('should return 400 if an invalid object is passed', async () => {
            userReq.password = 'wrongpassword';
            const res = await exec();

            expect(res.status).toBe(400);
            expect(res.text).toMatch('Invalid email or password.');
        }); 

        // Should return an auth token if the object is valid
        it('should return a token if a valid object is passed', async () => {
            const res = await exec();

            expect(res.status).toBe(200);
        }); 
    });

});