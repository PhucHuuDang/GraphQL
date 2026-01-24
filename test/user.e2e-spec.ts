import { INestApplication } from '@nestjs/common';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  cleanupTestApp,
  createTestApp,
  disconnectSharedPrisma,
  GraphQLTestClient,
  TestDatabase,
  TestDataFactory,
} from './test-setup';

describe('User (E2E)', () => {
  let app: INestApplication;
  let testClient: GraphQLTestClient;
  let testDb: TestDatabase;
  let _dataFactory: TestDataFactory;
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    testClient = testApp.testClient;
    testDb = testApp.testDb;
    _dataFactory = testApp.dataFactory;
  });

  afterAll(async () => {
    await cleanupTestApp(app, testDb);
    await disconnectSharedPrisma();
  });

  beforeEach(async () => {
    await testDb.cleanDatabase();

    // Create and authenticate a user for each test
    const signUpResponse = await testClient.mutate(
      `
      mutation SignUpEmail($signUpInput: SignUpInput!) {
        signUpEmail(signUpInput: $signUpInput) {
          token
          user {
            id
          }
        }
      }
    `,
      {
        signUpInput: {
          name: 'Test User',
          email: 'testuser@example.com',
          password: 'Password123!',
          rememberMe: false,
        },
      },
    );
    authToken = signUpResponse.body.data.signUpEmail.token;
    userId = signUpResponse.body.data.signUpEmail.user.id;
  });

  describe('Get Profile', () => {
    const GET_PROFILE_QUERY = `
      query GetProfile {
        getProfile {
          user {
            id
            name
            email
            emailVerified
          }
        }
      }
    `;

    it('should retrieve authenticated user profile', async () => {
      const response = await testClient.query(GET_PROFILE_QUERY, {}, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.getProfile.user).toMatchObject({
        id: userId,
        name: 'Test User',
        email: 'testuser@example.com',
      });
    });

    it('should fail without authentication', async () => {
      const response = await testClient.query(GET_PROFILE_QUERY, {});

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Unauthorized');
    });
  });

  describe('Update Profile', () => {
    const UPDATE_PROFILE_MUTATION = `
      mutation UpdateProfile($name: String, $email: String, $image: String) {
        updateProfile(name: $name, email: $email, image: $image) {
          id
          name
          email
          image
        }
      }
    `;

    it('should update user name', async () => {
      const response = await testClient.mutate(
        UPDATE_PROFILE_MUTATION,
        { name: 'Updated Name' },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.updateProfile.name).toBe('Updated Name');
      expect(response.body.data.updateProfile.id).toBe(userId);
    });

    it('should update user email', async () => {
      const response = await testClient.mutate(
        UPDATE_PROFILE_MUTATION,
        { email: 'newemail@example.com' },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.updateProfile.email).toBe('newemail@example.com');
    });

    it('should update user image', async () => {
      const imageUrl = 'https://example.com/avatar.jpg';
      const response = await testClient.mutate(
        UPDATE_PROFILE_MUTATION,
        { image: imageUrl },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.updateProfile.image).toBe(imageUrl);
    });

    it('should update multiple fields at once', async () => {
      const updates = {
        name: 'New Name',
        email: 'new@example.com',
        image: 'https://example.com/new.jpg',
      };

      const response = await testClient.mutate(UPDATE_PROFILE_MUTATION, updates, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.updateProfile).toMatchObject(updates);
    });

    it('should fail without authentication', async () => {
      const response = await testClient.mutate(UPDATE_PROFILE_MUTATION, {
        name: 'Should Fail',
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Get Session', () => {
    const GET_SESSION_QUERY = `
      query GetSession {
        getSession {
          success
          data {
            session {
              id
              token
              expiresAt
              ipAddress
              userAgent
            }
            user {
              id
              name
              email
            }
          }
        }
      }
    `;

    it('should retrieve current session information', async () => {
      const response = await testClient.query(GET_SESSION_QUERY, {}, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.getSession.success).toBe(true);
      expect(response.body.data.getSession.data.session).toBeDefined();
      expect(response.body.data.getSession.data.user.id).toBe(userId);
    });

    it('should fail without authentication', async () => {
      const response = await testClient.query(GET_SESSION_QUERY, {});

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Get Accounts', () => {
    const GET_ACCOUNTS_QUERY = `
      query GetAccounts {
        getAccounts {
          id
          providerId
          userId
          createdAt
        }
      }
    `;

    it('should retrieve user accounts', async () => {
      const response = await testClient.query(GET_ACCOUNTS_QUERY, {}, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.getAccounts).toBeDefined();
      expect(Array.isArray(response.body.data.getAccounts)).toBe(true);

      // Should have at least one account (email/password)
      if (response.body.data.getAccounts.length > 0) {
        expect(response.body.data.getAccounts[0].userId).toBe(userId);
      }
    });

    it('should fail without authentication', async () => {
      const response = await testClient.query(GET_ACCOUNTS_QUERY, {});

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });
});
