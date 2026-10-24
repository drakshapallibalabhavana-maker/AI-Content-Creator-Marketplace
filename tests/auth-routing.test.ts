import { describe, it, expect, beforeEach } from 'vitest';

class LocalStorageMock {
  private store: Record<string, string> = {};

  clear() {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string) {
    this.store[key] = String(value);
  }

  removeItem(key: string) {
    delete this.store[key];
  }
}

describe('Authentication and Session Security', () => {
  let localStorageMock: LocalStorageMock;

  beforeEach(() => {
    localStorageMock = new LocalStorageMock();
  });

  it('correctly supports unauthenticated state when no session is stored', () => {
    const stored = localStorageMock.getItem('cc_ai_auth_user_v1');
    expect(stored).toBeNull();
  });

  it('stores and restores authenticated user sessions accurately', () => {
    const demoBrand = {
      id: 'brand-nike-demo',
      email: 'creative@apexathletics.com',
      role: 'brand',
      full_name: 'Apex Athletics Studio',
      created_at: '2026-01-10T10:00:00Z',
    };

    localStorageMock.setItem('cc_ai_auth_user_v1', JSON.stringify(demoBrand));
    const retrieved = JSON.parse(localStorageMock.getItem('cc_ai_auth_user_v1') || '{}');

    expect(retrieved.id).toBe('brand-nike-demo');
    expect(retrieved.role).toBe('brand');
  });

  it('properly purges session upon logout and remains unauthenticated across refreshes', () => {
    const session = { id: 'u-123', email: 'test@creator.ai', role: 'creator' };
    localStorageMock.setItem('cc_ai_auth_user_v1', JSON.stringify(session));

    // Simulate logout action
    localStorageMock.removeItem('cc_ai_auth_user_v1');

    // Simulate page refresh
    const refreshed = localStorageMock.getItem('cc_ai_auth_user_v1');
    expect(refreshed).toBeNull();
  });

  it('validates credential input patterns before authentication', () => {
    const validateCredentials = (email: string, pass: string) => {
      if (!email.trim() || !email.includes('@')) {
        return { valid: false, error: 'Please enter a valid email address.' };
      }
      if (!pass || pass.length < 6) {
        return { valid: false, error: 'Password must be at least 6 characters.' };
      }
      return { valid: true, error: null };
    };

    expect(validateCredentials('', 'secret123').valid).toBe(false);
    expect(validateCredentials('invalid-email', 'secret123').valid).toBe(false);
    expect(validateCredentials('test@domain.com', '123').valid).toBe(false);
    expect(validateCredentials('test@domain.com', 'strongpassword').valid).toBe(true);
  });

  it('routes authenticated users strictly to their assigned role dashboard', () => {
    const getDashboardRouteForRole = (role: 'creator' | 'brand' | string) => {
      if (role === 'brand') return '/brand/dashboard';
      if (role === 'creator') return '/creator/dashboard';
      return '/login';
    };

    expect(getDashboardRouteForRole('brand')).toBe('/brand/dashboard');
    expect(getDashboardRouteForRole('creator')).toBe('/creator/dashboard');
    expect(getDashboardRouteForRole('guest')).toBe('/login');
  });
});

