/** Shared full-screen ambient layer for login / register — mesh glow + subtle grid */
export function AuthAmbient() {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-[15%] h-[420px] w-[420px] rounded-full bg-orange-500/30 blur-[110px]" />
        <div className="absolute -right-32 bottom-[10%] h-[380px] w-[380px] rounded-full bg-amber-600/25 blur-[100px]" />
        <div className="absolute left-1/2 top-[20%] h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-orange-600/15 blur-[90px]" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-orange-500/50 to-transparent" />
      </div>
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(148,163,184,0.15) 1px, transparent 0)`,
          backgroundSize: "32px 32px",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#030712] via-transparent to-[#030712]/90" />
    </>
  );
}
