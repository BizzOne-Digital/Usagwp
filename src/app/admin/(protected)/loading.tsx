export default function AdminLoading() {
  return (
    <div aria-busy="true">
      <span className="sr-only">Loading</span>
      <div className="mb-7 animate-pulse">
        <div className="h-9 w-56 rounded-sm bg-line" />
        <div className="mt-3 h-4 w-96 max-w-full rounded-sm bg-line" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="animate-pulse rounded-sm border border-line bg-bg p-5"
          >
            <div className="h-3.5 w-24 rounded-sm bg-line" />
            <div className="mt-3 h-8 w-16 rounded-sm bg-line" />
            <div className="mt-3 h-3 w-32 rounded-sm bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}
