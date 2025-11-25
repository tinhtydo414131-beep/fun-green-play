import { useState, useEffect } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    // THEN check for existing session (including stored session)
    const initAuth = async () => {
      // Check for stored session from "Remember Me"
      const storedSession = localStorage.getItem("kidcrypto_session");
      if (storedSession) {
        try {
          const parsedSession = JSON.parse(storedSession);
          const { data, error } = await supabase.auth.setSession({
            access_token: parsedSession.access_token,
            refresh_token: parsedSession.refresh_token,
          });
          
          if (!error && data.session) {
            setSession(data.session);
            setUser(data.session.user);
          } else {
            localStorage.removeItem("kidcrypto_session");
          }
        } catch (err) {
          localStorage.removeItem("kidcrypto_session");
        }
      }

      // Check current session
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    };

    initAuth();

    return () => subscription.unsubscribe();
  }, []);

  const signOut = async () => {
    localStorage.removeItem("kidcrypto_session");
    await supabase.auth.signOut();
  };

  return { user, session, loading, signOut };
};
