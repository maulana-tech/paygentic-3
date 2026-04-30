import Image from "next/image";

export function PageBackground() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-20 overflow-hidden"
    >
      <Image
        src="/bg-expert.webp"
        alt=""
        fill
        priority
        quality={60}
        sizes="100vw"
        className="object-cover object-center opacity-[0.03]"
      />
    </div>
  );
}
