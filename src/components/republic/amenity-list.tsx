import {
  Bath,
  Car,
  Check,
  Flame,
  type LucideIcon,
  PawPrint,
  Sofa,
  Sparkles,
  WashingMachine,
  Wifi,
} from "lucide-react";
import { amenityLabel } from "@/lib/republic/amenities";

const ICONS: Record<string, LucideIcon> = {
  wifi: Wifi,
  faxina: Sparkles,
  lavanderia: WashingMachine,
  churrasqueira: Flame,
  garagem: Car,
  mobiliado: Sofa,
  suite: Bath,
  pet: PawPrint,
};

export function AmenityList({ amenities }: { amenities: string[] }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {amenities.map((key) => {
        const Icon = ICONS[key] ?? Check;
        return (
          <li
            key={key}
            className="inline-flex h-10 items-center gap-2 rounded-full border border-border bg-card px-4 text-sm font-medium"
          >
            <Icon aria-hidden className="size-4 text-primary" />
            {amenityLabel(key)}
          </li>
        );
      })}
    </ul>
  );
}
