import type { BadgeVariant } from "@/components/base/Badge.astro"

/**
 * Tag system for tools. Organized by category for better maintainability
 */
export enum ToolTag {
  // Cost/Pricing
  Free = 'free',
  Paid = 'paid',
  Subscription = 'subscription',
  Bundle = 'bundle',
  Gifted = 'gifted',
  SecondHand = 'second-hand',

  // Access/Availability
  OpenSource = 'oss',
  SelfHosted = 'self-hosted',
  Web = 'web',
  Mobile = 'mobile',
  Desktop = 'desktop',

  // Organization
  Organization = 'org',

  // Personal Status
  Favorite = '🤍'
}

/**
 * @constant Badge variant mapping for consistent styling
 */
export const getTagVariant = (tag: ToolTag): BadgeVariant => {
  switch (tag) {
    case ToolTag.Favorite:
      return 'default'

    // High priority - FOSS and self-hosted tools
    case ToolTag.OpenSource:
      return 'success'
    case ToolTag.SelfHosted:
      return 'accent'

    // Medium priority - free tools
    case ToolTag.Free:
    case ToolTag.Gifted:
      return 'secondary'

    // Lower priority - paid tools
    case ToolTag.Subscription:
    case ToolTag.Bundle:
    case ToolTag.Paid:
      return 'outline'

    case ToolTag.Organization:
    case ToolTag.SecondHand:
    case ToolTag.Web:
    case ToolTag.Mobile:
    case ToolTag.Desktop:
      return 'muted'

    default:
      return 'muted'
  }
}
