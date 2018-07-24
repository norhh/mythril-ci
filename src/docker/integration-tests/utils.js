import httpStatus from 'http-status';
import {MongoClient} from 'mongodb';
import request from 'supertest';

const serverRequest = request(`http://127.0.0.1:${process.env.PORT}`);
const MONGODB_URL = process.env.MONGODB_URL;

/**
 * For the given uuid, waits until the current status is no longer the passed currentStatus argument, and expects
 * the new status is the passed nextStatus argument.
 * @param {string} uuid
 * @param {string} currentStatus
 * @param {string} nextStatus
 * @param {string} token
 * @param {function} expect
 */
async function waitForStatusUpdate(uuid, currentStatus, nextStatus, token, expect) {
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
 * Fetch user object from database
 * @param {string} email email address
 * @returns {string} random email address
 */
async function getUserFromDatabase(email) {
  const client = await MongoClient.connect(MONGODB_URL, {useNewUrlParser: true});
  let user;
  try {
    const userCollection = await client.db().collection('users');
    user = await userCollection.findOne({email_lowered: email.toLowerCase()});
  } finally {
    await client.close();
  }
  return user;
}

/**
 * Get valid credential
 *
 * @returns {object} email and token
 */
async function getValidCredential() {
  const email = generateEmailAddress();
  await serverRequest
    .post('/mythril/v1/auth/user')
    .send({
      firstName: 'David',
      lastName: 'Martin',
      email,
      termsId: 'no_terms',
    });
  const user = await getUserFromDatabase(email);
  return {email, token: user.apiKey};
}

/**
 * Get valid user
 *
 * @returns {object} user
 */
async function getValidUser() {
  const {email} = await getValidCredential();
  return await getUserFromDatabase(email);
}

/**
 * Set user property
 * @param {string} email email address
 * @param {object} values
 * @returns {object} user user object
 */
async function setUserProperty(email, values) {
  const client = await MongoClient.connect(MONGODB_URL, {useNewUrlParser: true});
  let user;
  try {
    const userCollection = await client.db().collection('users');
    user = await userCollection.findOneAndUpdate({email_lowered: email.toLowerCase()}, {$set: values});
  } finally {
    await client.close();
  }
  return user;
}

/**
 * Make user type unlimited
 * @param {string} email email address
 * @param {object} values
 */
async function makeUserUnlimited(email) {
  await setUserProperty(email, {type: 'unlimited'});
}

export {
  serverRequest,
  waitForStatusUpdate,
  generateEmailAddress,
  getValidCredential,
  getUserFromDatabase,
  getValidUser,
  makeUserUnlimited,
  setUserProperty,
};
