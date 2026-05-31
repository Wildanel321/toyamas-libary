import { Link, useNavigate } from "@tanstack/react-router";
import { BookOpen, LogOut, Search, Shield, User as UserIcon, Library, Menu, X } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function Header() {
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 glass" style={{ borderBottom: "1px solid oklch(0.28 0.025 255 / 0.3)" }}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 group" onClick={() => setMenuOpen(false)}>
          <span
            className="grid h-9 w-9 place-items-center rounded-xl animate-pulse-glow"
            style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 265), oklch(0.65 0.22 320))" }}
          >
            <BookOpen className="h-5 w-5 text-white" strokeWidth={2.25} />
          </span>
          <span className="font-display text-xl leading-none tracking-tight text-foreground">
            Toyamas{" "}
            <span
              style={{
                background: "linear-gradient(135deg, oklch(0.82 0.18 265), oklch(0.78 0.18 320))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Library
            </span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center gap-1 md:flex">
          {[
            { to: "/", label: "Beranda", exact: true },
            { to: "/browse", label: "Katalog", icon: Library },
            ...(user ? [{ to: "/my-loans", label: "Pinjaman Saya" }] : []),
            ...(profile?.isAdmin ? [{ to: "/admin", label: "Admin", icon: Shield }] : []),
          ].map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="nav-link px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/5 transition-all"
              activeProps={{ className: "nav-link px-4 py-2 text-sm font-medium text-foreground rounded-lg bg-white/5" }}
              activeOptions={item.exact ? { exact: true } : undefined}
            >
              <span className="inline-flex items-center gap-1.5">
                {item.icon && <item.icon className="h-4 w-4" />}
                {item.label}
              </span>
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden sm:inline-flex text-muted-foreground hover:text-foreground hover:bg-white/8 gap-1.5"
          >
            <Link to="/browse">
              <Search className="h-4 w-4" /> Cari
            </Link>
          </Button>

          {user ? (
            <>
              <span className="hidden md:inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm text-muted-foreground"
                style={{ background: "oklch(0.20 0.018 255 / 0.6)", border: "1px solid oklch(0.28 0.025 255 / 0.4)" }}>
                <UserIcon className="h-3.5 w-3.5" />
                {profile?.display_name ?? profile?.username}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={async () => { await signOut(); navigate({ to: "/" }); }}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex text-muted-foreground hover:text-foreground">
                <Link to="/login">Masuk</Link>
              </Button>
              <Button
                asChild
                size="sm"
                className="btn-primary text-white font-medium rounded-lg px-4"
              >
                <Link to="/register">Daftar</Link>
              </Button>
            </>
          )}

          {/* Mobile Menu Toggle */}
          <button
            className="md:hidden ml-1 p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-white/8 transition-all"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden glass border-t px-4 pb-4 pt-2" style={{ borderTop: "1px solid oklch(0.28 0.025 255 / 0.3)" }}>
          <nav className="flex flex-col gap-1">
            {[
              { to: "/", label: "Beranda" },
              { to: "/browse", label: "Katalog" },
              ...(user ? [{ to: "/my-loans", label: "Pinjaman Saya" }] : []),
              ...(profile?.isAdmin ? [{ to: "/admin", label: "Admin" }] : []),
            ].map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/8 transition-all"
                activeProps={{ className: "px-4 py-2.5 text-sm font-medium text-foreground rounded-lg bg-white/8" }}
              >
                {item.label}
              </Link>
            ))}
            {!user && (
              <Link to="/login" onClick={() => setMenuOpen(false)} className="px-4 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground rounded-lg hover:bg-white/8 transition-all">
                Masuk
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
