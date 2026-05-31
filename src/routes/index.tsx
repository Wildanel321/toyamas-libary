import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowRight, BookOpen, Search, Users, Sparkles, Star, Zap } from "lucide-react";
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
      <section className="relative overflow-hidden py-24 md:py-36">
        {/* Orbs */}
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        {/* Grid pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(oklch(0.72 0.20 265) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.20 265) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <div className="container relative mx-auto grid gap-12 px-4 md:grid-cols-2 items-center">
          {/* Left Content */}
          <div className="flex flex-col justify-center">
            <div className="badge-pill badge-primary mb-6 w-fit">
              <Sparkles className="h-3 w-3" /> Perpustakaan Digital Gratis
            </div>

            <h1 className="font-display text-5xl leading-[1.05] text-balance md:text-7xl text-foreground">
              Bacalah, dan{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, oklch(0.82 0.18 265), oklch(0.78 0.18 320))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                dunia terbuka
              </span>{" "}
              untukmu.
            </h1>

            <p className="mt-6 max-w-lg text-lg text-muted-foreground leading-relaxed">
              Toyamas Library menyediakan koleksi buku PDF yang dapat dibaca langsung di browser.
              Gratis, terbuka, dan untuk siapa saja yang ingin mengembangkan literasi.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild size="lg" className="btn-primary text-white font-semibold px-7 py-3 rounded-xl text-base h-auto">
                <Link to="/browse">
                  <span className="relative z-10 flex items-center gap-2">
                    Jelajahi Koleksi <ArrowRight className="h-4 w-4" />
                  </span>
                </Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="rounded-xl px-7 py-3 h-auto text-base font-medium border-white/15 hover:border-white/30 hover:bg-white/8 text-foreground"
              >
                <Link to="/register">Daftar Gratis</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-10 grid grid-cols-3 gap-4 max-w-sm">
              {[
                { label: "Buku", value: data?.books.length ?? "—" },
                { label: "Akses", value: "24/7" },
                { label: "Biaya", value: "Gratis" },
              ].map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-number">{s.value}</div>
                  <div className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-medium">{s.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Right — Book Grid Visual */}
          <div className="relative hidden md:flex items-center justify-center">
            <div
              className="absolute inset-0 rounded-full opacity-30"
              style={{
                background: "radial-gradient(circle, oklch(0.72 0.20 265 / 0.15) 0%, transparent 70%)",
                filter: "blur(40px)",
              }}
            />
            <div className="relative grid grid-cols-3 gap-4 p-4">
              {featured.slice(0, 6).map((b, i) => (
                <div
                  key={b.id}
                  className="aspect-[2/3] overflow-hidden rounded-xl animate-float"
                  style={{
                    transform: `translateY(${(i % 3) * 20}px) rotate(${(i - 2) * 2}deg)`,
                    boxShadow: "0 20px 60px oklch(0 0 0 / 0.6), 0 4px 16px oklch(0.72 0.20 265 / 0.2)",
                    animationDelay: `${i * 0.4}s`,
                  }}
                >
                  {b.cover_url ? (
                    <img src={b.cover_url} alt={b.title} loading="lazy" className="h-full w-full object-cover" />
                  ) : (
                    <div
                      className="flex h-full items-center justify-center p-3 text-center text-white text-sm font-display"
                      style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 265), oklch(0.65 0.22 320))" }}
                    >
                      {b.title}
                    </div>
                  )}
                </div>
              ))}
              {featured.length === 0 && Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[2/3] rounded-xl animate-float"
                  style={{
                    background: "linear-gradient(135deg, oklch(0.72 0.20 265 / 0.3), oklch(0.65 0.22 320 / 0.2))",
                    transform: `translateY(${(i % 3) * 20}px) rotate(${(i - 2) * 2}deg)`,
                    boxShadow: "0 20px 60px oklch(0 0 0 / 0.4)",
                    animationDelay: `${i * 0.4}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="divider-glow mx-auto max-w-4xl" />

      {/* FEATURES */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <div className="section-label justify-center"><Zap className="h-3 w-3" /> Fitur Utama</div>
          <h2 className="font-display text-4xl text-foreground">Kenapa Toyamas Library?</h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {[
            {
              icon: BookOpen,
              title: "Baca Langsung",
              text: "Buka buku PDF di browser tanpa perlu mengunduh. Cocok untuk semua perangkat kapan saja.",
              badge: "badge-primary",
            },
            {
              icon: Search,
              title: "Pencarian Cepat",
              text: "Temukan buku berdasarkan judul, penulis, atau kategori dengan mudah dan instan.",
              badge: "badge-secondary",
            },
            {
              icon: Users,
              title: "Untuk Semua",
              text: "Akses gratis untuk pelajar, mahasiswa, dan masyarakat umum. Tanpa syarat.",
              badge: "badge-cyan",
            },
          ].map((f) => (
            <div key={f.title} className="glass-card p-7 relative overflow-hidden">
              <div
                className="absolute top-0 right-0 w-40 h-40 rounded-full opacity-[0.06] pointer-events-none"
                style={{ background: "radial-gradient(circle, oklch(0.72 0.20 265), transparent)", transform: "translate(30%, -30%)" }}
              />
              <div className="feature-icon-wrap">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-display text-2xl text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FEATURED BOOKS */}
      <section className="container mx-auto px-4 pb-28">
        <div className="mb-10 flex items-end justify-between">
          <div>
            <div className="section-label"><Star className="h-3 w-3" /> Koleksi Terbaru</div>
            <h2 className="font-display text-4xl text-foreground">Koleksi Pilihan</h2>
            <p className="mt-2 text-muted-foreground">Buku terbaru dari rak digital kami.</p>
          </div>
          <Button asChild variant="ghost" className="text-muted-foreground hover:text-foreground gap-2">
            <Link to="/browse">Lihat semua <ArrowRight className="h-4 w-4" /></Link>
          </Button>
        </div>

        {featured.length === 0 ? (
          <div
            className="glass-card p-16 text-center"
            style={{ border: "1px dashed oklch(0.30 0.025 255 / 0.4)" }}
          >
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-sm">
              Belum ada buku. Admin dapat menyinkronkan koleksi dari Google Drive di halaman Admin.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {featured.map((b) => <BookCard key={b.id} {...b} />)}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="glass border-t" style={{ borderTop: "1px solid oklch(0.28 0.025 255 / 0.3)" }}>
        <div className="container mx-auto px-4 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className="grid h-8 w-8 place-items-center rounded-lg"
              style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 265), oklch(0.65 0.22 320))" }}
            >
              <BookOpen className="h-4 w-4 text-white" />
            </span>
            <span className="font-display text-lg text-foreground">Toyamas Library</span>
          </div>
          <p className="text-sm text-muted-foreground text-center">
            © {new Date().getFullYear()} Toyamas Library. Perpustakaan digital untuk semua.
          </p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <Link to="/browse" className="hover:text-foreground transition-colors">Katalog</Link>
            <Link to="/login" className="hover:text-foreground transition-colors">Masuk</Link>
            <Link to="/register" className="hover:text-foreground transition-colors">Daftar</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
