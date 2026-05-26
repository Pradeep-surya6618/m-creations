export const LOGO_FILE: string | null =
  process.env.NEXT_PUBLIC_LOGO_FILE && process.env.NEXT_PUBLIC_LOGO_FILE.trim() !== ""
    ? process.env.NEXT_PUBLIC_LOGO_FILE
    : null;

export const BRAND = {
  name: "Maria Creations",
  tagline: "Handmade flowers crafted with love",
  location: "Madurai, India",
  instagram: "https://instagram.com/mariacreations",
  whatsapp: "https://wa.me/910000000000", // placeholder — user replaces with real number
  email: "hello@mariacreations.in",
};
