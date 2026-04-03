/**
 * Shared authentication utilities for Edge Functions.
 * Prevents BOLA by always using the authenticated user's ID.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface AuthResult {
  user: { id: string; email?: string };
  client: ReturnType<typeof createClient>;
}

/**
 * Creates a Supabase client authenticated with the request's Authorization header.
 * Returns the authenticated user and client, or throws on failure.
 */
export async function getAuthenticatedUser(req: Request): Promise<AuthResult> {
  const authHeader = req.headers.get("Authorization");
  if (!authHeader) {
    throw new AuthError("No authorization header", 401);
  }

  const client = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? "",
    { global: { headers: { Authorization: authHeader } } }
  );

  const {
    data: { user },
    error,
  } = await client.auth.getUser();

  if (error || !user) {
    throw new AuthError("User not authenticated", 401);
  }

  return { user, client };
}

/**
 * Creates a Supabase client with service role privileges.
 * Use only for admin operations (e.g., deleting user data).
 */
export function createServiceClient(): ReturnType<typeof createClient> {
  return createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "AuthError";
    this.status = status;
  }
}
