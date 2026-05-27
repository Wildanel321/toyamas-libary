import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Session, User } from "@supabase/supabase-js";

interface Profile {
  username: string;
  display_name: string | null;
  isAdmin: boolean;
}

interface AuthCtx {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  loading: boolean;
  signInWithUsername: (username: string, password: string) => Promise<{ error?: string }>;
  signUpWithUsername: (username: string, password: string, displayName?: string) => Promise<{ error?: string }>;
  signOut: () => Promise<void>;
}

const Ctx = createContext<AuthCtx | null>(null);

function usernameToEmail(u: string) {
  return `${u.trim().toLowerCase()}@toyamas.local`;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, s) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (!s?.user) setProfile(null);
      else setTimeout(() => loadProfile(s.user.id), 0);
    });
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setUser(data.session?.user ?? null);
      if (data.session?.user) loadProfile(data.session.user.id).finally(() => setLoading(false));
      else setLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  async function loadProfile(uid: string) {
    const [{ data: p }, { data: r }] = await Promise.all([
      supabase.from("profiles").select("username,display_name").eq("user_id", uid).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", uid).eq("role", "admin").maybeSingle(),
    ]);
    if (p) setProfile({ username: p.username, display_name: p.display_name, isAdmin: !!r });
  }

  return (
    <Ctx.Provider
      value={{
        user, session, profile, loading,
        signInWithUsername: async (username, password) => {
          const { error } = await supabase.auth.signInWithPassword({
            email: usernameToEmail(username), password,
          });
          return error ? { error: "Username atau password salah" } : {};
        },
        signUpWithUsername: async (username, password, displayName) => {
          const clean = username.trim().toLowerCase();
          if (!/^[a-z0-9_]{3,24}$/.test(clean)) return { error: "Username 3-24 karakter (huruf kecil, angka, _)" };
          if (password.length < 6) return { error: "Password minimal 6 karakter" };
          const { error } = await supabase.auth.signUp({
            email: usernameToEmail(clean),
            password,
            options: { data: { username: clean, display_name: displayName || clean } },
          });
          if (error) {
            if (error.message.toLowerCase().includes("already")) return { error: "Username sudah dipakai" };
            return { error: error.message };
          }
          return {};
        },
        signOut: async () => { await supabase.auth.signOut(); },
      }}
    >
      {children}
    </Ctx.Provider>
  );
}

export function useAuth() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth must be used within AuthProvider");
  return c;
}
