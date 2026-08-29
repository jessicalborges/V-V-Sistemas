import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://fctjczxfjyktrowtpdpp.supabase.co';

const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZjdGpjenhmanktcm93dHBkcHAiLCJyb2xlIjoiYW5vbiIsImlhdCI6MTczNjU2MjE2NiwiZXhwIjoyMDUyMTM4MTY2fQ.a5Tbs_V9IrZp-iY8t0VEIxv0Azu6vkC7j_pf1kOHT70';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);