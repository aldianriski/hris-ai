/**
 * Tests for API response utilities
 */

import { describe, it, expect } from 'vitest';
import { successResponse, errorResponse, paginatedResponse } from '@/lib/api/response';

describe('API Response Utilities', () => {
  describe('successResponse', () => {
    it('should create a successful response with 200 status', () => {
      const data = { message: 'Success' };
      const response = successResponse(data);

      expect(response.status).toBe(200);
      const jsonData = JSON.parse(response.body);
      expect(jsonData.success).toBe(true);
      expect(jsonData.data).toEqual(data);
    });

    it('should create a successful response with custom status', () => {
      const data = { id: '123' };
      const response = successResponse(data, 201);

      expect(response.status).toBe(201);
      const jsonData = JSON.parse(response.body);
      expect(jsonData.success).toBe(true);
      expect(jsonData.data).toEqual(data);
    });
  });

  describe('errorResponse', () => {
    it('should create an error response with correct structure', () => {
      const response = errorResponse('VAL_2001', 'Validation failed', 400);

      expect(response.status).toBe(400);
      const jsonData = JSON.parse(response.body);
      expect(jsonData.success).toBe(false);
      expect(jsonData.error).toEqual({
        code: 'VAL_2001',
        message: 'Validation failed',
      });
    });

    it('should include additional data in error response', () => {
      const additionalData = { field: 'email' };
      const response = errorResponse('VAL_2001', 'Invalid email', 400, additionalData);

      const jsonData = JSON.parse(response.body);
      expect(jsonData.error.code).toBe('VAL_2001');
      expect(jsonData.error.message).toBe('Invalid email');
      expect(jsonData.error.field).toBe('email');
    });
  });

  describe('paginatedResponse', () => {
    it('should create a paginated response with correct structure', () => {
      const data = [{ id: 1 }, { id: 2 }];
      const response = paginatedResponse(data, 10, 1, 5);

      expect(response.status).toBe(200);
      const jsonData = JSON.parse(response.body);
      expect(jsonData.success).toBe(true);
      expect(jsonData.data).toEqual(data);
      expect(jsonData.pagination).toEqual({
        page: 1,
        limit: 5,
        total: 10,
        totalPages: 2,
      });
    });

    it('should calculate correct totalPages', () => {
      const data = [{ id: 1 }];
      const response = paginatedResponse(data, 25, 1, 10);

      const jsonData = JSON.parse(response.body);
      expect(jsonData.pagination.totalPages).toBe(3);
    });
  });
});
