import lemon from "@/assets/lemon-leaves.jpg";
import neem from "@/assets/neem-leaves.jpg";
import tulasi from "@/assets/tulasi-leaves.jpg";

const map: Record<string, string> = {
  "fresh-lemon-leaves": lemon,
  "fresh-neem-leaves": neem,
  "fresh-tulasi-leaves": tulasi,
};

export function resolveProductImage(slug: string, dbImages: string[] | null | undefined): string | null {
  if (dbImages && dbImages.length > 0 && dbImages[0]?.startsWith("http")) return dbImages[0];
  return map[slug] ?? null;
}
