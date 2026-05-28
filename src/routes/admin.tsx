import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useState } from "react";
import { RefreshCw, Trash2, BookOpen, Users, BookMarked } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { adminStats, listBooks, syncDriveBooks, deleteBook, updateBook } from "@/lib/books.functions";

export const Route = createFileRoute("/admin")({
  head: () => ({ meta: [{ title: "Admin — Toyamas Library" }] }),
  component: Admin,
});

function Admin() {
  const { profile, loading, user } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (!user) navigate({ to: "/login" });
    else if (profile && !profile.isAdmin) { toast.error("Akses ditolak"); navigate({ to: "/" }); }
  }, [loading, user, profile, navigate]);

  const fetchStats = useServerFn(adminStats);
  const fetchBooks = useServerFn(listBooks);
  const doSync = useServerFn(syncDriveBooks);
  const doDelete = useServerFn(deleteBook);
  const doUpdate = useServerFn(updateBook);

  const enabled = !!profile?.isAdmin;
  const { data: stats } = useQuery({ queryKey: ["admin-stats"], queryFn: () => fetchStats(), enabled });
  const { data: booksData, refetch } = useQuery({ queryKey: ["admin-books"], queryFn: () => fetchBooks({ data: {} }), enabled });

  const [folderId, setFolderId] = useState("");
  const [syncing, setSyncing] = useState(false);

  async function handleSync() {
    setSyncing(true);
    try {
      const res = await doSync({ data: { folderId: folderId || undefined } });
      toast.success(`Sinkronisasi selesai: ${res.added} dari ${res.scanned} buku`);
      refetch();
    } catch (e) { toast.error((e as Error).message); }
    finally { setSyncing(false); }
  }

  if (!enabled) return <div className="min-h-screen"><Header /></div>;

  const books = booksData?.books ?? [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-12">
        <h1 className="font-display text-5xl">Panel Admin</h1>
        <p className="mt-2 text-muted-foreground">Kelola koleksi dan pengguna perpustakaan.</p>

        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {[
            { label: "Total Buku", value: stats?.bookCount ?? "—", icon: BookOpen },
            { label: "Pengguna", value: stats?.userCount ?? "—", icon: Users },
            { label: "Sedang Dipinjam", value: stats?.activeLoans ?? "—", icon: BookMarked },
          ].map((s) => (
            <div key={s.label} className="rounded-lg border border-border/60 bg-card p-6 shadow-soft">
              <s.icon className="h-6 w-6 text-secondary" />
              <p className="mt-3 text-sm text-muted-foreground">{s.label}</p>
              <p className="mt-1 font-display text-4xl">{s.value}</p>
            </div>
          ))}
        </div>

        <section className="mt-10 rounded-lg border border-border/60 bg-card p-6 shadow-soft">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-display text-2xl">Sinkronkan dari Google Drive</h2>
              <p className="mt-1 text-sm text-muted-foreground">Buka halaman sinkronisasi untuk memantau progres dan melihat laporan buku yang baru masuk.</p>
            </div>
            <Button asChild className="bg-spine text-primary-foreground hover:opacity-90">
              <a href="/admin/sync"><RefreshCw className="h-4 w-4" /> Buka Halaman Sinkronisasi</a>
            </Button>
          </div>
        </section>

        <section className="mt-10">
          <h2 className="font-display text-2xl">Kelola Buku ({books.length})</h2>
          <div className="mt-4 overflow-hidden rounded-lg border border-border/60 bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead className="border-b border-border/60 bg-muted/50 text-left">
                <tr><th className="p-3">Judul</th><th className="p-3">Penulis</th><th className="p-3">Kategori</th><th className="p-3 w-32 text-right">Aksi</th></tr>
              </thead>
              <tbody>
                {books.map((b) => (
                  <BookRow key={b.id} book={b}
                    onSave={async (patch) => { await doUpdate({ data: { id: b.id, ...patch } }); toast.success("Disimpan"); refetch(); }}
                    onDelete={async () => { if (!confirm("Hapus buku ini?")) return; await doDelete({ data: { id: b.id } }); toast.success("Dihapus"); refetch(); }}
                  />
                ))}
                {books.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-muted-foreground">Belum ada buku. Lakukan sinkronisasi dari Drive.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

function BookRow({ book, onSave, onDelete }: {
  book: { id: string; title: string; author: string | null; category: string | null; description: string | null };
  onSave: (p: { title: string; author?: string; category?: string; description?: string }) => Promise<void>;
  onDelete: () => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [t, setT] = useState(book.title);
  const [a, setA] = useState(book.author ?? "");
  const [c, setC] = useState(book.category ?? "");
  if (editing) {
    return (
      <tr className="border-b border-border/60">
        <td className="p-2"><Input value={t} onChange={(e) => setT(e.target.value)} /></td>
        <td className="p-2"><Input value={a} onChange={(e) => setA(e.target.value)} /></td>
        <td className="p-2"><Input value={c} onChange={(e) => setC(e.target.value)} /></td>
        <td className="p-2 text-right">
          <Button size="sm" onClick={async () => { await onSave({ title: t, author: a, category: c }); setEditing(false); }}>Simpan</Button>
        </td>
      </tr>
    );
  }
  return (
    <tr className="border-b border-border/60 last:border-0">
      <td className="p-3 font-medium">{book.title}</td>
      <td className="p-3 text-muted-foreground">{book.author ?? "—"}</td>
      <td className="p-3 text-muted-foreground">{book.category ?? "—"}</td>
      <td className="p-3 text-right">
        <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
        <Button size="sm" variant="ghost" onClick={onDelete}><Trash2 className="h-4 w-4 text-destructive" /></Button>
      </td>
    </tr>
  );
}
