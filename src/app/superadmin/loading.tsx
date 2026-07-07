export default function SuperadminLoading() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
      <div className="relative flex h-10 w-10 items-center justify-center">
        <span className="absolute h-full w-full animate-ping rounded-full bg-violet-500/20 opacity-75" />
        <span className="h-5 w-5 animate-spin rounded-full border-2 border-violet-500/20 border-t-violet-600" />
      </div>
      <p className="text-xs font-semibold text-violet-600 animate-pulse">
        Memuat panel admin...
      </p>
    </div>
  );
}
