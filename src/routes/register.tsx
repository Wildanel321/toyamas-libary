import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Daftar — Toyamas Library" }, { name: "description", content: "Buat akun gratis untuk mulai membaca di Toyamas Library." }] }),
  component: Register,
});

const inputStyle = {
  background: "oklch(0.12 0.015 260 / 0.8)",
  border: "1px solid oklch(0.28 0.025 255 / 0.5)",
};

function Register() {
  const { signUpWithUsername, user } = useAuth();
  const navigate = useNavigate();
  const [username, setU] = useState("");
  const [displayName, setD] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUpWithUsername(username, password, displayName);
    setLoading(false);
    if (error) toast.error(error);
    else { toast.success("Akun berhasil dibuat!"); navigate({ to: "/" }); }
  }

  const perks = [
    "Baca ribuan buku PDF gratis",
    "Simpan riwayat pinjaman",
    "Akses 24 jam sehari",
  ];

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

        {/* Perks */}
        <div className="mb-5 flex flex-col gap-2">
          {perks.map((p) => (
            <div key={p} className="flex items-center gap-2 text-sm text-muted-foreground">
              <CheckCircle2 className="h-4 w-4 flex-shrink-0" style={{ color: "oklch(0.75 0.20 185)" }} />
              {p}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div
          className="glass-card p-8"
          style={{ boxShadow: "0 24px 80px oklch(0 0 0 / 0.5), 0 0 0 1px oklch(0.28 0.025 255 / 0.3)" }}
        >
          <div className="mb-6">
            <h1 className="font-display text-4xl text-foreground">Daftar Gratis</h1>
            <p className="mt-1 text-sm text-muted-foreground">Untuk semua orang yang ingin literasi.</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="u" className="text-sm font-medium text-foreground/80">Username</Label>
              <Input
                id="u"
                value={username}
                onChange={(e) => setU(e.target.value.toLowerCase())}
                required
                minLength={3}
                maxLength={24}
                pattern="[a-z0-9_]+"
                placeholder="contoh: budi_pintar"
                className="h-11 rounded-xl border-0 text-foreground placeholder:text-muted-foreground/50"
                style={inputStyle}
              />
              <p className="text-xs text-muted-foreground">3-24 karakter, huruf kecil, angka, underscore.</p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="d" className="text-sm font-medium text-foreground/80">Nama Tampilan</Label>
              <Input
                id="d"
                value={displayName}
                onChange={(e) => setD(e.target.value)}
                maxLength={60}
                placeholder="Budi Santoso"
                className="h-11 rounded-xl border-0 text-foreground placeholder:text-muted-foreground/50"
                style={inputStyle}
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
                  required
                  minLength={6}
                  autoComplete="new-password"
                  placeholder="Min. 6 karakter"
                  className="h-11 rounded-xl border-0 pr-11 text-foreground placeholder:text-muted-foreground/50"
                  style={inputStyle}
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
              <span className="relative z-10">{loading ? "Memproses..." : "Buat Akun"}</span>
            </Button>
          </form>

          <div className="mt-6 divider-glow" />

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun?{" "}
            <Link
              to="/login"
              className="font-semibold hover:underline"
              style={{ color: "oklch(0.82 0.18 265)" }}
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
