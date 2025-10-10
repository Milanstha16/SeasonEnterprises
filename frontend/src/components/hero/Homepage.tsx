import { motion, useScroll, useTransform } from "framer-motion";
import heroImage from "../../assets/hero-nepal-crafts.jpg";
import jewellery from "../../assets/jewelry.jpg";
import clothing from "../../assets/Clothing.jpeg";
import homedecor from "../../assets/Homedecor.jpg";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export default function Hero() {
  const { scrollY } = useScroll();

  // Parallax + zoom effect for hero
  const y = useTransform(scrollY, [0, 300], [0, 60]);
  const opacity = useTransform(scrollY, [0, 300], [1, 0.5]);
  const scale = useTransform(scrollY, [0, 300], [1, 1.1]); // zoom in

  // Fade-up animation for sections
  const fadeUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
  };

  return (
    <section className="relative overflow-hidden">
      {/* Hero Section with cinematic zoom */}
      <motion.div
        style={{ y, opacity, scale }}
        className="absolute inset-0 will-change-transform"
      >
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
            initial="hidden"
            animate="visible"
            variants={fadeUp}
            className="text-white font-display text-4xl md:text-6xl leading-tight"
          >
            Crafted in Nepal, Cherished Worldwide
          </motion.h1>
          <motion.p
            initial="hidden"
            animate="visible"
            variants={{
              ...fadeUp,
              visible: { ...fadeUp.visible, transition: { delay: 0.2 } },
            }}
            className="mt-4 text-lg text-white"
          >
            Explore authentic handmade treasures—from carved wood to Dhaka
            weaves and singing bowls—made with heart by Nepali artisans.
          </motion.p>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{
              ...fadeUp,
              visible: { ...fadeUp.visible, transition: { delay: 0.4 } },
            }}
            className="mt-8 flex gap-3"
          >
            <Link to="/shop">
              <Button variant="hero">Shop Now</Button>
            </Link>
          </motion.div>
        </div>
      </div>

      {/* About Section */}
      <motion.section
        className="bg-white py-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.3 }}
        variants={fadeUp}
      >
        <div className="container text-center max-w-4xl mx-auto">
          <h2 className="font-display text-3xl mb-2">Our Story</h2>
          <p className="text-gray-600">
  Season Enterprises was founded by Season and Heather Shrestha in 1994. We are dedicated to
  providing wholesalers with the finest handmade Nepalese jewelry, clothing, and crafts. We take
  pride in the quality of our products and in supporting artisans in Nepal.
  <br /><br />
  We have been in the import-export business for more than 20 years. We have very close and
  personal contact with craftspeople in Nepal and we travel to Nepal very often. That’s how we
  manage to select beautiful jewelry, clothing, and crafts – at a great price.
  <br /><br />
  Our goal is to preserve Nepalese art and culture and to encourage Nepal’s economic growth by
  buying handicrafts directly from the Nepalese people who make them.
  <br /><br />
  Thank you for visiting our web site, and please come again! Namaste!
          </p>
        </div>
      </motion.section>

{/* Featured Categories */}
<section className="bg-gray-50 py-16">
  <div className="container">
    <motion.h2
      className="font-display text-3xl mb-8 text-center"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={fadeUp}
    >
      Explore Our Collections
    </motion.h2>
    <motion.div
      className="grid md:grid-cols-3 gap-8"
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.2 } },
      }}
    >
      {[
        { title: "Jewelry", img: "../../assets/jewelry.jpg" },
        { title: "Clothing", img: "../../assets/Clothing.jpeg" },
        { title: "Home Decor", img: "../../assets/Homedecor.jpg" },
      ].map((item, i) => (
        <motion.div
          key={i}
          className="relative bg-white rounded-2xl shadow-lg overflow-hidden cursor-pointer flex flex-col"
          variants={{
            hidden: { opacity: 0, y: 30 },
            visible: { opacity: 1, y: 0, transition: { duration: 0.6 } },
          }}
          whileHover={{ scale: 1.03 }}
        >
          {/* Image container with fixed aspect ratio */}
          <div className="relative w-full aspect-w-4 aspect-h-3 overflow-hidden">
            <motion.img
              src={item.img}
              alt={item.title}
              className="w-full h-full object-contain transition-transform duration-500"
              whileHover={{ scale: 1.05 }}
            />
            <motion.div
              className="absolute inset-0 bg-black bg-opacity-25"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 0.4 }}
              transition={{ duration: 0.3 }}
            />
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-white text-xl font-semibold text-center px-2">
                {item.title}
              </h3>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </motion.div>
  </div>
</section>



      {/* Why Choose Us */}
      <section className="bg-white py-16">
        <div className="container text-center">
          <motion.h2
            className="font-display text-3xl mb-2"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.3 }}
            variants={fadeUp}
          >
            Why Choose Us?
          </motion.h2>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              "Authentic Handmade Products",
              "Fair Trade & Ethical Sourcing",
              "Supporting Local Artisans",
            ].map((point, i) => (
              <motion.div
                key={i}
                className="p-6 border rounded-xl shadow-sm"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, amount: 0.3 }}
                variants={{
                  hidden: { opacity: 0, y: 20 },
                  visible: {
                    opacity: 1,
                    y: 0,
                    transition: { duration: 0.5, delay: i * 0.15 },
                  },
                }}
              >
                <p className="text-lg">{point}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </section>
  );
}
