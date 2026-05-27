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
      className="group flex flex-col gap-3 transition-transform hover:-translate-y-1"
    >
      <div className="relative aspect-[2/3] overflow-hidden rounded-md shadow-book bg-spine">
        {cover_url ? (
          <img
            src={cover_url}
            alt={`Sampul buku ${title}`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center bg-spine p-4 text-center text-primary-foreground">
            <BookOpen className="mb-2 h-8 w-8 opacity-80" />
            <span className="font-display text-base leading-tight text-balance">{title}</span>
          </div>
        )}
        <span className="pointer-events-none absolute inset-y-0 left-0 w-2 bg-gradient-to-r from-black/30 to-transparent" />
      </div>
      <div className="px-0.5">
        {category && (
          <span className="text-[10px] font-semibold uppercase tracking-wider text-primary">{category}</span>
        )}
        <h3 className="font-display text-lg leading-snug text-balance line-clamp-2">{title}</h3>
        {author && <p className="text-sm text-muted-foreground line-clamp-1">{author}</p>}
      </div>
    </Link>
  );
}
