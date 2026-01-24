import { INestApplication } from '@nestjs/common';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  cleanupTestApp,
  createTestApp,
  GraphQLTestClient,
  TestDatabase,
  TestDataFactory,
} from './test-setup';

describe('Authentication (E2E)', () => {
  let app: INestApplication;
  let testClient: GraphQLTestClient;
  let testDb: TestDatabase;
  let _dataFactory: TestDataFactory;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    testClient = testApp.testClient;
    testDb = testApp.testDb;
    _dataFactory = testApp.dataFactory;
  });

  afterAll(async () => {
    await cleanupTestApp(app, testDb);
  });

  beforeEach(async () => {
    await testDb.cleanDatabase();
  });

  describe('Sign Up', () => {
    const SIGN_UP_MUTATION = `
      mutation SignUpEmail($signUpInput: SignUpInput!) {
        signUpEmail(signUpInput: $signUpInput) {
          token
          user {
            id
            name
            email
            createdAt
          }
        }
      }
    `;

    it('should create a new user with valid credentials', async () => {
      const signUpInput = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'SecurePassword123!',
        rememberMe: false,
      };

      const response = await testClient.mutate(SIGN_UP_MUTATION, {
        signUpInput,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.signUpEmail).toBeDefined();
      expect(response.body.data.signUpEmail.token).toBeDefined();
      expect(response.body.data.signUpEmail.user).toMatchObject({
        name: signUpInput.name,
        email: signUpInput.email,
      });
      expect(response.body.data.signUpEmail.user.id).toBeDefined();
    });

    it('should fail with duplicate email', async () => {
      const signUpInput = {
        name: 'Jane Doe',
        email: 'duplicate@example.com',
        password: 'Password123!',
        rememberMe: false,
      };

      // First signup
      await testClient.mutate(SIGN_UP_MUTATION, { signUpInput });

      // Duplicate signup
      const response = await testClient.mutate(SIGN_UP_MUTATION, {
        signUpInput,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('already exists');
    });

    it('should validate required fields', async () => {
      const invalidInput = {
        name: '',
        email: 'invalid-email',
        password: 'weak',
      };

      const response = await testClient.mutate(SIGN_UP_MUTATION, {
        signUpInput: invalidInput,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Sign In', () => {
    const SIGN_IN_MUTATION = `
      mutation SignInEmail($signInInput: SignInInput!) {
        signInEmail(signInInput: $signInInput) {
          token
          user {
            id
            name
            email
          }
        }
      }
    `;

    it('should authenticate user with valid credentials', async () => {
      // Create a user first via signup
      const signUpInput = {
        name: 'Test User',
        email: 'signin-test@example.com',
        password: 'TestPassword123!',
        rememberMe: false,
      };

      await testClient.mutate(
        `
        mutation SignUpEmail($signUpInput: SignUpInput!) {
          signUpEmail(signUpInput: $signUpInput) {
            token
          }
        }
      `,
        { signUpInput },
      );

      // Now sign in
      const signInInput = {
        email: 'signin-test@example.com',
        password: 'TestPassword123!',
        rememberMe: false,
      };

      const response = await testClient.mutate(SIGN_IN_MUTATION, {
        signInInput,
      });

      expect(response.status).toBe(200);
      expect(response.body.data.signInEmail).toBeDefined();
      expect(response.body.data.signInEmail.token).toBeDefined();
      expect(response.body.data.signInEmail.user.email).toBe(signInInput.email);
    });

    it('should fail with invalid password', async () => {
      // Create a user first
      const signUpInput = {
        name: 'Test User',
        email: 'invalid-pwd@example.com',
        password: 'CorrectPassword123!',
        rememberMe: false,
      };

      await testClient.mutate(
        `
        mutation SignUpEmail($signUpInput: SignUpInput!) {
          signUpEmail(signUpInput: $signUpInput) {
            token
          }
        }
      `,
        { signUpInput },
      );

      // Try signing in with wrong password
      const signInInput = {
        email: 'invalid-pwd@example.com',
        password: 'WrongPassword123!',
        rememberMe: false,
      };

      const response = await testClient.mutate(SIGN_IN_MUTATION, {
        signInInput,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Invalid');
    });

    it('should fail with non-existent email', async () => {
      const signInInput = {
        email: 'nonexistent@example.com',
        password: 'Password123!',
        rememberMe: false,
      };

      const response = await testClient.mutate(SIGN_IN_MUTATION, {
        signInInput,
      });

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Sign Out', () => {
    const SIGN_OUT_MUTATION = `
      mutation SignOut {
        signOut {
          success
        }
      }
    `;

    it('should sign out authenticated user', async () => {
      // Create and sign in a user
      const signUpInput = {
        name: 'Signout Test',
        email: 'signout@example.com',
        password: 'Password123!',
        rememberMe: false,
      };

      const signUpResponse = await testClient.mutate(
        `
        mutation SignUpEmail($signUpInput: SignUpInput!) {
          signUpEmail(signUpInput: $signUpInput) {
            token
          }
        }
      `,
        { signUpInput },
      );

      const token = signUpResponse.body.data.signUpEmail.token;

      // Sign out
      const response = await testClient.mutate(SIGN_OUT_MUTATION, {}, token);

      expect(response.status).toBe(200);
      expect(response.body.data.signOut.success).toBe(true);
    });

    it('should handle sign out without authentication', async () => {
      const response = await testClient.mutate(SIGN_OUT_MUTATION, {});

      // Should either succeed gracefully or return an error
      expect(response.status).toBe(200);
    });
  });

  describe('Protected Routes', () => {
    const GET_PROFILE_QUERY = `
      query GetProfile {
        getProfile {
          user {
            id
            name
            email
          }
        }
      }
    `;

    it('should deny access without authentication token', async () => {
      const response = await testClient.query(GET_PROFILE_QUERY);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0].message).toContain('Unauthorized');
    });

    it('should allow access with valid authentication token', async () => {
      // Create and sign in a user
      const signUpInput = {
        name: 'Protected User',
        email: 'protected@example.com',
        password: 'Password123!',
        rememberMe: false,
      };

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
        { signUpInput },
      );

      const token = signUpResponse.body.data.signUpEmail.token;

      // Access protected route
      const response = await testClient.query(GET_PROFILE_QUERY, {}, token);

      expect(response.status).toBe(200);
      expect(response.body.data.getProfile).toBeDefined();
      expect(response.body.data.getProfile.user.email).toBe(signUpInput.email);
    });
  });
});
