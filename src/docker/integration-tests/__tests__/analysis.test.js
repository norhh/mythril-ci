import request from 'supertest';
import httpStatus from 'http-status';
import submissionWithIssues from './submissionWithIssues';

const serverRequest = request(`http://127.0.0.1:${process.env.PORT}`);

/**
 * For the given uuid, waits until the current status is no longer the passed currentStatus argument, and expects
 * the new status is the passed nextStatus argument.
 * @param {string} uuid
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @param {string} token
 */
async function waitForStatusUpdate(uuid, currentStatus, nextStatus, token) {
  let res;

  // eslint-disable-next-line no-constant-condition, no-restricted-syntax
  while (true) {
    const delayMS = 50;
    await Promise.delay(delayMS);

    res = await serverRequest
      .get(`/mythril/v1/analysis/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.OK);
    const result = res.body.result;
    if (result !== currentStatus) {
      expect(result).toBe(nextStatus);
      break;
    }
  }
}

/**
 * Generate random email address
 * @returns {string} random email address
 */
function generateEmailAddress() {
  // eslint-disable-next-line
  const randomPrefix = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
  return `${randomPrefix}@test.com`;
}

/**
 * Get valid credential
 *
 * @returns {object} email and token
 */
async function getValidCredential() {
  const email = generateEmailAddress();
  const res = await serverRequest
    .post('/mythril/v1/auth/user')
    .send({
      firstName: 'David',
      lastName: 'Martin',
      email,
      termsId: '00000000-0000-0000-0000-000000000001',
    })
    .expect(httpStatus.OK);
  expect(res.body).toHaveProperty('token');
  return {email, token: res.body.token};
}

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
          termsId: '00000000-0000-0000-0000-000000000001',
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
          termsId: '00000000-0000-0000-0000-000000000001',
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
          termsId: '10000000-0000-0000-0000-000000000001',
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
          termsId: '00000000-0000-0000-0000-000000000001',
        })
        .expect(httpStatus.OK);
      expect(res.body).toHaveProperty('token');

      const checkRes = await serverRequest
        .get(`/mythril/v1/auth/user/check?email=${email}`)
        .expect(httpStatus.OK);
      expect(checkRes.body).toHaveProperty('exists');
      expect(checkRes.body.exists).toBe(true);
    });
  });
});

describe('/mythril/v1/analysis', () => {
  describe('Submit', () => {
    it('post analysis without authorization', async () => {
      const res = await serverRequest
        .post('/mythril/v1/analysis')
        .send({
          type: 'bytecode',
          contract: 'abcc',
        })
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('get analysis status without authorization', async () => {
      const res = await serverRequest
        .get('/mythril/v1/analysis/notexist')
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('get analysis issues without authorization', async () => {
      const res = await serverRequest
        .get('/mythril/v1/analysis/notexist/issues')
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('no issues', async () => {
      const {token} = await getValidCredential();

      let res = await serverRequest
        .post('/mythril/v1/analysis')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'bytecode',
          contract: 'abcc',
        })
        .expect(httpStatus.OK);

      expect(res.body.result).toBe('Queued');
      expect(res.body).toHaveProperty('uuid');

      await waitForStatusUpdate(res.body.uuid, 'Queued', 'In progress', token);
      await waitForStatusUpdate(res.body.uuid, 'In progress', 'Finished', token);

      res = await serverRequest
        .get(`/mythril/v1/analysis/${res.body.uuid}/issues`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK);

      const foundIssues = res.body;
      expect(foundIssues).toBeInstanceOf(Array);
      expect(foundIssues.length).toBe(0);
    });

    it('error', async () => {
      const {token} = await getValidCredential();
      const res = await serverRequest
        .post('/mythril/v1/analysis')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'bytecode',
          contract: '01',
        })
        .expect(httpStatus.OK);
      expect(res.body.result).toBe('Queued');
      expect(res.body).toHaveProperty('uuid');

      await waitForStatusUpdate(res.body.uuid, 'Queued', 'In progress', token);
      await waitForStatusUpdate(res.body.uuid, 'In progress', 'Error', token);
    });

    it('Submit multiple (no issues)', async () => {
      const {token} = await getValidCredential();
      let res = await serverRequest
        .post('/mythril/v1/analysis')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'bytecode',
          contracts: ['abcc', '00', '11'],
        })
        .expect(httpStatus.OK);
      expect(res.body.result).toBe('Queued');
      expect(res.body).toHaveProperty('uuid');

      await waitForStatusUpdate(res.body.uuid, 'Queued', 'In progress', token);
      await waitForStatusUpdate(res.body.uuid, 'In progress', 'Finished', token);

      res = await serverRequest
        .get(`/mythril/v1/analysis/${res.body.uuid}/issues`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK);

      const foundIssues = res.body;
      expect(foundIssues).toBeInstanceOf(Array);
      expect(foundIssues.length).toBe(0);
    });

    it('issues', async () => {
      const {token} = await getValidCredential();
      let res = await serverRequest
        .post('/mythril/v1/analysis')
        .set('Authorization', `Bearer ${token}`)
        .send(submissionWithIssues)
        .expect(httpStatus.OK);

      expect(res.body.result).toBe('Queued');
      expect(res.body).toHaveProperty('uuid');

      await waitForStatusUpdate(res.body.uuid, 'Queued', 'In progress', token);
      await waitForStatusUpdate(res.body.uuid, 'In progress', 'Finished', token);

      res = await serverRequest
        .get(`/mythril/v1/analysis/${res.body.uuid}/issues`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK);

      expect(res.body).toMatchSnapshot();
    });
  });
});
