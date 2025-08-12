import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "@/assets/hero-nepal-crafts.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Hero() {
  const { scrollY } = useScroll();
  const y = useTransform(scrollY, [0, 300], [0, 60]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);

  return (
    <section className="relative overflow-hidden">
      <motion.div style={{ y, opacity }} className="absolute inset-0">
        <img
          src={heroImage}
          alt="Handmade Nepalese crafts hero image showcasing cultural heritage"
          className="h-[60vh] w-full object-cover"
          loading="eager"
        />
      </motion.div>

      <div className="relative container h-[60vh] flex items-center">
        <div className="max-w-2xl">
          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-white font-display text-4xl md:text-6xl leading-tight"
          >
            Crafted in Nepal, Cherished Worldwide
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="mt-4 text-lg text-white"
          >
            Explore authentic handmade treasures—from carved wood to Dhaka weaves and singing bowls—made with heart by Nepali artisans.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="mt-8 flex gap-3"
          >
            <Link to="">
              <Button variant="hero">Shop Now</Button>
            </Link>
            <Link to="/cart">
              <Button variant="outline">View Cart</Button>
            </Link>
          </motion.div>
        </div>

      </div>
    </section>
  );
}
