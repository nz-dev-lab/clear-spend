/**
 * CategoryIcon.tsx — Renders a category's icon using a Lucide component
 *
 * Accepts the raw icon string stored in the DB (emoji or Lucide name),
 * resolves it to the correct Lucide icon, and renders it inside a
 * colour-tinted rounded square — consistent across every page.
 *
 * Usage:
 *   <CategoryIcon icon="🍔" color="#F97316" size="md" />
 *   <CategoryIcon icon="ShoppingCart" color="#3B82F6" size="sm" />
 */

import { resolveIcon } from '../../utils/categoryIcons'

type Size = 'sm' | 'md' | 'lg'

interface CategoryIconProps {
  icon: string    // emoji or Lucide icon name stored in DB
  color: string   // hex color, e.g. "#F97316"
  size?: Size
}

const sizeConfig: Record<Size, { container: string; icon: string }> = {
  sm: { container: 'w-7 h-7 rounded-lg',  icon: 'w-3.5 h-3.5' },
  md: { container: 'w-9 h-9 rounded-xl',  icon: 'w-4.5 h-4.5' },  // used in lists
  lg: { container: 'w-11 h-11 rounded-xl', icon: 'w-5 h-5'    },  // used in cards
}

export default function CategoryIcon({ icon, color, size = 'md' }: CategoryIconProps) {
  const Icon   = resolveIcon(icon)
  const config = sizeConfig[size]

  return (
    <div
      className={`${config.container} flex items-center justify-center flex-shrink-0`}
      style={{ backgroundColor: color + '22' }} // 22 hex = ~13% opacity tint
    >
      <Icon
        className={config.icon}
        style={{ color }}
        strokeWidth={2}
      />
    </div>
  )
}
