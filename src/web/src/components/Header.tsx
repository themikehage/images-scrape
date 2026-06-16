export function Header() {
  return (
    <header className="h-16 bg-surface border-b border-border flex items-center sticky top-0 z-100">
      <div className="max-w-[1280px] w-full mx-auto px-8 flex items-center justify-between max-sm:px-4">
        <a href="/" className="flex items-center gap-2 no-underline text-inherit">
          <span className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center text-white font-serif italic text-lg shrink-0">
            I
          </span>
          <span className="font-serif text-xl tracking-tight">
            Image<span className="text-accent">Scraper</span>
          </span>
        </a>
        <span className="text-xs font-medium text-subtle flex items-center gap-1.5 px-3 py-1 bg-base rounded-full">
          <span className="w-1.5 h-1.5 rounded-full bg-success" />
          Bing
        </span>
      </div>
    </header>
  );
}
