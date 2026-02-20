const PageLoader = () => (
  <div className="min-h-screen bg-background flex flex-col">
    {/* Header skeleton */}
    <div className="h-16 border-b border-border bg-background/95 flex items-center px-4">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded bg-muted animate-pulse" />
          <div className="h-4 w-28 rounded bg-muted animate-pulse" />
        </div>
        <div className="hidden md:flex items-center gap-6">
          {[80, 60, 56, 72, 52].map((w, i) => (
            <div key={i} className="h-3 rounded bg-muted animate-pulse" style={{ width: w }} />
          ))}
        </div>
        <div className="h-9 w-24 rounded-md bg-muted animate-pulse" />
      </div>
    </div>

    {/* Body skeleton */}
    <div className="flex-1 container mx-auto px-4 py-16 space-y-8 max-w-4xl">
      <div className="h-8 w-2/3 rounded bg-muted animate-pulse" />
      <div className="h-4 w-full rounded bg-muted animate-pulse" />
      <div className="h-4 w-5/6 rounded bg-muted animate-pulse" />
      <div className="h-4 w-4/6 rounded bg-muted animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-40 rounded-xl bg-muted animate-pulse" />
        ))}
      </div>
      <div className="h-4 w-full rounded bg-muted animate-pulse" />
      <div className="h-4 w-3/4 rounded bg-muted animate-pulse" />
    </div>
  </div>
);

export default PageLoader;
