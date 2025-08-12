import { Helmet } from "react-helmet-async";
import Hero from "@/components/hero/Hero";
import ProductGrid from "@/components/products/ProductGrid";

const Index = () => {
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Season Enterprises',
    url: '/',
    potentialAction: {
      '@type': 'SearchAction',
      target: '/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  };
  return (
    <main>
      <Helmet>
        <title>Season Enterprises</title>
        <meta
          name="description"
          content="Shop authentic handmade crafts from Nepal: wooden carvings, Dhaka textiles, singing bowls and more. Fast shipping, premium experience."
        />
        <link rel="canonical" href="/" />
        <meta property="og:title" content="Season Enterprises" />
        <meta property="og:description" content="Authentic handcrafted goods from Nepal." />
        <script type="application/ld+json">{JSON.stringify(ld)}</script>
      </Helmet>
      <Hero />
      <ProductGrid />

      <section id="about" className="container py-16">
        <h2 className="font-display text-3xl mb-2">Our Promise</h2>
        <p className="text-muted-foreground max-w-2xl">
          We work directly with Nepali artisans to bring you ethically‑made, high‑quality pieces that preserve cultural heritage and support local livelihoods.
        </p>
      </section>
    </main>
  );
};

export default Index;
