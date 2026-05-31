import { Link } from "@tanstack/react-router";
import { BookOpen } from "lucide-react";

interface BookCardProps {
  id: string;
  title: string;
  author?: string | null;
  cover_url?: string | null;
  category?: string | null;
}

export function BookCard({ id, title, author, cover_url, category }: BookCardProps) {
  return (
    <Link
      to="/book/$id"
      params={{ id }}
      className="group flex flex-col gap-3"
    >
      {/* Book Cover */}
      <div
        className="relative aspect-[2/3] overflow-hidden rounded-xl book-card-hover"
        style={{
          boxShadow: "0 8px 32px oklch(0 0 0 / 0.5), 0 2px 8px oklch(0 0 0 / 0.3)",
        }}
      >
        {cover_url ? (
          <img
            src={cover_url}
            alt={`Sampul buku ${title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center p-4 text-center text-white"
            style={{ background: "linear-gradient(135deg, oklch(0.72 0.20 265), oklch(0.65 0.22 320))" }}>
            <BookOpen className="mb-2 h-8 w-8 opacity-80" />
            <span className="font-display text-base leading-tight text-balance">{title}</span>
          </div>
        )}

        {/* Spine effect */}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/40 to-transparent" />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-3">
          <span className="text-xs font-semibold text-white/90 uppercase tracking-wider">Lihat Detail</span>
        </div>

        {/* Category Badge */}
        {category && (
          <span
            className="absolute top-2 right-2 badge-pill text-white opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-1 group-hover:translate-y-0"
            style={{
              background: "oklch(0.72 0.20 265 / 0.85)",
              backdropFilter: "blur(8px)",
              fontSize: "0.6rem",
              padding: "0.2rem 0.6rem",
            }}
          >
            {category}
          </span>
        )}
      </div>

      {/* Book Info */}
      <div className="px-0.5 space-y-1">
        {category && (
          <span className="badge-pill badge-primary" style={{ fontSize: "0.6rem", padding: "0.15rem 0.5rem" }}>
            {category}
          </span>
        )}
        <h3 className="font-display text-base leading-snug text-balance line-clamp-2 text-foreground group-hover:text-primary transition-colors duration-200">
          {title}
        </h3>
        {author && (
          <p className="text-xs text-muted-foreground line-clamp-1">{author}</p>
        )}
      </div>
    </Link>
  );
}
