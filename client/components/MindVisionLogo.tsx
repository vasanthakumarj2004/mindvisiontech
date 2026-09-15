import type { SVGProps } from "react";

export function MindVisionLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 740 170"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="MindVisionTech Innovation - Success Starts with One Decision"
      {...props}
    >
      {/* ── Emblem Mark (Sun + M + V) ── */}
      <g transform="translate(15, 15) scale(0.18)">
        <circle cx="384" cy="136" r="91" fill="#EF7E20" />
        <path
          fill="#0B2B6B"
          d="M36 73 323 318l31 148L123 264v329L36 510Zm696 0L445 318l-31 148 231-202v329l87-83Z"
        />
        <path fill="#EF7E20" d="m161 349 223 197 223-197-223 375Z" />
      </g>

      {/* ── MINDVISION TECH (Single unified text node for natural kerning) ── */}
      <text
        x="180"
        y="74"
        fontFamily="'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif"
        fontSize="44"
        fontWeight="900"
        letterSpacing="1"
      >
        <tspan fill="#0B2B6B">MINDVISION </tspan>
        <tspan fill="#EF7E20">TECH</tspan>
      </text>

      {/* ── INNOVATION (Symmetrically centered below MINDVISION TECH) ── */}
      <text
        x="415"
        y="110"
        textAnchor="middle"
        fill="#EF7E20"
        fontFamily="'Segoe UI', system-ui, -apple-system, BlinkMacSystemFont, Roboto, Arial, sans-serif"
        fontSize="18"
        fontWeight="800"
        letterSpacing="8"
      >
        INNOVATION
      </text>

      {/* ── Tagline with perfectly balanced flanking lines (No overlap, no extra gap) ── */}
      <line
        x1="180"
        y1="142"
        x2="270"
        y2="142"
        stroke="#EF7E20"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <text
        x="415"
        y="147"
        textAnchor="middle"
        fill="#121E36"
        fontFamily="Georgia, 'Times New Roman', serif"
        fontSize="16"
        fontStyle="italic"
      >
        Success Starts with One Decision
      </text>
      <line
        x1="560"
        y1="142"
        x2="650"
        y2="142"
        stroke="#EF7E20"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
    </svg>
  );
}
