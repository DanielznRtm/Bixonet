import { Building2, House } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type Props = {
  citySlug: string;
  institutionSlug: string;
  current: "republicas" | "moradia";
};

/** Troca entre "Repúblicas" e "Outras opções" na página da faculdade. */
export function InstitutionTabs({ citySlug, institutionSlug, current }: Props) {
  const base = `/${citySlug}/${institutionSlug}`;
  const items = [
    { key: "republicas", href: base, label: "Repúblicas", icon: House },
    { key: "moradia", href: `${base}/moradia`, label: "Outras opções", icon: Building2 },
  ] as const;

  return (
    <nav
      aria-label="Tipo de moradia"
      className="flex gap-1 rounded-xl bg-muted p-1 sm:w-fit"
    >
      {items.map(({ key, href, label, icon: Icon }) => {
        const active = key === current;
        return (
          <Link
            key={key}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg px-4 text-sm font-medium transition-colors sm:flex-none",
              active
                ? "bg-card text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground",
            )}
          >
            <Icon aria-hidden className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
