import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookOpen, BookMarked, Tag, User } from "lucide-react";
import { toast } from "sonner";
import { Header } from "@/components/Header";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { getBook, borrowBook } from "@/lib/books.functions";

const bookQueryOptions = (id: string) =>
  queryOptions({
    queryKey: ["book", id],
    queryFn: () => getBook({ data: { id } }),
  });

function BookError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card p-12 max-w-md text-center">
        <div
          className="mx-auto mb-4 h-16 w-16 rounded-2xl grid place-items-center"
          style={{ background: "oklch(0.58 0.22 27 / 0.15)", border: "1px solid oklch(0.58 0.22 27 / 0.3)" }}
        >
          <BookOpen className="h-7 w-7 text-destructive" />
        </div>
        <h1 className="font-display text-2xl text-foreground">Gagal memuat buku</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 btn-primary rounded-xl px-6 py-2.5 text-sm font-medium text-white"
        >
          Coba lagi
        </button>
      </div>
    </div>
  );
}

function BookNotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card p-12 max-w-md text-center">
        <h1 className="font-display text-8xl" style={{
          background: "linear-gradient(135deg, oklch(0.82 0.18 265), oklch(0.78 0.18 320))",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}>404</h1>
        <h2 className="mt-4 font-display text-2xl text-foreground">Buku tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">Buku yang Anda cari tidak ada atau telah dipindahkan.</p>
        <a href="/browse" className="mt-6 inline-flex btn-primary rounded-xl px-6 py-2.5 text-sm font-medium text-white">
          Ke Katalog
        </a>
      </div>
    </div>
  );
}

export const Route = createFileRoute("/book/$id")({
  loader: async ({ params, context }) => {
    try {
      return await context.queryClient.ensureQueryData(bookQueryOptions(params.id));
    } catch {
      return { book: null };
    }
  },
  head: ({ loaderData, params }) => {
    const book = loaderData?.book;
    const title = book ? `${book.title} — Toyamas Library` : "Buku — Toyamas Library";
    const description = book?.description || "Detail buku di Toyamas Library. Baca dan pinjam buku PDF gratis.";
    const canonical = `https://toyamas-libary.lovable.app/book/${params.id}`;
    const image = book?.cover_url || "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3a5184f4-56c4-41ff-9d48-b0bca7c9370f/id-preview-f024ea54--4480fd2f-0430-4c66-908f-6453cb65cb17.lovable.app-1779886642673.png";

    const scripts = book
      ? [
          {
            type: "application/ld+json",
            children: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Book",
              name: book.title,
              ...(book.author ? { author: { "@type": "Person", name: book.author } } : {}),
              ...(book.description ? { description: book.description } : {}),
              ...(book.cover_url ? { image: book.cover_url } : {}),
              url: canonical,
              inLanguage: "id",
              isAccessibleForFree: true,
              encodingFormat: "application/pdf",
            }),
          },
        ]
      : [];

    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
        { property: "og:type", content: "book" },
        { property: "og:url", content: canonical },
        { property: "og:image", content: image },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: title },
        { name: "twitter:description", content: description },
        { name: "twitter:image", content: image },
      ],
      links: [
        { rel: "canonical", href: canonical },
      ],
      scripts,
    };
  },
  errorComponent: BookError,
  notFoundComponent: BookNotFound,
  component: BookDetail,
});

function BookDetail() {
  const { id } = Route.useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const doBorrow = useServerFn(borrowBook);
  const { book } = Route.useLoaderData();

  async function handleBorrow() {
    if (!user) { navigate({ to: "/login" }); return; }
    try {
      const res = await doBorrow({ data: { bookId: id } });
      toast.success(res.alreadyBorrowed ? "Buku sudah ada di pinjamanmu" : "Buku berhasil dipinjam");
    } catch (e) {
      toast.error((e as Error).message);
    }
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <Link
          to="/browse"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors group"
        >
          <span
            className="grid h-7 w-7 place-items-center rounded-lg group-hover:bg-white/10 transition-all"
            style={{ border: "1px solid oklch(0.28 0.025 255 / 0.4)" }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
          </span>
          Kembali ke katalog
        </Link>

        {!book ? (
          <p className="text-muted-foreground">Buku tidak ditemukan.</p>
        ) : (
          <div className="grid gap-12 md:grid-cols-[300px_1fr]">
            {/* Cover */}
            <div>
              <div
                className="aspect-[2/3] overflow-hidden rounded-2xl"
                style={{
                  boxShadow: "0 32px 80px oklch(0 0 0 / 0.6), 0 8px 24px oklch(0.72 0.20 265 / 0.2)",
                }}
              >
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
                ) : (
                  <div
                    className="flex h-full items-center justify-center p-8 text-center font-display text-xl text-white"
                    style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 265), oklch(0.65 0.22 320))" }}
                  >
                    {book.title}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex flex-col justify-center">
              {book.category && (
                <div className="badge-pill badge-primary mb-4 w-fit">
                  <Tag className="h-2.5 w-2.5" /> {book.category}
                </div>
              )}

              <h1 className="font-display text-5xl md:text-6xl text-balance text-foreground leading-tight">
                {book.title}
              </h1>

              {book.author && (
                <p className="mt-3 flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" /> oleh{" "}
                  <span className="font-medium text-foreground">{book.author}</span>
                </p>
              )}

              <div className="my-6 divider-glow" />

              <p className="max-w-2xl leading-relaxed text-muted-foreground text-base">
                {book.description || "Belum ada deskripsi untuk buku ini."}
              </p>

              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="btn-primary text-white font-semibold rounded-xl px-7 h-12 text-base">
                  <Link to="/read/$id" params={{ id: book.id }}>
                    <span className="relative z-10 flex items-center gap-2">
                      <BookOpen className="h-5 w-5" /> Baca Sekarang
                    </span>
                  </Link>
                </Button>
                <Button
                  onClick={handleBorrow}
                  size="lg"
                  variant="outline"
                  className="rounded-xl px-7 h-12 text-base font-medium border-white/15 hover:border-primary/40 hover:bg-primary/10 hover:text-primary text-foreground transition-all"
                >
                  <BookMarked className="h-5 w-5" /> Pinjam Buku
                </Button>
              </div>

              {/* Meta info */}
              <div className="mt-8 flex flex-wrap gap-4">
                <div
                  className="px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "oklch(0.14 0.018 255 / 0.6)",
                    border: "1px solid oklch(0.22 0.020 255)",
                  }}
                >
                  <span className="text-muted-foreground">Format: </span>
                  <span className="font-medium text-foreground">PDF</span>
                </div>
                <div
                  className="px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "oklch(0.14 0.018 255 / 0.6)",
                    border: "1px solid oklch(0.22 0.020 255)",
                  }}
                >
                  <span className="text-muted-foreground">Bahasa: </span>
                  <span className="font-medium text-foreground">Indonesia</span>
                </div>
                <div
                  className="px-4 py-2.5 rounded-xl text-sm"
                  style={{
                    background: "oklch(0.14 0.018 255 / 0.6)",
                    border: "1px solid oklch(0.22 0.020 255)",
                  }}
                >
                  <span className="text-muted-foreground">Akses: </span>
                  <span className="font-medium" style={{ color: "oklch(0.75 0.20 185)" }}>Gratis</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
