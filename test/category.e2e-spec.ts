import { INestApplication } from '@nestjs/common';

import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';

import {
  cleanupTestApp,
  createTestApp,
  GraphQLTestClient,
  TestDatabase,
  TestDataFactory,
} from './test-setup';

describe('Category (E2E)', () => {
  let app: INestApplication;
  let testClient: GraphQLTestClient;
  let testDb: TestDatabase;
  let dataFactory: TestDataFactory;
  let authToken: string;

  beforeAll(async () => {
    const testApp = await createTestApp();
    app = testApp.app;
    testClient = testApp.testClient;
    testDb = testApp.testDb;
    dataFactory = testApp.dataFactory;

    // Create and authenticate a user for protected operations
    const signUpResponse = await testClient.mutate(
      `
      mutation SignUpEmail($signUpInput: SignUpInput!) {
        signUpEmail(signUpInput: $signUpInput) {
          token
        }
      }
    `,
      {
        signUpInput: {
          name: 'Category Tester',
          email: 'category-tester@example.com',
          password: 'Password123!',
          rememberMe: false,
        },
      },
    );
    authToken = signUpResponse.body.data.signUpEmail.token;
  });

  afterAll(async () => {
    await cleanupTestApp(app, testDb);
  });

  beforeEach(async () => {
    // Clean categories but keep the test user
    await testDb.getPrisma().category.deleteMany({});
  });

  describe('Create Category', () => {
    const CREATE_CATEGORY_MUTATION = `
      mutation CreateCategory($input: CreateCategoryDto!) {
        createCategory(input: $input) {
          success
          message
          data {
            id
            name
            slug
            description
            createdAt
          }
        }
      }
    `;

    it('should create a new category', async () => {
      const input = {
        name: 'Technology',
        description: 'All about tech',
      };

      const response = await testClient.mutate(CREATE_CATEGORY_MUTATION, { input }, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.createCategory.success).toBe(true);
      expect(response.body.data.createCategory.data).toMatchObject({
        name: input.name,
        description: input.description,
        slug: 'technology',
      });
      expect(response.body.data.createCategory.data.id).toBeDefined();
    });

    it('should auto-generate slug from name', async () => {
      const input = {
        name: 'Web Development',
        description: 'Web dev topics',
      };

      const response = await testClient.mutate(CREATE_CATEGORY_MUTATION, { input }, authToken);

      expect(response.status).toBe(200);
      expect(response.body.data.createCategory.data.slug).toBe('web-development');
    });

    it('should fail with duplicate name', async () => {
      const input = {
        name: 'Duplicate Category',
        description: 'First category',
      };

      // Create first category
      await testClient.mutate(CREATE_CATEGORY_MUTATION, { input }, authToken);

      // Try to create duplicate
      const response = await testClient.mutate(CREATE_CATEGORY_MUTATION, { input }, authToken);

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });

    it('should validate required fields', async () => {
      const invalidInput = {
        name: '',
        description: '',
      };

      const response = await testClient.mutate(
        CREATE_CATEGORY_MUTATION,
        { input: invalidInput },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('List Categories', () => {
    const LIST_CATEGORIES_QUERY = `
      query Categories {
        categories {
          success
          count
          data {
            id
            name
            slug
            description
          }
        }
      }
    `;

    it('should list all categories', async () => {
      // Create test categories
      await dataFactory.createCategory({ name: 'Category 1' });
      await dataFactory.createCategory({ name: 'Category 2' });
      await dataFactory.createCategory({ name: 'Category 3' });

      const response = await testClient.query(LIST_CATEGORIES_QUERY);

      expect(response.status).toBe(200);
      expect(response.body.data.categories.success).toBe(true);
      expect(response.body.data.categories.count).toBe(3);
      expect(response.body.data.categories.data).toHaveLength(3);
    });

    it('should return empty array when no categories exist', async () => {
      const response = await testClient.query(LIST_CATEGORIES_QUERY);

      expect(response.status).toBe(200);
      expect(response.body.data.categories.success).toBe(true);
      expect(response.body.data.categories.count).toBe(0);
      expect(response.body.data.categories.data).toHaveLength(0);
    });
  });

  describe('Update Category', () => {
    const UPDATE_CATEGORY_MUTATION = `
      mutation UpdateCategory($id: String!, $input: UpdateCategoryDto!) {
        updateCategory(id: $id, input: $input) {
          success
          message
          data {
            id
            name
            description
          }
        }
      }
    `;

    it('should update category name and description', async () => {
      const category = await dataFactory.createCategory({
        name: 'Original Name',
        description: 'Original description',
      });

      const input = {
        name: 'Updated Name',
        description: 'Updated description',
      };

      const response = await testClient.mutate(
        UPDATE_CATEGORY_MUTATION,
        { id: category.id, input },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.updateCategory.success).toBe(true);
      expect(response.body.data.updateCategory.data).toMatchObject({
        id: category.id,
        name: input.name,
        description: input.description,
      });
    });

    it('should fail with non-existent category id', async () => {
      const input = {
        name: 'Updated Name',
      };

      const response = await testClient.mutate(
        UPDATE_CATEGORY_MUTATION,
        { id: 'nonexistent-id', input },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('Delete Category', () => {
    const DELETE_CATEGORY_MUTATION = `
      mutation DeleteCategory($id: String!) {
        deleteCategory(id: $id) {
          success
          message
          data {
            id
            name
          }
        }
      }
    `;

    it('should delete a category', async () => {
      const category = await dataFactory.createCategory({
        name: 'To Delete',
      });

      const response = await testClient.mutate(
        DELETE_CATEGORY_MUTATION,
        { id: category.id },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.data.deleteCategory.success).toBe(true);

      // Verify deletion
      const deletedCategory = await testDb
        .getPrisma()
        .category.findUnique({ where: { id: category.id } });
      expect(deletedCategory).toBeNull();
    });

    it('should fail with non-existent category id', async () => {
      const response = await testClient.mutate(
        DELETE_CATEGORY_MUTATION,
        { id: 'nonexistent-id' },
        authToken,
      );

      expect(response.status).toBe(200);
      expect(response.body.errors).toBeDefined();
    });
  });
});
