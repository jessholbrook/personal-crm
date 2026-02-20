import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// TODO: Add Database generic once types are generated via `supabase gen types`
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(
          cookiesToSet: Array<{
            name: string;
            value: string;
            options?: Parameters<typeof cookieStore.set>[2];
          }>
        ) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => {
              if (options) {
                cookieStore.set(name, value, options);
              } else {
                cookieStore.set(name, value);
              }
            });
          } catch {
            // Called from a Server Component — safe to ignore.
            // Proxy handles session refresh.
          }
        },
      },
    }
  );
}
