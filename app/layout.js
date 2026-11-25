import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/inter-tight/600.css";
import "@fontsource/inter-tight/700.css";
import "@fontsource/inter-tight/800.css";
import "@fontsource/cormorant-garamond/500-italic.css";
import "@fontsource/cormorant-garamond/600.css";
import "./globals.css";
import { THEME_SCRIPT } from "@/lib/themeScript";
import { DialogHost } from "@/lib/ui/dialogs";

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://aryo.vercel.app"),
  title: { default: "ARYO Nairobi — Where dining meets nightlife", template: "%s · ARYO Nairobi" },
  description: "Cocktails, cuisine and experiences at Astrol Square, Red Hill Rd. Book Nairobi's top DJs, hosts, MCs and artists.",
  icons: { icon: "/aryo-logo.jpg" },
  openGraph: { images: ["/aryo-logo.jpg"] },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head><script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} /></head>
      <body className="font-sans">
        {children}
        <DialogHost />
      </body>
    </html>
  );
}
