import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2, FileSearch, FolderSync, Loader2, RefreshCw, Sparkles, XCircle, FilePlus2, FileCheck2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/hooks/use-auth";
import { syncDriveBooks } from "@/lib/books.functions";

export const Route = createFileRoute("/admin/sync")({
  head: () => ({ meta: [
    { title: "Sinkronisasi Google Drive — Toyamas Library" },
    { name: "description", content: "Pindai folder Google Drive dan tambahkan PDF baru ke katalog perpustakaan." },
    { name: "robots", content: "noindex" },
  ]}),
  component: SyncPage,
});

type Phase = "idle" | "listing" | "importing" | "done" | "error";
type ReportItem = { id: string; title: string; status: "new" | "updated" | "failed"; error?: string; size?: number | null };

function SyncPage() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (profile && !profile.isAdmin) { toast.error("Akses ditolak"); navigate({ to: "/" }); }
  }, [loading, user, profile, navigate]);

  const doSync = useServerFn(syncDriveBooks);
  const [folderId, setFolderId] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [progress, setProgress] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [statusText, setStatusText] = useState("Siap memindai");
  const [result, setResult] = useState<null | { scanned: number; added: number; updated: number; failed: number; report: ReportItem[] }>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const tickRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => () => { if (tickRef.current) clearInterval(tickRef.current); }, []);

  async function handleSync() {
    setPhase("listing");
    setProgress(8);
    setElapsed(0);
    setResult(null);
    setErrorMsg(null);
    setStatusText("Menghubungi Google Drive…");

    const start = Date.now();
    if (tickRef.current) clearInterval(tickRef.current);
    tickRef.current = setInterval(() => {
      setElapsed(Math.round((Date.now() - start) / 100) / 10);
      // simulated easing progress while we wait for the server
      setProgress((p) => {
        if (p < 25) return p + 1.2;
        if (p < 55) return p + 0.6;
        if (p < 85) return p + 0.25;
        return p;
      });
      setStatusText((t) => {
        const seq = ["Menghubungi Google Drive…", "Mendaftar file PDF…", "Memindai metadata…", "Mengimpor ke katalog…"];
        const idx = Math.min(seq.length - 1, Math.floor((Date.now() - start) / 1500));
        return seq[idx];
      });
      if (Date.now() - start > 1200) setPhase("importing");
    }, 200);

    try {
      const res = await doSync({ data: { folderId: folderId.trim() || undefined } });
      if (tickRef.current) clearInterval(tickRef.current);
      setProgress(100);
      setPhase("done");
      setStatusText("Sinkronisasi selesai");
      setResult({ scanned: res.scanned, added: res.added, updated: res.updated, failed: res.failed, report: res.report as ReportItem[] });
      toast.success(`${res.added} buku baru, ${res.updated} diperbarui`);
    } catch (e) {
      if (tickRef.current) clearInterval(tickRef.current);
      setPhase("error");
      setProgress(100);
      setErrorMsg((e as Error).message);
      setStatusText("Sinkronisasi gagal");
      toast.error((e as Error).message);
    }
  }

  if (!profile?.isAdmin) return <div className="min-h-screen"><Header /></div>;

  const running = phase === "listing" || phase === "importing";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto max-w-5xl px-4 py-10">
        <div className="mb-6">
          <Button asChild variant="ghost" size="sm" className="-ml-3">
            <Link to="/admin"><ArrowLeft className="h-4 w-4" /> Kembali ke Admin</Link>
          </Button>
        </div>

        <header className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="font-display text-secondary uppercase tracking-[0.2em] text-xs">Pustakawan Digital</p>
            <h1 className="mt-1 font-display text-5xl leading-tight">Sinkronisasi Google Drive</h1>
            <p className="mt-2 max-w-xl text-muted-foreground">
              Pindai folder Drive Anda dan tambahkan semua PDF ke katalog Toyamas Library. Buku yang sudah ada akan diperbarui metadatanya.
            </p>
          </div>
        </header>

        {/* Control panel */}
        <section className="mt-8 rounded-xl border border-border/60 bg-card p-6 shadow-soft">
          <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
            <div>
              <Label htmlFor="folder" className="text-sm font-medium">ID Folder Drive (opsional)</Label>
              <Input
                id="folder"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="cth: 1A2bCdEfGhIjKlMnOpQrStUvWxYz"
                disabled={running}
                className="mt-2"
              />
              <p className="mt-2 text-xs text-muted-foreground">
                Kosongkan untuk memindai semua PDF di Drive yang terhubung.
              </p>
            </div>
            <Button onClick={handleSync} disabled={running} size="lg" className="bg-spine text-primary-foreground hover:opacity-90">
              {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <FolderSync className="h-4 w-4" />}
              {running ? "Memindai…" : "Mulai Sinkronisasi"}
            </Button>
          </div>
        </section>

        {/* Progress */}
        {phase !== "idle" && (
          <section className="mt-6 rounded-xl border border-border/60 bg-card p-6 shadow-soft">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {phase === "done" ? (
                  <CheckCircle2 className="h-6 w-6 text-secondary" />
                ) : phase === "error" ? (
                  <XCircle className="h-6 w-6 text-destructive" />
                ) : (
                  <FileSearch className="h-6 w-6 animate-pulse text-secondary" />
                )}
                <div>
                  <p className="font-medium">{statusText}</p>
                  <p className="text-xs text-muted-foreground">Waktu berjalan: {elapsed.toFixed(1)}s</p>
                </div>
              </div>
              <span className="font-display text-3xl tabular-nums">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="mt-4 h-2" />
            {errorMsg && (
              <div className="mt-4 flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
                <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </section>
        )}

        {/* Stats */}
        {result && (
          <>
            <section className="mt-6 grid gap-4 sm:grid-cols-4">
              <StatCard icon={FileSearch} label="File dipindai" value={result.scanned} tint="muted" />
              <StatCard icon={FilePlus2} label="Buku baru" value={result.added} tint="primary" />
              <StatCard icon={FileCheck2} label="Diperbarui" value={result.updated} tint="muted" />
              <StatCard icon={XCircle} label="Gagal" value={result.failed} tint={result.failed > 0 ? "danger" : "muted"} />
            </section>

            {/* Report */}
            <section className="mt-6 rounded-xl border border-border/60 bg-card shadow-soft">
              <div className="flex items-center justify-between border-b border-border/60 p-5">
                <div className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-secondary" />
                  <h2 className="font-display text-2xl">Laporan Sinkronisasi</h2>
                </div>
                <Button variant="outline" size="sm" onClick={handleSync} disabled={running}>
                  <RefreshCw className="h-4 w-4" /> Sinkron ulang
                </Button>
              </div>
              {result.report.length === 0 ? (
                <p className="p-10 text-center text-muted-foreground">Tidak ada PDF ditemukan di lokasi ini.</p>
              ) : (
                <ul className="divide-y divide-border/60">
                  {result.report.map((r) => (
                    <li key={r.id} className="flex items-center justify-between gap-4 p-4">
                      <div className="flex min-w-0 items-center gap-3">
                        <StatusBadge status={r.status} />
                        <div className="min-w-0">
                          <p className="truncate font-medium">{r.title}</p>
                          {r.status === "failed" ? (
                            <p className="truncate text-xs text-destructive">{r.error}</p>
                          ) : (
                            <p className="text-xs text-muted-foreground">{formatSize(r.size)}</p>
                          )}
                        </div>
                      </div>
                      {r.status !== "failed" && (
                        <Button asChild variant="ghost" size="sm">
                          <Link to="/book/$id" params={{ id: r.id }}>Buka</Link>
                        </Button>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, tint }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number; tint: "primary" | "muted" | "danger" }) {
  const tintCls =
    tint === "primary" ? "text-secondary" : tint === "danger" ? "text-destructive" : "text-muted-foreground";
  return (
    <div className="rounded-xl border border-border/60 bg-card p-5 shadow-soft">
      <div className="flex items-center gap-2">
        <Icon className={`h-5 w-5 ${tintCls}`} />
        <p className="text-sm text-muted-foreground">{label}</p>
      </div>
      <p className="mt-2 font-display text-4xl tabular-nums">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: ReportItem["status"] }) {
  if (status === "new") {
    return <span className="inline-flex items-center gap-1 rounded-full bg-secondary/15 px-2.5 py-1 text-xs font-medium text-secondary"><FilePlus2 className="h-3 w-3" /> Baru</span>;
  }
  if (status === "updated") {
    return <span className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"><FileCheck2 className="h-3 w-3" /> Diperbarui</span>;
  }
  return <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-1 text-xs font-medium text-destructive"><XCircle className="h-3 w-3" /> Gagal</span>;
}

function formatSize(bytes?: number | null) {
  if (!bytes) return "Ukuran tidak diketahui";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}
