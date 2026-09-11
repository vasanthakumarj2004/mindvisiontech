type WaveDividerProps = {
  className?: string;
  /** Background colour of the section ABOVE the wave (fill top) */
  topColor?: string;
  /** Background colour of the section BELOW the wave (fill bottom) */
  bottomColor?: string;
};

/**
 * SVG wave that transitions between two section backgrounds.
 * Defaults: white above → brand-blue-wash below.
 */
export function WaveDivider({
  className = "",
  topColor = "#ffffff",
  bottomColor = "#eef5ff",
}: WaveDividerProps) {
  return (
    <div
      className={`relative h-12 overflow-hidden ${className}`}
      style={{ background: topColor }}
      aria-hidden="true"
    >
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 1200 48"
        preserveAspectRatio="none"
        fill="none"
      >
        {/* Wave shape filling the bottom section colour */}
        <path
          d="M0 0h560c45 0 45 48 90 48s45-48 90-48h460v48H0Z"
          fill={bottomColor}
        />
        {/* Subtle white highlight line */}
        <path
          d="M0 0h570c40 0 40 36 80 36s40-36 80-36h470"
          stroke="rgba(11,43,107,0.12)"
          strokeWidth="1.5"
        />
      </svg>
    </div>
  );
}
