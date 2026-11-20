import { Link } from "wouter";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CornerSlideMagnet } from "@/components/magnets/CornerSlideMagnet";
import { Button } from "@/components/ui/button";
import { Phone, MessageCircle, Mail } from "lucide-react";
import { SchemaMarkup } from "@/components/SchemaMarkup";
import { breadcrumbSchema, contactPageSchema } from "@/lib/schema";
import { trackEvent } from "@/lib/analytics";
import { useDocumentMeta } from "@/lib/use-document-meta";
import { LeadForm } from "@/components/LeadForm";

const PHONE = "01063618217";

export default function Contact() {
  useDocumentMeta({
    title: "Contact PLACES — Talk to an Office Real Estate Advisor",
    description:
      "Get in touch with PLACES for office leasing, sales, or investment advice across Egypt. Direct line, WhatsApp, or Calendly — same-day response.",
    url: "https://places-egy.com/contact",
  });

  const whatsappMessage = encodeURIComponent("Hi, I'd like to learn more about PLACES and your available properties.");
  const handleCallClick = () => trackEvent("call_click", { source: "contact_page" });
  const handleWhatsappClick = () => trackEvent("whatsapp_click", { source: "contact_page" });
  const handleEmailClick = () =>
    trackEvent("outbound_click", { channel: "email", source: "contact_page" });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background">
      <SchemaMarkup
        schema={breadcrumbSchema([
          { name: "Home", url: "/" },
          { name: "Contact", url: "/contact" },
        ])}
      />
      <SchemaMarkup schema={contactPageSchema()} />
      <Navbar />

      <main className="flex-1 pt-24 md:pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-3 md:mb-4 leading-tight">
              How can we help?
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              Whether you're looking for a specific unit or just exploring — pick the option that fits.
            </p>
          </div>

          {/* Two main paths */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-10 md:mb-16">
            {/* Path 1 — Talk to us */}
            <div className="bg-white rounded-2xl border border-border/40 p-6 md:p-8 flex flex-col text-center">
              <h2 className="text-xl font-serif font-bold text-primary mb-2">
                Speak with an advisor
              </h2>
              <p className="text-sm text-muted-foreground mb-8 flex-1">
                Have a specific requirement or need guidance? Our team will get back to you within a few hours.
              </p>
              <div className="space-y-3">
                <a href={`tel:${PHONE}`} onClick={handleCallClick} className="block">
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white">
                    <Phone className="w-4 h-4 mr-2" /> Call Us
                  </Button>
                </a>
                <a
                  href={`https://wa.me/2${PHONE}?text=${whatsappMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleWhatsappClick}
                  className="block"
                >
                  <Button className="w-full h-12 bg-[#25D366] hover:bg-[#1fb855] text-white">
                    <MessageCircle className="w-4 h-4 mr-2" /> WhatsApp
                  </Button>
                </a>
                {/* Calendly booking button removed 2026-08-23 — calendar
                    bookings paused. Direct visitors to WhatsApp instead
                    (already the primary contact channel PLACES uses). */}
                <a
                  href={`mailto:admin@places-egy.com`}
                  onClick={handleEmailClick}
                  className="block"
                >
                  <Button className="w-full h-12 bg-accent hover:bg-accent/90 text-accent-foreground">
                    <Mail className="w-4 h-4 mr-2" /> Email Us
                  </Button>
                </a>
              </div>
            </div>

            {/* Path 2 — Self-serve */}
            <div className="bg-white rounded-2xl border border-border/40 p-6 md:p-8 flex flex-col text-center">
              <h2 className="text-xl font-serif font-bold text-primary mb-2">
                Browse on your own
              </h2>
              <p className="text-sm text-muted-foreground mb-8 flex-1">
                Not ready to talk yet? Explore available units or read through our most common questions.
              </p>
              <div className="space-y-3">
                <Link href="/listings" className="block">
                  <Button variant="outline" className="w-full h-12 border-primary/20 text-primary hover:bg-primary hover:text-white">
                    Browse Listings
                  </Button>
                </Link>
                <Link href="/faqs" className="block">
                  <Button variant="outline" className="w-full h-12 border-primary/20 text-primary hover:bg-primary hover:text-white">
                    Read FAQs
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Requirements form. Many company tenants won't call or WhatsApp a
              broker cold but will send a brief; this page used to offer only
              Call / WhatsApp / Email. Goes to the same leads table, admin
              notification and welcome email as every other form. */}
          <div
            id="requirements"
            className="bg-white rounded-2xl border border-border/40 p-6 md:p-8 mb-10 md:mb-16 max-w-2xl mx-auto"
          >
            <h2 className="text-xl md:text-2xl font-serif font-bold text-primary mb-2 text-center">
              Send us your requirements
            </h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              Tell us the area, size, budget and move-in date. An advisor will reply with a shortlist of
              available units, usually the same day.
            </p>
            <LeadForm
              leadSource="contact_page"
              submitLabel="Send my requirements"
              successTitle="Thanks, we've got it."
              successBody="A PLACES advisor will contact you shortly with matching units. For anything urgent, WhatsApp us."
              messageLabel="What are you looking for?"
              messagePlaceholder="e.g. 200–300 m², finished, rent, budget 250K EGP/month, move in by March"
            />
          </div>

        </div>
      </main>

      <Footer />
      <CornerSlideMagnet />
    </div>
  );
}
