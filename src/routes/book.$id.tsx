import { createFileRoute, Link, useNavigate, useRouter } from "@tanstack/react-router";
import { queryOptions } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { ArrowLeft, BookOpen, BookMarked } from "lucide-react";
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
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Gagal memuat buku</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="mt-6 rounded-md bg-spine px-5 py-2.5 text-sm font-medium text-primary-foreground"
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
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 font-display text-2xl">Buku tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">Buku yang Anda cari tidak ada atau telah dipindahkan.</p>
        <a href="/browse" className="mt-6 inline-flex rounded-md bg-spine px-5 py-2.5 text-sm font-medium text-primary-foreground">Ke Katalog</a>
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
        <Link to="/browse" className="mb-6 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" /> Kembali ke katalog
        </Link>
        {!book ? (
          <p>Buku tidak ditemukan.</p>
        ) : (
          <div className="grid gap-12 md:grid-cols-[280px_1fr]">
            <div>
              <div className="aspect-[2/3] overflow-hidden rounded-md shadow-book bg-spine">
                {book.cover_url ? (
                  <img src={book.cover_url} alt={book.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center p-6 text-center font-display text-xl text-primary-foreground">{book.title}</div>
                )}
              </div>
            </div>
            <div>
              {book.category && <span className="text-xs font-semibold uppercase tracking-wider text-primary">{book.category}</span>}
              <h1 className="mt-2 font-display text-5xl text-balance">{book.title}</h1>
              {book.author && <p className="mt-2 text-lg text-muted-foreground">oleh {book.author}</p>}
              <p className="mt-6 max-w-2xl leading-relaxed text-foreground/90">
                {book.description || "Belum ada deskripsi untuk buku ini."}
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild size="lg" className="bg-spine text-primary-foreground hover:opacity-90">
                  <Link to="/read/$id" params={{ id: book.id }}><BookOpen className="h-4 w-4" /> Baca Sekarang</Link>
                </Button>
                <Button onClick={handleBorrow} size="lg" variant="outline">
                  <BookMarked className="h-4 w-4" /> Pinjam Buku
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
