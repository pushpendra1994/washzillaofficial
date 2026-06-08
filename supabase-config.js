export const supabaseConfig = {
  url: "YOUR_SUPABASE_PROJECT_URL",
  anonKey: "YOUR_SUPABASE_ANON_KEY",
};

export const hasSupabaseConfig =
  supabaseConfig.url !== "YOUR_SUPABASE_PROJECT_URL" &&
  supabaseConfig.anonKey !== "YOUR_SUPABASE_ANON_KEY";
