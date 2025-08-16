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

];

export default products;
