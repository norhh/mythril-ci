import config from 'config';
import httpStatus from 'http-status';
import {MongoClient} from 'mongodb';
import request from 'supertest';
import uuidV4 from 'uuid/v4';

const serverRequest = request(`http://127.0.0.1:${process.env.PORT}`);

/**
 * Waits until the specified analysis has necessary status.
 * @param {String} uuid
 * @param {String} status
 * @param {String} token
 */
async function waitAnalysisStatus(uuid, status, token) {
  const DELAY = 100;
  for (;;) { // eslint-disable-line no-restricted-syntax
    const res = await serverRequest
      .get(`/v1/analyses/${uuid}`)
      .set('Authorization', `Bearer ${token}`)
      .expect(httpStatus.OK);
    if (res.body.status === status) {
      return;
    }
    await Promise.delay(DELAY);
  }
}

/**
 * Generate random email address
 * @returns {string} random email address
 */
function generateEmailAddress() {
  return `${uuidV4()}@test.com`;
}

/**
 * Fetch user object from database
 * @param {string} email email address
 * @returns {string} random email address
 */
async function getUserFromDatabase(email) {
  const client = await MongoClient.connect(
    config.MONGODB_URL, {
      useNewUrlParser: true,
    },
  );
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
    .post('/v1/auth/user')
    .send({
      firstName: 'David',
      gReCaptcha: 'DUMMY_TOKEN',
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
  const client = await MongoClient.connect(
    config.MONGODB_URL, {
      useNewUrlParser: true,
    },
  );
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
  generateEmailAddress,
  getValidCredential,
  getUserFromDatabase,
  getValidUser,
  makeUserUnlimited,
  setUserProperty,
  waitAnalysisStatus,
};
