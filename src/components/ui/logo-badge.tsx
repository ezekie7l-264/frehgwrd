export function LogoBadge({ className }: { className?: string }) {
  return (
    <div
      className={`flex h-9 w-9 items-center justify-center rounded-2xl overflow-hidden ${className ?? ""}`}
    >
      <img src="/appderiv-logo.png" alt="AppDeriv logo" className="h-full w-full object-contain" />
    </div>
  );
}
