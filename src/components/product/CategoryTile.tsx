import Link from "next/link";
import Image from "next/image";
import type { Category } from "@/types/product";

type Props = { category: Category };

export function CategoryTile({ category }: Props) {
  return (
    <Link
      href={`/shop?category=${category.slug}`}
      className="group flex flex-col items-center text-center"
    >
      <div className="relative h-28 w-28 sm:h-32 sm:w-32 rounded-full overflow-hidden border-2 border-white shadow-petal-sm transition-transform group-hover:-translate-y-1 group-hover:shadow-petal-md">
        <Image
          src={category.image}
          alt={category.name}
          fill
          sizes="(max-width: 640px) 7rem, 8rem"
          className="object-cover transition-transform duration-500 group-hover:scale-110"
        />
      </div>
      <p className="mt-3 text-xs uppercase tracking-[0.2em] text-brand-ink-muted font-semibold">
        {category.name}
      </p>
    </Link>
  );
}
