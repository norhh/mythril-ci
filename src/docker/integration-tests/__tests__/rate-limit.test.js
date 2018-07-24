import httpStatus from 'http-status';
import {serverRequest, getUserFromDatabase, setUserProperty, makeUserUnlimited, getValidCredential} from '../utils';

describe('Rate limit', () => {
  it('5 min limit', async () => {
    const {email, token} = await getValidCredential();
    await serverRequest
      .get('/mythril/v1/analysis/notexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.BAD_REQUEST);
    const user = await getUserFromDatabase(email);
    expect(user.limitCounters.fiveMin).toBe(1);
    await setUserProperty(
      email,
      {'limitCounters.fiveMin': 10}
    );
    await serverRequest
      .get('/mythril/v1/analysis/notexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.TOO_MANY_REQUESTS);
    const fiveMinInMilliseconds = 300000;
    await setUserProperty(
      email,
      {'recordedTimeOfFirstRequests.fiveMin': user.recordedTimeOfFirstRequests.fiveMin - fiveMinInMilliseconds}
    );
    await serverRequest
      .get('/mythril/v1/analysis/notexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.BAD_REQUEST);
  });
  it('1 hour limit', async () => {
    const {email, token} = await getValidCredential();
    await serverRequest
      .get('/mythril/v1/analysis/notexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.BAD_REQUEST);
    const user = await getUserFromDatabase(email);
    expect(user.limitCounters.oneHour).toBe(1);
    await setUserProperty(
      email,
      {'limitCounters.oneHour': 30}
    );
    await serverRequest
      .get('/mythril/v1/analysis/notexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.TOO_MANY_REQUESTS);
    const oneHourInMilliseconds = 3600000;
    await setUserProperty(
      email,
      {'recordedTimeOfFirstRequests.oneHour': user.recordedTimeOfFirstRequests.oneHour - oneHourInMilliseconds}
    );
    await serverRequest
      .get('/mythril/v1/analysis/notexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.BAD_REQUEST);
  });
  it('1 day limit', async () => {
    const {email, token} = await getValidCredential();
    await serverRequest
      .get('/mythril/v1/analysis/notexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.BAD_REQUEST);
    const user = await getUserFromDatabase(email);
    expect(user.limitCounters.oneDay).toBe(1);
    await setUserProperty(
      email,
      {'limitCounters.oneDay': 100}
    );
    await serverRequest
      .get('/mythril/v1/analysis/notexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.TOO_MANY_REQUESTS);
    const oneDayInMilliseconds = 86400000;
    await setUserProperty(
      email,
      {'recordedTimeOfFirstRequests.oneDay': user.recordedTimeOfFirstRequests.oneDay - oneDayInMilliseconds}
    );
    await serverRequest
      .get('/mythril/v1/analysis/notexist')
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.BAD_REQUEST);
  });
  it('stress test (race condition)', async () => {
    const {email, token} = await getValidCredential();
    await makeUserUnlimited(email);
    const numberOfRequest = 30;
    // eslint-disable-next-line
    for (let i = 0; i < numberOfRequest; i++) {
      await serverRequest
        .get('/mythril/v1/analysis/notexist')
        .set('Authorization', `Bearer ${token}`)
        .expect(httpStatus.BAD_REQUEST);
    }
    const user = await getUserFromDatabase(email);
    expect(user.limitCounters.oneDay).toBe(numberOfRequest);
  });
});

