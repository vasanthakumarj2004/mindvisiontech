import type { Branch } from "@/lib/api";

export function BranchLocator({ branches }: { branches: Branch[] }) {
  return (
    <div className="branch-list">
      {branches.map((branch) => (
        <article className="branch-row" key={branch._id}>
          <div>
            <p className="eyebrow">{branch.city}</p>
            <h3>{branch.name}</h3>
            <p className="muted">{branch.address}</p>
          </div>
          <a
            className="branch-phone"
            href={`tel:${branch.phone}`}
            aria-label={`Call ${branch.name}: ${branch.phone}`}
          >
            {branch.phone}
          </a>
        </article>
      ))}
    </div>
  );
}