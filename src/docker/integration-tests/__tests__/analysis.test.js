import _ from 'lodash';
import httpStatus from 'http-status';
import {serverRequest, makeUserUnlimited, getValidCredential, waitAnalysisStatus} from '../utils';
import submissionWithIssues from './submissionWithIssues';

describe('/v1/analyses', () => {
  describe('Submit', () => {
    it('post analysis without authorization', async () => {
      const res = await serverRequest
        .post('/v1/analyses')
        .send({
          type: 'bytecode',
          contract: 'abcc',
        })
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('get analysis status without authorization', async () => {
      const res = await serverRequest
        .get('/v1/analyses/notexist')
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('get analysis issues without authorization', async () => {
      const res = await serverRequest
        .get('/v1/analyses/notexist/issues')
        .expect(httpStatus.UNAUTHORIZED);

      expect(res.body.status).toBe(httpStatus.UNAUTHORIZED);
    });

    it('no issues', async () => {
      const {email, token} = await getValidCredential();
      await makeUserUnlimited(email);

      let res = await serverRequest
        .post('/v1/analyses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'bytecode',
          contract: 'abcc',
        })
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('uuid');

      await waitAnalysisStatus(res.body.uuid, 'Finished', token);

      res = await serverRequest
        .get(`/v1/analyses/${res.body.uuid}/issues`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK);

      const foundIssues = res.body;
      expect(foundIssues).toBeInstanceOf(Array);
      expect(foundIssues.length).toBe(0);
    });

    it('error', async () => {
      const {email, token} = await getValidCredential();
      await makeUserUnlimited(email);

      const res = await serverRequest
        .post('/v1/analyses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'bytecode',
          contract: '01',
        })
        .expect(httpStatus.OK);
      expect(res.body).toHaveProperty('uuid');
    });

    it('Submit multiple (no issues)', async () => {
      const {email, token} = await getValidCredential();
      await makeUserUnlimited(email);

      let res = await serverRequest
        .post('/v1/analyses')
        .set('Authorization', `Bearer ${token}`)
        .send({
          type: 'bytecode',
          contracts: ['abcc', '00', '11'],
        })
        .expect(httpStatus.OK);
      expect(res.body).toHaveProperty('uuid');

      await waitAnalysisStatus(res.body.uuid, 'Finished', token);

      res = await serverRequest
        .get(`/v1/analyses/${res.body.uuid}/issues`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK);

      const foundIssues = res.body;
      expect(foundIssues).toBeInstanceOf(Array);
      expect(foundIssues.length).toBe(0);
    });

    it('issues', async () => {
      const {email, token} = await getValidCredential();
      await makeUserUnlimited(email);

      let res = await serverRequest
        .post('/v1/analyses')
        .set('Authorization', `Bearer ${token}`)
        .send(submissionWithIssues)
        .expect(httpStatus.OK);

      expect(res.body).toHaveProperty('uuid');

      await waitAnalysisStatus(res.body.uuid, 'Finished', token);

      res = await serverRequest
        .get(`/v1/analyses/${res.body.uuid}/issues`)
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.OK);

      const issues = res.body.map((issue) => _.omit(issue, 'debug'));

      expect(issues).toMatchSnapshot();
    });
  });
});
