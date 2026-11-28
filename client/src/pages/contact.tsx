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
import { useLang } from "@/lib/ui-text";
import { hasArabicTwin } from "@/lib/i18n";
import { AR_PAGE_META } from "@/lib/page-meta";

// Arabic twin /ar/contact (29 Nov): same page, Arabic text.
const CONTACT_AR = {
  home: "الرئيسية",
  crumb: "تواصل معنا",
  h1: "كيف يمكننا مساعدتك؟",
  lead: "سواء كنت تبحث عن وحدة محددة أو تستكشف السوق فقط، اختر الطريقة التي تناسبك.",
  repBefore: "تبحث عن مكتب للإيجار؟ خدمة ",
  repLink: "الوسيط العقاري للشركات",
  repAfter: " مجانية للمستأجرين.",
  talkTitle: "تحدث مع مستشار",
  talkText: "لديك متطلبات محددة أو تحتاج إلى توجيه؟ سيعود إليك فريقنا خلال ساعات قليلة.",
  call: "اتصل بنا",
  whatsapp: "واتساب",
  email: "راسلنا بالبريد",
  selfTitle: "تصفح بنفسك",
  selfText: "لست مستعدًا للحديث بعد؟ استكشف الوحدات المتاحة أو اقرأ أكثر الأسئلة شيوعًا.",
  browse: "تصفح المكاتب",
  faqs: "اقرأ الأسئلة الشائعة",
  formTitle: "أرسل لنا متطلباتك",
  formText: "أخبرنا بالمنطقة والمساحة والميزانية وموعد الانتقال، وسيرد عليك أحد مستشارينا بقائمة مختصرة من الوحدات المتاحة، غالبًا في اليوم نفسه.",
  submit: "أرسل متطلباتي",
  successTitle: "شكرًا، وصلتنا رسالتك.",
  successBody: "سيتواصل معك أحد مستشاري PLACES قريبًا بوحدات تناسبك. للأمور العاجلة، راسلنا على واتساب.",
  messageLabel: "ما الذي تبحث عنه؟",
  messagePlaceholder: "مثال: 200–300 م²، متشطب، إيجار، ميزانية 250 ألف ج.م شهريًا، الانتقال قبل مارس",
  whatsappText: "مرحبًا، أود معرفة المزيد عن PLACES والوحدات المتاحة.",
  schemaName: "تواصل مع PLACES",
};

const PHONE = "01063618217";

