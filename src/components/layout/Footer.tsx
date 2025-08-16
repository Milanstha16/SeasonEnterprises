import { Facebook, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-16 border-t">
      <div className="container py-10 text-sm text-muted-foreground">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p>&copy; {new Date().getFullYear()} Season Enterprises. All rights reserved.</p>
          <div className="flex space-x-4">
            <a
              href="https://www.facebook.com/seasons2"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="hover:text-foreground"
            >
              <Facebook size={20} />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Twitter"
              className="hover:text-foreground"
            >
              <Twitter size={20} />
            </a>
            <a
              href=""
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="hover:text-foreground"
            >
              <Linkedin size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
