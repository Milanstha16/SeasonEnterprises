import bowl from "@/assets/hero-nepal-crafts.jpg"; // reusing as placeholder images

export type Product = {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  rating?: number;
  threeD?: boolean;
};

const products: Product[] = [
  { id: "sb01", name: "Brass Singing Bowl Set", price: 79, image: bowl, category: "Sound Healing", rating: 4.8, threeD: true },
  { id: "wk02", name: "Hand‑Carved Wooden Buddha", price: 129, image: bowl, category: "Wood Carvings", rating: 4.9 },
  { id: "dh03", name: "Dhaka Weave Scarf", price: 45, image: bowl, category: "Textiles", rating: 4.6 },
  { id: "lp04", name: "Lokta Paper Journal", price: 22, image: bowl, category: "Stationery", rating: 4.7 },
  { id: "br05", name: "Prayer Wheel Bracelet", price: 35, image: bowl, category: "Jewelry", rating: 4.5 },
  { id: "hm06", name: "Himalayan Incense Bundle", price: 18, image: bowl, category: "Aromatherapy", rating: 4.4 },
  { id: "tx07", name: "Hand‑loomed Table Runner", price: 59, image: bowl, category: "Home & Living", rating: 4.6 },
  { id: "st08", name: "Mini Stupa Decor", price: 39, image: bowl, category: "Decor", rating: 4.3 },
];

export default products;