export default function Contact() {
  const { isAr, href: L } = useLang();
  const A = isAr ? CONTACT_AR : null;
  useDocumentMeta(
    A
      ? AR_PAGE_META["/ar/contact"]
      : {
          title: "Contact PLACES — Talk to an Office Real Estate Advisor",
          description:
            "Get in touch with PLACES for office leasing, sales, or investment advice across Egypt. Direct line, WhatsApp, or Calendly — same-day response.",
          url: "https://places-egy.com/contact",
        },
  );
  // Arabic "Browse": Arabic listings once live, the Arabic rent hub until then.
  const browseHref = isAr && !hasArabicTwin("/listings") ? L("/rent") : L("/listings");

  const whatsappMessage = encodeURIComponent(A ? A.whatsappText : "Hi, I'd like to learn more about PLACES and your available properties.");
  const handleCallClick = () => trackEvent("call_click", { source: "contact_page" });
  const handleWhatsappClick = () => trackEvent("whatsapp_click", { source: "contact_page" });
  const handleEmailClick = () =>
    trackEvent("outbound_click", { channel: "email", source: "contact_page" });

  return (
    <div className="min-h-screen flex flex-col font-sans bg-background" lang={isAr ? "ar" : undefined}>
      <SchemaMarkup
        schema={breadcrumbSchema(
          A
            ? [
                { name: A.home, url: L("/") },
                { name: A.crumb, url: "/ar/contact" },
              ]
            : [
                { name: "Home", url: "/" },
                { name: "Contact", url: "/contact" },
              ],
        )}
      />
      <SchemaMarkup
        schema={
          A
            ? { ...contactPageSchema(), name: A.schemaName, url: "https://places-egy.com/ar/contact", inLanguage: "ar" }
            : contactPageSchema()
        }
      />
      <Navbar />

      <main className="flex-1 pt-24 md:pt-32 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8 md:mb-16">
            <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-3 md:mb-4 leading-tight">
              {A ? A.h1 : "How can we help?"}
            </h1>
            <p className="text-muted-foreground text-base md:text-lg max-w-xl mx-auto leading-relaxed">
              {A ? A.lead : "Whether you're looking for a specific unit or just exploring — pick the option that fits."}
            </p>
            <p className="mt-3 text-sm text-muted-foreground max-w-xl mx-auto">
              {A ? A.repBefore : <>Renting an office? Our{" "}</>}
              <Link href={L("/services/tenant-representation")} className="text-accent font-medium hover:underline">{A ? A.repLink : "tenant representation"}</Link>
              {A ? A.repAfter : " is free for tenants."}
            </p>
          </div>

          {/* Two main paths */}
          <div className="grid md:grid-cols-2 gap-4 md:gap-6 mb-10 md:mb-16">
            {/* Path 1 — Talk to us */}
            <div className="bg-white rounded-2xl border border-border/40 p-6 md:p-8 flex flex-col text-center">
              <h2 className="text-xl font-serif font-bold text-primary mb-2">
                {A ? A.talkTitle : "Speak with an advisor"}
              </h2>
              <p className="text-sm text-muted-foreground mb-8 flex-1">
                {A ? A.talkText : "Have a specific requirement or need guidance? Our team will get back to you within a few hours."}
              </p>
              <div className="space-y-3">
                <a href={`tel:${PHONE}`} onClick={handleCallClick} className="block">
                  <Button className="w-full h-12 bg-primary hover:bg-primary/90 text-white">
                    <Phone className="w-4 h-4 me-2" /> {A ? A.call : "Call Us"}
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
                    <MessageCircle className="w-4 h-4 me-2" /> {A ? A.whatsapp : "WhatsApp"}
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
                    <Mail className="w-4 h-4 me-2" /> {A ? A.email : "Email Us"}
                  </Button>
                </a>
              </div>
            </div>

            {/* Path 2 — Self-serve */}
            <div className="bg-white rounded-2xl border border-border/40 p-6 md:p-8 flex flex-col text-center">
              <h2 className="text-xl font-serif font-bold text-primary mb-2">
                {A ? A.selfTitle : "Browse on your own"}
              </h2>
              <p className="text-sm text-muted-foreground mb-8 flex-1">
                {A ? A.selfText : "Not ready to talk yet? Explore available units or read through our most common questions."}
              </p>
              <div className="space-y-3">
                <Link href={browseHref} className="block">
                  <Button variant="outline" className="w-full h-12 border-primary/20 text-primary hover:bg-primary hover:text-white">
                    {A ? A.browse : "Browse Listings"}
                  </Button>
                </Link>
                <Link href={L("/faqs")} className="block">
                  <Button variant="outline" className="w-full h-12 border-primary/20 text-primary hover:bg-primary hover:text-white">
                    {A ? A.faqs : "Read FAQs"}
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
              {A ? A.formTitle : "Send us your requirements"}
            </h2>
            <p className="text-sm text-muted-foreground mb-6 text-center">
              {A
                ? A.formText
                : "Tell us the area, size, budget and move-in date. An advisor will reply with a shortlist of available units, usually the same day."}
            </p>
            {A ? (
              <LeadForm
                leadSource="contact_page"
                submitLabel={A.submit}
                successTitle={A.successTitle}
                successBody={A.successBody}
                messageLabel={A.messageLabel}
                messagePlaceholder={A.messagePlaceholder}
              />
            ) : (
              <LeadForm
                leadSource="contact_page"
                submitLabel="Send my requirements"
                successTitle="Thanks, we've got it."
                successBody="A PLACES advisor will contact you shortly with matching units. For anything urgent, WhatsApp us."
                messageLabel="What are you looking for?"
                messagePlaceholder="e.g. 200–300 m², finished, rent, budget 250K EGP/month, move in by March"
              />
            )}
          </div>

        </div>
      </main>

      <Footer />
      {!isAr && <CornerSlideMagnet />}
    </div>
  );
}
