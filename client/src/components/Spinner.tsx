export function Spinner({ className = 'h-6 w-6' }: { className?: string }) {
  return (
    <div className={`${className} animate-spin rounded-full border-2 border-white/20 border-t-f1red`} />
  );
}

export function PageSpinner() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center">
      <Spinner className="h-8 w-8" />
    </div>
  );
}
