/**
 * categoryIcons.ts — Maps category icon values to Lucide icon components
 *
 * The default categories in the DB were seeded with emoji strings (🍔, 🚌, etc.).
 * This map converts them to proper Lucide icons so the UI is consistent.
 *
 * For custom categories created in Step 13, users will pick a Lucide icon name
 * directly (e.g. "ShoppingCart"), which this map also handles.
 *
 * Any unknown icon value falls back to the generic Tag icon.
 */

import {
  UtensilsCrossed,
  Bus,
  BookOpen,
  Gamepad2,
  Pill,
  Package,
  ShoppingCart,
  Coffee,
  Home,
  Plane,
  Music,
  Dumbbell,
  Car,
  GraduationCap,
  Shirt,
  Wifi,
  Zap,
  Heart,
  Baby,
  PawPrint,
  Tag,
  type LucideIcon,
} from 'lucide-react'

// Map from stored icon string (emoji OR lucide name) → Lucide component
export const ICON_MAP: Record<string, LucideIcon> = {
  // Default seeded emoji → Lucide mapping
  '🍔': UtensilsCrossed,
  '🚌': Bus,
  '📚': BookOpen,
  '🎮': Gamepad2,
  '💊': Pill,
  '📦': Package,

  // Lucide icon name strings (used by the icon picker in Step 13)
  'UtensilsCrossed': UtensilsCrossed,
  'Bus':             Bus,
  'BookOpen':        BookOpen,
  'Gamepad2':        Gamepad2,
  'Pill':            Pill,
  'Package':         Package,
  'ShoppingCart':    ShoppingCart,
  'Coffee':          Coffee,
  'Home':            Home,
  'Plane':           Plane,
  'Music':           Music,
  'Dumbbell':        Dumbbell,
  'Car':             Car,
  'GraduationCap':   GraduationCap,
  'Shirt':           Shirt,
  'Wifi':            Wifi,
  'Zap':             Zap,
  'Heart':           Heart,
  'Baby':            Baby,
  'PawPrint':        PawPrint,
}

/**
 * Resolve an icon string to a Lucide component.
 * Falls back to the generic Tag icon if the value isn't in the map.
 */
export function resolveIcon(iconString: string): LucideIcon {
  return ICON_MAP[iconString] ?? Tag
}

/**
 * All available icons for the category icon picker (Step 13).
 * Each entry has a display label, the stored key, and the Lucide component.
 */
export const AVAILABLE_ICONS = [
  { key: 'UtensilsCrossed', label: 'Food',         Icon: UtensilsCrossed },
  { key: 'Bus',             label: 'Transport',     Icon: Bus             },
  { key: 'BookOpen',        label: 'Education',     Icon: BookOpen        },
  { key: 'Gamepad2',        label: 'Entertainment', Icon: Gamepad2        },
  { key: 'Pill',            label: 'Health',        Icon: Pill            },
  { key: 'Package',         label: 'Other',         Icon: Package         },
  { key: 'ShoppingCart',    label: 'Shopping',      Icon: ShoppingCart    },
  { key: 'Coffee',          label: 'Coffee',        Icon: Coffee          },
  { key: 'Home',            label: 'Housing',       Icon: Home            },
  { key: 'Plane',           label: 'Travel',        Icon: Plane           },
  { key: 'Music',           label: 'Music',         Icon: Music           },
  { key: 'Dumbbell',        label: 'Fitness',       Icon: Dumbbell        },
  { key: 'Car',             label: 'Car',           Icon: Car             },
  { key: 'GraduationCap',   label: 'University',    Icon: GraduationCap   },
  { key: 'Shirt',           label: 'Clothing',      Icon: Shirt           },
  { key: 'Wifi',            label: 'Internet',      Icon: Wifi            },
  { key: 'Zap',             label: 'Utilities',     Icon: Zap             },
  { key: 'Heart',           label: 'Wellbeing',     Icon: Heart           },
  { key: 'Baby',            label: 'Kids',          Icon: Baby            },
  { key: 'PawPrint',        label: 'Pets',          Icon: PawPrint        },
]
