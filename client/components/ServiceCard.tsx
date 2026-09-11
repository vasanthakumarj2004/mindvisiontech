export interface ServiceCardData {
  title: string;
  imageUrl: string;
}

export function ServiceCard({ title, imageUrl }: ServiceCardData) {
  return (
    <article className="group relative aspect-[4/3] w-[250px] xs:w-[280px] sm:w-[320px] overflow-hidden rounded-3xl bg-brand-blue-soft shadow-blue-md transition-all hover:shadow-blue-lg">
      {/* Background image with zoom on hover */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
        style={{ backgroundImage: `url(${imageUrl})` }}
        role="img"
        aria-label={title}
      />
      {/* Blue-navy gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-brand-blue-deep/90 via-brand-blue/30 to-brand-blue/10" />
      {/* Title badge */}
      <div className="relative flex h-full items-end p-5">
        <span className="rounded-full border border-white/20 bg-brand-blue-deep/90 px-5 py-2.5 text-center text-sm font-extrabold text-white backdrop-blur-md shadow-blue-sm transition-colors group-hover:bg-brand-blue group-hover:border-white/40">
          {title}
        </span>
      </div>
    </article>
  );
}