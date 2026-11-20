// Shared centered card for the login / sign-up screens (client-safe: no server imports).
export default function AuthCard({ title, subtitle, children }: { title: string; subtitle: string; children: React.ReactNode }) {
  return (
    <main className="grid min-h-screen place-items-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-5 text-center">
          <svg width="44" height="44" viewBox="0 0 40 40" fill="none" className="mx-auto" aria-hidden="true">
            <defs>
              <linearGradient id="aL" x1="0" y1="0" x2="0.2" y2="1"><stop offset="0" stopColor="#141A3D" /><stop offset="0.5" stopColor="#0F3DFF" /><stop offset="1" stopColor="#7655E8" /></linearGradient>
              <linearGradient id="aR" x1="1" y1="0" x2="0.8" y2="1"><stop offset="0" stopColor="#141A3D" /><stop offset="0.55" stopColor="#FF8A22" /><stop offset="1" stopColor="#ffd0a3" /></linearGradient>
            </defs>
            <path d="M20 4 C11 8 5 13 5 20 C5 27 12 33 20 36.5" stroke="url(#aL)" strokeWidth="3.4" strokeLinecap="round" />
            <path d="M20 4 C29 8 35 13 35 20 C35 27 28 33 20 36.5" stroke="url(#aR)" strokeWidth="3.4" strokeLinecap="round" />
          </svg>
          <h1 className="mt-3 font-display text-2xl font-bold text-ink">{title}</h1>
          <p className="mt-1 text-sm text-muted">{subtitle}</p>
        </div>
        <div className="card">{children}</div>
      </div>
    </main>
  );
}
