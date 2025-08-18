import { Helmet } from "react-helmet-async";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useLocation } from 'react-router-dom';

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const name = data.get("name");
    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      (e.currentTarget as HTMLFormElement).reset();
      toast({ title: "Message sent", description: `Thanks ${name}, we will reply within 24 hours.` });
    }, 800);
  };

  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Season Enterprises',
    url: '/',
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '1-410-372-0590',
      contactType: 'customer service',
      areaServed: 'Worldwide',
      availableLanguage: ['English', 'Nepali']
    },
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Baltimore, MD 21285-5469',
      addressLocality: 'Baltimore',
      addressRegion: 'MD',
      postalCode: '21285-5469',
      addressCountry: 'USA'
    }
  };

  return (
    <main className="container py-12">
      <Helmet>
        <title>Contact Us | Season Enterprises</title>
        <meta name="description" content="Get in touch with Season Enterprises for product questions, wholesale, or support." />
        <link rel="canonical" href="/contact" />
        <script type="application/ld+json">{JSON.stringify(orgLd)}</script>
      </Helmet>

      <header className="mb-8">
        <h1 className="font-display text-4xl">Contact Us</h1>
        <p className="mt-2 text-muted-foreground max-w-2xl">
          We’d love to hear from you. Whether you have a question about our handmade products, need assistance, or are interested in wholesale, our team is ready to help.
        </p>
      </header>

      <div className="grid gap-10 md:grid-cols-2">
        <section className="rounded-lg border p-6 bg-card">
          <h2 className="font-medium text-lg">Send us a message</h2>
          <form onSubmit={onSubmit} className="mt-4 space-y-4" aria-label="Contact form">
            <div>
              <label className="block text-sm mb-1" htmlFor="name">Full name</label>
              <input id="name" name="name" required className="w-full rounded-md border bg-background px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="email">Email</label>
              <input id="email" name="email" type="email" required className="w-full rounded-md border bg-background px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="subject">Subject</label>
              <input id="subject" name="subject" required className="w-full rounded-md border bg-background px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm mb-1" htmlFor="message">Message</label>
              <textarea id="message" name="message" rows={5} required className="w-full rounded-md border bg-background px-3 py-2" />
            </div>
            <Button type="submit" disabled={submitting}>{submitting ? 'Sending…' : 'Send message'}</Button>
          </form>
        </section>

        <aside className="space-y-5">
          <div className="rounded-lg border p-6">
            <h2 className="font-medium text-lg">Location</h2>
            <p className="mt-2 text-muted-foreground">
              Baltimore, MD 21285-5469, USA
            </p>
            <p className="mt-2"><span className="text-muted-foreground">Phone:</span> 1-410-372-0590</p>
            <p className=""><span className="text-muted-foreground">Email:</span> season@seasonenterprises.com</p>
            <a href="https://maps.google.com/?q=Baltimore,MD" target="_blank" rel="noreferrer" className="inline-block mt-3 underline underline-offset-4">
              View on Google Maps
            </a>
          </div>

          <div className="rounded-lg border p-6">
            <h2 className="font-medium text-lg">Wholesale & Partnerships</h2>
            <p className="mt-2 text-muted-foreground">
              Interested in carrying our products or collaborating? We offer curated selections for boutiques and cultural institutions worldwide.
            </p>
            <p className="mt-2">Email: season@seasonenterprises.com</p>
          </div>

        </aside>
      </div>
    </main>
  );
}
