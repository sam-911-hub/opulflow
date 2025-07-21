import { render } from '@testing-library/react';
import { AuthContext } from '@/context/AuthContext';
import React from 'react';

// Mock AuthContext for testing components that use useAuth
export function renderWithAuth(ui: React.ReactNode, authValues = {}) {
  const defaultAuthValues = {
    user: null,
    loading: false,
    accountType: 'free',
    role: null,
    ...authValues
  };
  
  return render(
    React.createElement(
      AuthContext.Provider,
      { value: defaultAuthValues as any },
      ui
    )
  );
}

// Mock Firebase for testing
export const mockFirebase = () => {
  jest.mock('./firebase', () => ({
    auth: {
      onAuthStateChanged: jest.fn(),
      signOut: jest.fn().mockResolvedValue(true)
    },
    db: {
      collection: jest.fn().mockReturnValue({
        doc: jest.fn().mockReturnValue({
          get: jest.fn().mockResolvedValue({
            exists: true,
            data: jest.fn().mockReturnValue({})
          }),
          set: jest.fn().mockResolvedValue(true),
          update: jest.fn().mockResolvedValue(true)
        }),
        add: jest.fn().mockResolvedValue({ id: 'mock-id' }),
        where: jest.fn().mockReturnThis(),
        orderBy: jest.fn().mockReturnThis(),
        limit: jest.fn().mockReturnThis(),
        get: jest.fn().mockResolvedValue({
          docs: [],
          empty: true
        })
      })
    }
  }));
};

// Mock fetch for API testing
export const mockFetch = (responseData: any, status = 200) => {
  global.fetch = jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: jest.fn().mockResolvedValue(responseData)
  });
};

// Clean up mocks after tests
export const cleanupMocks = () => {
  jest.restoreAllMocks();
  if (global.fetch && typeof global.fetch === 'function' && (global.fetch as any).mockRestore) {
    (global.fetch as any).mockRestore();
  }
};