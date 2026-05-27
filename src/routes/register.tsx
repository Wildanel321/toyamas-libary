import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { BookOpen } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Daftar — Toyamas Library" }, { name: "description", content: "Buat akun gratis untuk mulai membaca di Toyamas Library." }] }),
  component: Register,
});

function Register() {
  const { signUpWithUsername, user } = useAuth();
  const navigate = useNavigate();
  const [username, setU] = useState("");
  const [displayName, setD] = useState("");
  const [password, setP] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => { if (user) navigate({ to: "/" }); }, [user, navigate]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const { error } = await signUpWithUsername(username, password, displayName);
    setLoading(false);
    if (error) toast.error(error);
    else { toast.success("Akun berhasil dibuat!"); navigate({ to: "/" }); }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <Link to="/" className="mb-8 flex items-center justify-center gap-2.5">
          <span className="grid h-10 w-10 place-items-center rounded-md bg-spine text-primary-foreground"><BookOpen className="h-5 w-5" /></span>
          <span className="font-display text-3xl">Toyamas <span className="text-secondary">Library</span></span>
        </Link>
        <div className="rounded-xl border border-border/60 bg-card p-8 shadow-soft">
          <h1 className="font-display text-3xl">Daftar gratis</h1>
          <p className="mt-1 text-sm text-muted-foreground">Untuk semua orang yang ingin literasi.</p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4">
            <div>
              <Label htmlFor="u">Username</Label>
              <Input id="u" value={username} onChange={(e) => setU(e.target.value.toLowerCase())} required minLength={3} maxLength={24} pattern="[a-z0-9_]+" placeholder="contoh: budi_pintar" />
              <p className="mt-1 text-xs text-muted-foreground">3-24 karakter, huruf kecil, angka, underscore.</p>
            </div>
            <div>
              <Label htmlFor="d">Nama Tampilan</Label>
              <Input id="d" value={displayName} onChange={(e) => setD(e.target.value)} maxLength={60} placeholder="Budi Santoso" />
            </div>
            <div>
              <Label htmlFor="p">Password</Label>
              <Input id="p" type="password" value={password} onChange={(e) => setP(e.target.value)} required minLength={6} autoComplete="new-password" />
            </div>
            <Button type="submit" disabled={loading} className="w-full bg-spine text-primary-foreground hover:opacity-90">
              {loading ? "Memproses..." : "Buat Akun"}
            </Button>
          </form>
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Sudah punya akun? <Link to="/login" className="font-medium text-secondary hover:underline">Masuk</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
