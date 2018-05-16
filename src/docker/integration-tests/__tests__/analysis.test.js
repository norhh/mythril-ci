import request from 'supertest';
import httpStatus from 'http-status';
import submissionWithIssues from './submissionWithIssues';
import expectedIssues from './issues';

const serverRequest = request(`http://127.0.0.1:${process.env.PORT}`);

/**
 * For the given uuid, waits until the current status is no longer the passed currentStatus argument, and expects
 * the new status is the passed nextStatus argument.
 * @param {string} uuid
 * @param {string} currentStatus
 * @param {string} nextStatus
 */
async function waitForStatusUpdate(uuid, currentStatus, nextStatus) {
  let res;

  // eslint-disable-next-line no-constant-condition, no-restricted-syntax
  while (true) {
    const delayMS = 50;
    await Promise.delay(delayMS);

    res = await serverRequest
      .get(`/mythril/v1/analysis/${uuid}`)
      .expect(httpStatus.OK);
    const result = res.body.result;
    if (result !== currentStatus) {
      expect(result).toBe(nextStatus);
      break;
    }
  }
}

describe('/mythril/v1//analysis', () => {
  describe('Submit', () => {
    it('no issues', async () => {
      let res = await serverRequest
        .post('/mythril/v1/analysis')
        .send({
          type: 'bytecode',
          contract: 'abcc',
        })
        .expect(httpStatus.OK);

      expect(res.body.result).toBe('Queued');
      expect(res.body).toHaveProperty('uuid');

      await waitForStatusUpdate(res.body.uuid, 'Queued', 'In progress');
      await waitForStatusUpdate(res.body.uuid, 'In progress', 'Finished');

      res = await serverRequest
        .get(`/mythril/v1/analysis/${res.body.uuid}/issues`)
        .expect(httpStatus.OK);

      const foundIssues = res.body;
      expect(foundIssues).toBeInstanceOf(Array);
      expect(foundIssues.length).toBe(0);
    });

    it('error', async () => {
      const res = await serverRequest
        .post('/mythril/v1/analysis')
        .send({
          type: 'bytecode',
          contract: '01',
        })
        .expect(httpStatus.OK);
      expect(res.body.result).toBe('Queued');
      expect(res.body).toHaveProperty('uuid');

      await waitForStatusUpdate(res.body.uuid, 'Queued', 'In progress');
      await waitForStatusUpdate(res.body.uuid, 'In progress', 'Error');
    });

    it('Submit multiple (no issues)', async () => {
      let res = await serverRequest
        .post('/mythril/v1/analysis')
        .send({
          type: 'bytecode',
          contracts: ['abcc', '00', '11'],
        })
        .expect(httpStatus.OK);
      expect(res.body.result).toBe('Queued');
      expect(res.body).toHaveProperty('uuid');

      await waitForStatusUpdate(res.body.uuid, 'Queued', 'In progress');
      await waitForStatusUpdate(res.body.uuid, 'In progress', 'Finished');

      res = await serverRequest
        .get(`/mythril/v1/analysis/${res.body.uuid}/issues`)
        .expect(httpStatus.OK);

      const foundIssues = res.body;
      expect(foundIssues).toBeInstanceOf(Array);
      expect(foundIssues.length).toBe(0);
    });

    it('issues', async () => {
      let res = await serverRequest
        .post('/mythril/v1/analysis')
        .send(submissionWithIssues)
        .expect(httpStatus.OK);

      expect(res.body.result).toBe('Queued');
      expect(res.body).toHaveProperty('uuid');

      await waitForStatusUpdate(res.body.uuid, 'Queued', 'In progress');
      await waitForStatusUpdate(res.body.uuid, 'In progress', 'Finished');

      res = await serverRequest
        .get(`/mythril/v1/analysis/${res.body.uuid}/issues`)
        .expect(httpStatus.OK);

      expect(res.body).toEqual(expectedIssues);
    });
  });
});
