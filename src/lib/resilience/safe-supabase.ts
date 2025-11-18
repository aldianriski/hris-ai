/**
 * Safe Supabase Client Wrapper
 * Provides graceful degradation if Supabase is unavailable
 */

import { createClient } from '@/lib/supabase/server';
import { safeDbQuery } from './service-wrapper';

/**
 * Safe Supabase query wrapper
 * Returns { data, error } even if Supabase is down
 */
export async function safeSupabaseQuery<T>(
  queryFn: (client: ReturnType<typeof createClient>) => Promise<T>,
  fallback?: T
) {
  try {
    // Check if Supabase is configured
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.warn('[Supabase] Not configured, using fallback');
      return { data: fallback ?? null, error: new Error('Supabase not configured') };
    }

    const client = createClient();
    const data = await queryFn(client);

    return { data, error: null };
  } catch (error) {
    console.error('[Supabase] Query failed:', error);
    return {
      data: fallback ?? null,
      error: error as Error,
    };
  }
}

/**
 * Safe auth check
 * Returns null user if auth fails instead of throwing
 */
export async function safeGetUser() {
  try {
    const client = createClient();
    const { data, error } = await client.auth.getUser();

    if (error) {
      console.warn('[Supabase Auth] getUser failed:', error);
      return { user: null, error };
    }

    return { user: data.user, error: null };
  } catch (error) {
    console.error('[Supabase Auth] Unexpected error:', error);
    return { user: null, error: error as Error };
  }
}

/**
 * Safe session check
 * Returns null session if check fails
 */
export async function safeGetSession() {
  try {
    const client = createClient();
    const { data, error } = await client.auth.getSession();

    if (error) {
      console.warn('[Supabase Auth] getSession failed:', error);
      return { session: null, error };
    }

    return { session: data.session, error: null };
  } catch (error) {
    console.error('[Supabase Auth] Unexpected error:', error);
    return { session: null, error: error as Error };
  }
}

/**
 * Check if Supabase is available
 */
export async function isSupabaseAvailable(): Promise<boolean> {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      return false;
    }

    const response = await fetch(
      `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/`,
      {
        headers: {
          apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        },
        signal: AbortSignal.timeout(3000),
      }
    );

    return response.ok;
  } catch (error) {
    return false;
  }
}
