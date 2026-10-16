export type AuthenticatedUser = {
  id: string;
  email: string | null;
  /** From Supabase user_metadata.first_name when present. */
  firstName?: string | null;
};

export type AuthPort = {
  verifyAccessToken: (accessToken: string) => Promise<AuthenticatedUser | null>;
};
