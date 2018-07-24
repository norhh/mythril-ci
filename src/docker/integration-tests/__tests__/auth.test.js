import httpStatus from 'http-status';
import {serverRequest, generateEmailAddress, getValidUser, setUserProperty, getUserFromDatabase} from '../utils';

describe('/mythril/v1/auth', () => {
  describe('check email', () => {
    it('invalid email', async () => {
      const res = await serverRequest
        .get('/mythril/v1/auth/user/check?email=invalid')
        .expect(httpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('another invalid email', async () => {
      const res = await serverRequest
        .get('/mythril/v1/auth/user/check?email=invalid@domain')
        .expect(httpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.BAD_REQUEST);
    });

    it('email does not exist', async () => {
      const email = generateEmailAddress();
      const res = await serverRequest
        .get(`/mythril/v1/auth/user/check?email=${email}`)
        .expect(httpStatus.OK);
      expect(res.body).toHaveProperty('exists');
      expect(res.body.exists).toBe(false);
    });
  });

  describe('register', () => {
    it('invalid email', async () => {
      const res = await serverRequest
        .post('/mythril/v1/auth/user')
        .send({
          firstName: 'David',
          lastName: 'Martin',
          email: 'invalid',
          termsId: 'no_terms',
        })
        .expect(httpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.BAD_REQUEST);
    });
    it('another invalid email', async () => {
      const res = await serverRequest
        .post('/mythril/v1/auth/user')
        .send({
          firstName: 'David',
          lastName: 'Martin',
          email: 'invalid@domain',
          termsId: 'no_terms',
        })
        .expect(httpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.BAD_REQUEST);
    });
    it('invalid terms', async () => {
      const email = generateEmailAddress();
      const res = await serverRequest
        .post('/mythril/v1/auth/user')
        .send({
          firstName: 'David',
          lastName: 'Martin',
          email,
          termsId: 'invalid_terms',
        })
        .expect(httpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.BAD_REQUEST);
    });
    it('success and email exists', async () => {
      const email = generateEmailAddress();
      const res = await serverRequest
        .post('/mythril/v1/auth/user')
        .send({
          firstName: 'David',
          lastName: 'Martin',
          email,
          termsId: 'no_terms',
        })
        .expect(httpStatus.OK);
      expect(res.body).toHaveProperty('user');

      const checkRes = await serverRequest
        .get(`/mythril/v1/auth/user/check?email=${email}`)
        .expect(httpStatus.OK);
      expect(checkRes.body).toHaveProperty('exists');
      expect(checkRes.body.exists).toBe(true);
    });
  });
  describe('verify email', () => {
    it('email does not exist', async () => {
      const email = generateEmailAddress();
      const verificationCode = 'abc';
      const res = await serverRequest
        .get(`/mythril/v1/auth/user/verify/${email}/${verificationCode}`)
        .expect(httpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.NOT_FOUND);
    });
    it('verified email', async () => {
      const user = await getValidUser();
      const {verificationCode, email} = user;
      await serverRequest
        .get(`/mythril/v1/auth/user/verify/${email}/${verificationCode}`)
        .expect(httpStatus.OK);
      const res = await serverRequest
        .get(`/mythril/v1/auth/user/verify/${email}/${verificationCode}`)
        .expect(httpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.NOT_FOUND);
    });
    it('expired verification code', async () => {
      const user = await getValidUser();
      const {verificationCode, email} = user;
      await setUserProperty(email, {verificationExpiry: 0});
      const res = await serverRequest
        .get(`/mythril/v1/auth/user/verify/${email}/${verificationCode}`)
        .expect(httpStatus.BAD_REQUEST);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.BAD_REQUEST);
    });
    it('success', async () => {
      const user = await getValidUser();
      const {verificationCode, email, apiKey} = user;
      const res = await serverRequest
        .get(`/mythril/v1/auth/user/verify/${email}/${verificationCode}`)
        .expect(httpStatus.OK);
      expect(res.body).toHaveProperty('apiKey');
      expect(res.body.apiKey).toBe(apiKey);
    });
  });

  describe('resend verification email', () => {
    it('email does not exist', async () => {
      const email = generateEmailAddress();
      const res = await serverRequest
        .post('/mythril/v1/auth/user/resend')
        .send({
          email,
        })
        .expect(httpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.NOT_FOUND);
    });
    it('verified email', async () => {
      const user = await getValidUser();
      const {verificationCode, email} = user;
      await serverRequest
        .get(`/mythril/v1/auth/user/verify/${email}/${verificationCode}`)
        .expect(httpStatus.OK);
      const res = await serverRequest
        .post('/mythril/v1/auth/user/resend')
        .send({
          email,
        })
        .expect(httpStatus.CONFLICT);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.CONFLICT);
    });
    it('success', async () => {
      const user = await getValidUser();
      const {verificationCode, verificationExpiry, email} = user;
      const res = await serverRequest
        .post('/mythril/v1/auth/user/resend')
        .send({
          email,
        })
        .expect(httpStatus.OK);
      const newUser = await getUserFromDatabase(email);
      expect(newUser.verificationExpiry).not.toBeLessThan(verificationExpiry);
      expect(newUser.verificationCode).not.toBe(verificationCode);
      expect(res.body).toHaveProperty('success');
      expect(res.body.success).toBe(true);
    });
  });
  describe('apiKey recovery', () => {
    it('email does not exist', async () => {
      const email = generateEmailAddress();
      const res = await serverRequest
        .post('/mythril/v1/auth/user/lost')
        .send({
          email,
        })
        .expect(httpStatus.NOT_FOUND);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.NOT_FOUND);
    });
    it('unverified account', async () => {
      const user = await getValidUser();
      const {email} = user;
      const res = await serverRequest
        .post('/mythril/v1/auth/user/lost')
        .send({
          email,
        })
        .expect(httpStatus.CONFLICT);
      expect(res.body).toHaveProperty('status');
      expect(res.body.status).toBe(httpStatus.CONFLICT);
    });
    it('success', async () => {
      const user = await getValidUser();
      const {verificationCode, email} = user;
      await serverRequest
        .get(`/mythril/v1/auth/user/verify/${email}/${verificationCode}`)
        .expect(httpStatus.OK);
      const res = await serverRequest
        .post('/mythril/v1/auth/user/lost')
        .send({
          email,
        })
        .expect(httpStatus.OK);
      expect(res.body).toHaveProperty('success');
      expect(res.body.success).toBe(true);
    });
  });
});
