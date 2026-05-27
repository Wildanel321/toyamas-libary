import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search } from "lucide-react";
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
      <main className="container mx-auto px-4 py-12">
        <div className="mb-10 text-center">
          <h1 className="font-display text-5xl text-balance">Katalog Buku</h1>
          <p className="mt-2 text-muted-foreground">Telusuri semua buku di perpustakaan kami</p>
        </div>
        <div className="mx-auto mb-10 max-w-2xl">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Cari judul, penulis, atau topik..."
              className="h-14 rounded-full border-border/60 bg-card pl-12 text-base shadow-soft"
            />
          </div>
        </div>
        {isLoading ? (
          <p className="text-center text-muted-foreground">Memuat...</p>
        ) : books.length === 0 ? (
          <p className="text-center text-muted-foreground">Tidak ada buku ditemukan.</p>
        ) : (
          <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {books.map((b) => <BookCard key={b.id} {...b} />)}
          </div>
        )}
      </main>
    </div>
  );
}
