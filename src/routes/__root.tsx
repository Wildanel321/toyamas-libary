import { QueryClient, QueryClientProvider, useQueryClient } from "@tanstack/react-query";
import {
  Outlet, createRootRouteWithContext, useRouter, HeadContent, Scripts,
} from "@tanstack/react-router";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { AuthProvider } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-7xl">404</h1>
        <h2 className="mt-4 font-display text-2xl">Halaman tidak ditemukan</h2>
        <p className="mt-2 text-sm text-muted-foreground">Halaman yang Anda cari tidak ada atau telah dipindahkan.</p>
        <a href="/" className="mt-6 inline-flex rounded-md bg-spine px-5 py-2.5 text-sm font-medium text-primary-foreground">Kembali ke beranda</a>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="font-display text-2xl">Halaman gagal dimuat</h1>
        <p className="mt-2 text-sm text-muted-foreground">Terjadi kesalahan. Silakan coba lagi.</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="mt-6 rounded-md bg-spine px-5 py-2.5 text-sm font-medium text-primary-foreground">Coba lagi</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "Toyamas Library — Perpustakaan Digital untuk Semua" },
      { name: "description", content: "Toyamas Library adalah perpustakaan digital gratis. Baca ribuan buku PDF langsung di browser, pinjam buku, dan kembangkan literasi Anda." },
      { name: "keywords", content: "perpustakaan digital, baca buku online, pdf, literasi, toyamas library" },
      { property: "og:title", content: "Toyamas Library — Perpustakaan Digital untuk Semua" },
      { property: "og:description", content: "Toyamas Library adalah perpustakaan digital gratis. Baca ribuan buku PDF langsung di browser, pinjam buku, dan kembangkan literasi Anda." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#c9a84c" },
      { name: "twitter:title", content: "Toyamas Library — Perpustakaan Digital untuk Semua" },
      { name: "twitter:description", content: "Toyamas Library adalah perpustakaan digital gratis. Baca ribuan buku PDF langsung di browser, pinjam buku, dan kembangkan literasi Anda." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3a5184f4-56c4-41ff-9d48-b0bca7c9370f/id-preview-f024ea54--4480fd2f-0430-4c66-908f-6453cb65cb17.lovable.app-1779886642673.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/3a5184f4-56c4-41ff-9d48-b0bca7c9370f/id-preview-f024ea54--4480fd2f-0430-4c66-908f-6453cb65cb17.lovable.app-1779886642673.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "canonical", href: "/" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600;700&family=Inter:wght@400;500;600;700&display=swap" },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Library",
          name: "Toyamas Library",
          description: "Perpustakaan digital gratis dengan koleksi buku PDF untuk literasi semua orang.",
        }),
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function AuthSync() {
  const router = useRouter();
  const qc = useQueryClient();
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      router.invalidate();
      qc.invalidateQueries();
    });
    return () => subscription.unsubscribe();
  }, [router, qc]);
  return null;
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AuthSync />
        <Outlet />
        <Toaster richColors position="top-center" />
      </AuthProvider>
    </QueryClientProvider>
  );
}
