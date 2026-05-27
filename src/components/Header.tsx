import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, LogOut, Search, Shield, User as UserIcon, Library } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-spine text-primary-foreground shadow-soft">
            <BookOpen className="h-5 w-5" strokeWidth={2.25} />
          </span>
          <span className="font-display text-2xl leading-none tracking-tight">
            Toyamas <span className="text-secondary">Library</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-1 md:flex">
          <Link to="/" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "px-3 py-2 text-sm font-medium text-foreground" }} activeOptions={{ exact: true }}>Beranda</Link>
          <Link to="/browse" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "px-3 py-2 text-sm font-medium text-foreground" }}>
            <span className="inline-flex items-center gap-1.5"><Library className="h-4 w-4" /> Katalog</span>
          </Link>
          {user && (
            <Link to="/my-loans" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "px-3 py-2 text-sm font-medium text-foreground" }}>Pinjaman Saya</Link>
          )}
          {profile?.isAdmin && (
            <Link to="/admin" className="px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground" activeProps={{ className: "px-3 py-2 text-sm font-medium text-foreground" }}>
              <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4" /> Admin</span>
            </Link>
          )}
        </nav>
        <div className="flex items-center gap-2">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link to="/browse"><Search className="h-4 w-4" /> Cari</Link>
          </Button>
          {user ? (
            <>
              <span className="hidden text-sm text-muted-foreground md:inline-flex items-center gap-1.5">
                <UserIcon className="h-4 w-4" /> {profile?.display_name ?? profile?.username}
              </span>
              <Button variant="outline" size="sm" onClick={async () => { await signOut(); navigate({ to: "/" }); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm"><Link to="/login">Masuk</Link></Button>
              <Button asChild size="sm" className="bg-spine text-primary-foreground hover:opacity-90">
                <Link to="/register">Daftar</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
