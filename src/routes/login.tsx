import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Eye, EyeOff } from "lucide-react";
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
  const [showPass, setShowPass] = useState(false);

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
    <div className="flex min-h-screen items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background orbs */}
      <div className="orb orb-1" style={{ opacity: 0.6 }} />
      <div className="orb orb-2" style={{ opacity: 0.5 }} />

      <div className="w-full max-w-md relative z-10">
        {/* Logo */}
        <Link to="/" className="mb-10 flex items-center justify-center gap-3 group">
          <span
            className="grid h-11 w-11 place-items-center rounded-xl group-hover:scale-105 transition-transform animate-pulse-glow"
            style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 265), oklch(0.65 0.22 320))" }}
          >
            <BookOpen className="h-6 w-6 text-white" strokeWidth={2.25} />
          </span>
          <span className="font-display text-3xl text-foreground">
            Toyamas{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.82 0.18 265), oklch(0.78 0.18 320))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Library
            </span>
          </span>
        </Link>

        {/* Form Card */}
        <div
          className="glass-card p-8"
          style={{ boxShadow: "0 24px 80px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.28 0.025 255 / 0.3)" }}
        >
          <div className="mb-6">
            <h1 className="font-display text-4xl text-foreground">Masuk</h1>
            <p className="mt-1 text-sm text-muted-foreground">Lanjutkan membaca koleksi Anda.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-1.5">
              <Label htmlFor="u" className="text-sm font-medium text-foreground/80">Username</Label>
              <Input
                id="u"
                value={username}
                onChange={(e) => setU(e.target.value)}
                autoComplete="username"
                required
                minLength={3}
                maxLength={24}
                placeholder="username Anda"
                className="h-11 rounded-xl border-0 text-foreground placeholder:text-muted-foreground/50"
                style={{
                  background: "oklch(0.12 0.015 260 / 0.8)",
                  border: "1px solid oklch(0.28 0.025 255 / 0.5)",
                }}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="p" className="text-sm font-medium text-foreground/80">Password</Label>
              <div className="relative">
                <Input
                  id="p"
                  type={showPass ? "text" : "password"}
                  value={password}
                  onChange={(e) => setP(e.target.value)}
                  autoComplete="current-password"
                  required
                  minLength={6}
                  placeholder="••••••••"
                  className="h-11 rounded-xl border-0 pr-11 text-foreground placeholder:text-muted-foreground/50"
                  style={{
                    background: "oklch(0.12 0.015 260 / 0.8)",
                    border: "1px solid oklch(0.28 0.025 255 / 0.5)",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="btn-primary w-full h-11 rounded-xl font-semibold text-white text-base mt-2"
            >
              <span className="relative z-10">{loading ? "Memproses..." : "Masuk"}</span>
            </Button>
          </form>

          <div className="mt-6 divider-glow" />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Belum punya akun?{" "}
            <Link
              to="/register"
              className="font-semibold hover:underline"
              style={{ color: "oklch(0.82 0.18 265)" }}
            >
              Daftar gratis
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
