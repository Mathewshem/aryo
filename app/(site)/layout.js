import SiteNav from "@/components/site/SiteNav";
import SiteFooter from "@/components/site/SiteFooter";
import { getSite } from "@/lib/server/site";

export const revalidate = 60;

export default async function SiteLayout({ children }) {
  const { settings } = await getSite();
  return (
    <div className="site min-h-screen">
      <SiteNav />
      {children}
      <SiteFooter settings={settings} />
    </div>
  );
}
