import Link from "next/link";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import LogoutButton from "@/components/LogoutButton";

type NavItem = {
  href: string;
  label: string;
};

export default async function PortalNav({
  title,
  items,
}: {
  title: string;
  items: NavItem[];
}) {
  const session = await getServerSession(authOptions);

  return (
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-4 px-6 py-4">
        <div className="mr-4">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-blue-700">{title}</p>
          <p className="text-sm text-slate-600">{session?.user.name ?? session?.user.email}</p>
        </div>
        <nav className="flex flex-1 flex-wrap items-center gap-2">
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-950"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <LogoutButton />
      </div>
    </div>
  );
}
