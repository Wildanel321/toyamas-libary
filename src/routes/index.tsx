import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BookOpen, Search, Users, Sparkles } from "lucide-react";
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { Button } from "@/components/ui/button";
import { listBooks } from "@/lib/books.functions";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Toyamas Library — Perpustakaan Digital untuk Semua" },
      { name: "description", content: "Baca ribuan buku PDF gratis di Toyamas Library. Pinjam buku, cari koleksi, dan tingkatkan literasi Anda." },
      { property: "og:title", content: "Toyamas Library — Perpustakaan Digital" },
      { property: "og:description", content: "Baca ribuan buku PDF gratis. Untuk semua orang yang mencintai literasi." },
    ],
  }),
  component: Home,
});

function Home() {
  const fetchBooks = useServerFn(listBooks);
  const { data } = useQuery({
    queryKey: ["books", "featured"],
    queryFn: () => fetchBooks({ data: {} }),
  });
  const featured = (data?.books ?? []).slice(0, 12);

  return (
    <div className="min-h-screen">
      <Header />

      {/* HERO */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div className="absolute inset-0 bg-paper opacity-60" />
        <div className="container relative mx-auto grid gap-10 px-4 py-20 md:grid-cols-2 md:py-28">
          <div className="flex flex-col justify-center">
            <span className="mb-4 inline-flex w-fit items-center gap-1.5 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-secondary">
              <Sparkles className="h-3.5 w-3.5" /> Perpustakaan untuk semua
            </span>
            <h1 className="font-display text-5xl leading-[1.05] text-balance md:text-7xl">
              Bacalah, dan dunia <span className="italic text-secondary">terbuka</span> untukmu.
            </h1>
            <p className="mt-5 max-w-lg text-lg text-muted-foreground">
              Toyamas Library menyediakan koleksi buku PDF yang dapat dibaca langsung di browser. Gratis, terbuka, dan untuk siapa saja yang ingin mengembangkan literasi.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="bg-spine text-primary-foreground hover:opacity-90">
                <Link to="/browse">Jelajahi Koleksi <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline">
                <Link to="/register">Daftar Gratis</Link>
              </Button>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-border/60 pt-6">
              <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Buku</dt><dd className="font-display text-2xl">{data?.books.length ?? "—"}</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Akses</dt><dd className="font-display text-2xl">24/7</dd></div>
              <div><dt className="text-xs uppercase tracking-wider text-muted-foreground">Biaya</dt><dd className="font-display text-2xl">Gratis</dd></div>
            </dl>
          </div>
          <div className="relative hidden md:block">
            <div className="absolute -inset-8 rounded-full bg-primary/10 blur-3xl" />
            <div className="relative grid grid-cols-3 gap-4">
              {featured.slice(0, 6).map((b, i) => (
                <div
                  key={b.id}
                  className="aspect-[2/3] overflow-hidden rounded-md shadow-book bg-spine"
                  style={{ transform: `translateY(${(i % 3) * 18}px) rotate(${(i - 2) * 1.5}deg)` }}
                >
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full items-center justify-center p-3 text-center font-display text-sm text-primary-foreground">{b.title}</div>
                  )}
                </div>
              ))}
              {featured.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-[2/3] rounded-md bg-spine shadow-book opacity-60"
                  style={{ transform: `translateY(${(i % 3) * 18}px) rotate(${(i - 2) * 1.5}deg)` }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES */}
      <section className="container mx-auto grid gap-6 px-4 py-16 md:grid-cols-3">
        {[
          { icon: BookOpen, title: "Baca langsung", text: "Buka buku PDF di browser tanpa unduh. Cocok untuk semua perangkat." },
          { icon: Search, title: "Pencarian cepat", text: "Temukan buku berdasarkan judul, penulis, atau kategori." },
          { icon: Users, title: "Untuk semua", text: "Akses gratis untuk pelajar, mahasiswa, dan masyarakat umum." },
        ].map((f) => (
          <div key={f.title} className="rounded-lg border border-border/60 bg-card p-6 shadow-soft">
            <f.icon className="h-7 w-7 text-secondary" />
            <h3 className="mt-4 font-display text-2xl">{f.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{f.text}</p>
          </div>
        ))}
      </section>

      {/* FEATURED BOOKS */}
      <section className="container mx-auto px-4 pb-24">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="font-display text-4xl">Koleksi Pilihan</h2>
            <p className="mt-1 text-muted-foreground">Buku terbaru dari rak kami.</p>
          </div>
          <Button asChild variant="ghost"><Link to="/browse">Lihat semua <ArrowRight className="h-4 w-4" /></Link></Button>
        </div>
        {featured.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/50 p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">Belum ada buku. Admin dapat menyinkronkan koleksi dari Google Drive di halaman Admin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featured.map((b) => <BookCard key={b.id} {...b} />)}
          </div>
        )}
      </section>

      <footer className="border-t border-border/60 bg-card/30">
        <div className="container mx-auto px-4 py-8 text-sm text-muted-foreground">
          © {new Date().getFullYear()} Toyamas Library. Perpustakaan digital untuk semua.
        </div>
      </footer>
    </div>
  );
}
