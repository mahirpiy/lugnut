import { createClient } from "@supabase/supabase-js";

const createSupabaseServerClient = () => {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
};

export const supabaseServerClient = createSupabaseServerClient();
