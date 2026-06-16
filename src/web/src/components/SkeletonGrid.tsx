export function SkeletonGrid() {
  return (
    <div className="grid grid-cols-4 gap-4 max-xl:grid-cols-3 max-[640px]:grid-cols-2 max-sm:gap-2">
      {Array.from({ length: 8 }, (_, i) => (
        <div key={i} className="bg-surface rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(0,0,0,0.05)]">
          <div
            className="w-full aspect-[4/3] bg-border animate-[pulse-custom_1.5s_ease-in-out_infinite]"
          />
          <div className="px-4 py-2 pb-4 space-y-1.5">
            <div className="h-3 bg-border rounded animate-[pulse-custom_1.5s_ease-in-out_infinite]" />
            <div className="h-3 w-3/5 bg-border rounded animate-[pulse-custom_1.5s_ease-in-out_infinite_0.2s]" />
          </div>
        </div>
      ))}
    </div>
  );
}
