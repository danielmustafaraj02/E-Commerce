import {
  BadgeCheck,
  BookOpen,
  CircleHelp,
  Clapperboard,
  FileCode,
  GalleryHorizontal,
  Hash,
  Heading,
  Image as ImageIcon,
  LayoutGrid,
  List,
  ListOrdered,
  Mail,
  MapPin,
  MessageSquareQuote,
  Minus,
  MousePointerClick,
  MoveVertical,
  Newspaper,
  Quote,
  SeparatorVertical,
  Shirt,
  Sparkles,
  Square,
  Star,
  Tag,
  Timer,
  Type,
  Video,
  type LucideIcon,
} from "lucide-react";
import { type BuilderBlock } from "@/lib/section-builder";

// What the editor knows about each block type: its name, its icon and where
// it sits in the palette, plus the short summary that tells blocks apart in
// Layers.


export const BLOCK_LABEL: Record<BuilderBlock["type"], string> = {
  heading: "Heading",
  text: "Text",
  image: "Image",
  button: "Button",
  divider: "Line (horizontal)",
  vline: "Line (vertical)",
  spacer: "Space",
  shape: "Shape",
  list: "List",
  quote: "Quote",
  video: "Video",
  counter: "Counter",
  icon: "Icon + text",
  stars: "Review stars",
  countdown: "Countdown",
  badge: "Badge",
  map: "Map",
  carousel: "Product carousel",
  eyebrow: "Eyebrow label",
  shelf: "Product shelf",
  looks: "Looks",
  reviews: "Customer reviews",
  newsletter: "Newsletter form",
  journal: "Journal articles",
  siteFaq: "Site FAQ",
  showcase: "Collections animation",
  faq: "FAQ (you write)",
  story: "Story row",
  original: "Original content",
};

/** The drawn icon of each block type, in the palette, the layers and the inspector. */
export const BLOCK_ICON: Record<BuilderBlock["type"], LucideIcon> = {
  heading: Heading,
  text: Type,
  image: ImageIcon,
  button: MousePointerClick,
  divider: Minus,
  vline: SeparatorVertical,
  spacer: MoveVertical,
  shape: Square,
  list: List,
  quote: Quote,
  video: Video,
  counter: Hash,
  icon: Sparkles,
  stars: Star,
  countdown: Timer,
  badge: BadgeCheck,
  map: MapPin,
  carousel: GalleryHorizontal,
  eyebrow: Tag,
  shelf: LayoutGrid,
  looks: Shirt,
  reviews: MessageSquareQuote,
  newsletter: Mail,
  journal: Newspaper,
  siteFaq: CircleHelp,
  showcase: Clapperboard,
  faq: ListOrdered,
  story: BookOpen,
  original: FileCode,
};

/** The workspace palette, grouped the way a shop owner looks for things. A
 *  type missing here still appears, under "More". */
export const ELEMENT_GROUPS: [string, BuilderBlock["type"][]][] = [
  ["Text", ["heading", "text", "eyebrow", "list", "quote", "faq", "button"]],
  ["Pictures and media", ["image", "video", "story", "map"]],
  ["Shapes and details", ["shape", "divider", "vline", "spacer", "icon", "badge", "stars", "counter", "countdown"]],
  ["From your shop", ["carousel", "shelf", "looks", "reviews", "journal", "newsletter", "siteFaq", "showcase", "original"]],
];

/** A block's own words, shortened, so blocks of one type tell apart in Layers. */
export function blockSummary(block: BuilderBlock): string {
  const fields = block as unknown as Record<string, unknown>;
  const text = ["text", "title", "label", "alt", "caption"]
    .map((key) => fields[key])
    .find((value): value is string => typeof value === "string" && value.trim() !== "");
  return text
    ? text.replace(/[*_#>[\]()]/g, "").replace(/\s+/g, " ").trim().slice(0, 60)
    : "";
}
