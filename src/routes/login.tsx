import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Masuk — Toyamas Library" }, { name: "description", content: "Masuk ke akun Toyamas Library Anda." }] }),
  component: Login,
});

function Login() {
  const { signInWithUsername, user } = useAuth();
  const navigate = useNavigate();
  const [username, setU] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signInWithUsername(username, password);
    setLoading(false);
    if (error) toast.error(error);
    else { toast.success("Selamat datang kembali!"); navigate({ to: "/" }); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-spine text-primary-foreground"><BookOpen className="h-5 w-5" /></span>
          <span className="font-display text-3xl">Toyamas <span className="text-secondary">Library</span></span>
        </Link>
        <div className="rounded-xl border border-border/60 bg-card p-8 shadow-soft">
          <h1 className="font-display text-3xl">Masuk</h1>
          <p className="mt-1 text-sm text-muted-foreground">Lanjutkan membaca koleksi Anda.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={username} onChange={(e) => setU(e.target.value)} autoComplete="username" required minLength={3} maxLength={24} />
            </div>
            <div>
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setP(e.target.value)} autoComplete="current-password" required minLength={6} />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-spine text-primary-foreground hover:opacity-90">
              {loading ? "Memproses..." : "Masuk"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun? <Link to="/register" className="font-medium text-secondary hover:underline">Daftar</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
