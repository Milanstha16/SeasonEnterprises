import bowl from "../assets/hero-nepal-crafts.jpg"; // reusing as placeholder images

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
  { id: "sb01", name: "Product 1", price: 79, image: bowl, category: "Sound Healing"},
  { id: "wk02", name: "Product 2", price: 129, image: bowl, category: "Wood Carvings"},
  { id: "dh03", name: "Product 3", price: 45, image: bowl, category: "Clothes"},

];

export default products;
