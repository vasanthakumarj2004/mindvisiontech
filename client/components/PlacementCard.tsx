export interface PlacementCardData {
  studentName: string;
  companyName: string;
  companyLogoUrl?: string;
  role: string;
  salary: string;
  photoUrl: string;
  phone: string;
}

export function PlacementCard({
  studentName,
  companyName,
  role,
  salary,
  photoUrl,
  phone,
}: PlacementCardData) {
  // Fallback guards — pill never renders empty even if API omits a field
  const displayCompany = companyName?.trim() || "Company";
  const displayRole    = role?.trim()        || "Graduate";

  return (
    <article
      className="relative flex min-h-[250px] w-[270px] xs:w-[290px] sm:w-[320px] flex-col justify-between overflow-hidden rounded-3xl border-2 p-5 sm:p-6 shadow-blue-lg transition-all hover:-translate-y-1 hover:shadow-blue-xl"
      style={{
        backgroundColor: "var(--blue-deep)",   /* #081d4a */
        borderColor: "rgba(11,43,107,0.25)",
        color: "#ffffff",
      }}
    >
      {/* ── TOP ROW: two pills ──────────────────────────────────────── */}
      <div className="flex items-center justify-between gap-3">

        {/* "★ Placed" orange pill */}
        <span
          className="inline-flex shrink-0 items-center gap-1 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider shadow-sm"
          style={{
            backgroundColor: "var(--orange)",  /* #ef7e20 */
            color: "#ffffff",
          }}
        >
          ★ Placed
        </span>

        {/* Company name pill — inline styles guarantee visibility regardless
            of Tailwind v4 class compilation. Previously this used
            bg-white/10 + text-white which made the text invisible on any
            background lighter than pitch-black. */}
        <span
          className="truncate rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-wider"
          style={{
            backgroundColor: "rgba(239,126,32,0.18)", /* orange tint */
            border:           "1px solid rgba(239,126,32,0.40)",
            color:            "var(--orange)",         /* #ef7e20 — always visible on dark card */
          }}
          title={displayCompany}
        >
          {displayCompany}
        </span>

      </div>

      {/* ── MIDDLE ROW: photo + name + role ─────────────────────────── */}
      <div className="my-3 flex items-center gap-4">
        <div
          className="h-16 w-16 shrink-0 overflow-hidden rounded-full shadow-md"
          style={{ border: "2px solid var(--orange)" }}
        >
          <img src={photoUrl} alt={studentName} className="h-full w-full object-cover" />
        </div>
        <div className="min-w-0">
          <h3
            className="truncate text-lg font-black"
            style={{ color: "#ffffff" }}
          >
            {studentName}
          </h3>
          {/* Role text — inline color so it never inherits an invisible value */}
          <p
            className="truncate text-xs font-bold"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            {displayRole}
          </p>
        </div>
      </div>

      {/* ── FOOTER ROW: salary + student ID ─────────────────────────── */}
      <div
        className="flex items-center justify-between pt-3 text-xs"
        style={{ borderTop: "1px solid rgba(255,255,255,0.20)" }}
      >
        <div>
          <span
            className="block text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Package
          </span>
          <span
            className="text-sm font-black"
            style={{ color: "var(--orange)" }}
          >
            {salary}
          </span>
        </div>
        <div className="text-right">
          <span
            className="block text-[10px] font-bold uppercase tracking-wider"
            style={{ color: "rgba(255,255,255,0.65)" }}
          >
            Student ID
          </span>
          <span
            className="text-xs font-bold"
            style={{ color: "rgba(255,255,255,0.88)" }}
          >
            {phone}
          </span>
        </div>
      </div>
    </article>
  );
}