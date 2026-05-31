import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import { Header } from "@/components/Header";
import { BookCard } from "@/components/BookCard";
import { Input } from "@/components/ui/input";
import { listBooks } from "@/lib/books.functions";

export const Route = createFileRoute("/browse")({
  head: () => ({
    meta: [
      { title: "Katalog Buku — Toyamas Library" },
      { name: "description", content: "Telusuri seluruh koleksi buku PDF di Toyamas Library. Cari berdasarkan judul, penulis, atau kategori." },
      { property: "og:title", content: "Katalog Buku — Toyamas Library" },
    ],
    links: [{ rel: "canonical", href: "/browse" }],
  }),
  component: Browse,
});

function Browse() {
  const [q, setQ] = useState("");
  const fetchBooks = useServerFn(listBooks);
  const { data, isLoading } = useQuery({
    queryKey: ["books", "all", q],
    queryFn: () => fetchBooks({ data: { search: q || undefined } }),
  });
  const books = data?.books ?? [];

  return (
    <div className="min-h-screen">
      <Header />

      {/* Page Header */}
      <div className="relative overflow-hidden py-16 border-b" style={{ borderColor: "oklch(0.28 0.025 255 / 0.3)" }}>
        <div className="orb orb-1" style={{ opacity: 0.5 }} />
        <div className="orb orb-2" style={{ opacity: 0.4 }} />
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage: "linear-gradient(oklch(0.72 0.20 265) 1px, transparent 1px), linear-gradient(90deg, oklch(0.72 0.20 265) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />
        <div className="container relative mx-auto px-4 text-center">
          <div className="section-label justify-center mb-4">
            <Search className="h-3 w-3" /> Katalog Koleksi
          </div>
          <h1 className="font-display text-5xl md:text-6xl text-foreground text-balance">
            Katalog{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.82 0.18 265), oklch(0.78 0.18 320))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Buku
            </span>
          </h1>
          <p className="mt-3 text-muted-foreground">
            Telusuri semua buku di perpustakaan digital kami
          </p>

          {/* Search Bar */}
          <div className="mx-auto mt-8 max-w-2xl">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground z-10" />
              <Input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Cari judul, penulis, atau topik..."
                className="h-14 rounded-2xl pl-13 pr-6 text-base border-0 shadow-soft"
                style={{
                  background: "oklch(0.14 0.018 255 / 0.8)",
                  backdropFilter: "blur(16px)",
                  border: "1px solid oklch(0.28 0.025 255 / 0.5)",
                  color: "var(--color-foreground)",
                }}
              />
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-xl text-muted-foreground hover:text-foreground hover:bg-white/10 transition-all"
                aria-label="Filter"
              >
                <SlidersHorizontal className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results */}
      <main className="container mx-auto px-4 py-12">
        {/* Result count */}
        {!isLoading && (
          <div className="mb-8 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {q ? (
                <><span className="text-foreground font-medium">{books.length}</span> hasil untuk "<span className="text-primary">{q}</span>"</>
              ) : (
                <><span className="text-foreground font-medium">{books.length}</span> buku tersedia</>
              )}
            </p>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div
                  className="aspect-[2/3] rounded-xl animate-pulse"
                  style={{ background: "oklch(0.18 0.018 255 / 0.8)" }}
                />
                <div className="space-y-2">
                  <div className="h-3 rounded animate-pulse" style={{ background: "oklch(0.18 0.018 255 / 0.8)", width: "60%" }} />
                  <div className="h-3 rounded animate-pulse" style={{ background: "oklch(0.18 0.018 255 / 0.8)", width: "80%" }} />
                </div>
              </div>
            ))}
          </div>
        ) : books.length === 0 ? (
          <div
            className="glass-card p-20 text-center mx-auto max-w-md"
            style={{ border: "1px dashed oklch(0.30 0.025 255 / 0.4)" }}
          >
            <div
              className="mx-auto mb-4 h-16 w-16 rounded-2xl grid place-items-center"
              style={{ background: "oklch(0.72 0.20 265 / 0.1)", border: "1px solid oklch(0.72 0.20 265 / 0.2)" }}
            >
              <Search className="h-7 w-7 text-primary" />
            </div>
            <h3 className="font-display text-xl text-foreground mb-2">Tidak ada buku</h3>
            <p className="text-sm text-muted-foreground">
              {q ? `Tidak ada buku yang cocok dengan "${q}". Coba kata kunci lain.` : "Belum ada buku tersedia."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {books.map((b) => <BookCard key={b.id} {...b} />)}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass border-t mt-12" style={{ borderTop: "1px solid oklch(0.28 0.025 255 / 0.3)" }}>
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Toyamas Library. Perpustakaan digital untuk semua.
        </div>
      </footer>
    </div>
  );
}
