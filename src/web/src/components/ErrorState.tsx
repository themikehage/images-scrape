interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <svg
        className="w-10 h-10 text-error mb-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
      <h3 className="text-lg font-semibold mb-2">Something went wrong</h3>
      <p className="text-sm text-muted max-w-[400px] mb-6 leading-relaxed">
        {message}
      </p>
      <button
        type="button"
        onClick={onRetry}
        className="px-5 py-2.5 bg-transparent text-accent border-2 border-accent rounded-lg text-sm font-semibold cursor-pointer transition-[background,color] duration-150 hover:bg-accent hover:text-white focus-visible:outline-2 focus-visible:outline-accent focus-visible:outline-offset-2"
      >
        Try again
      </button>
    </div>
  );
}
