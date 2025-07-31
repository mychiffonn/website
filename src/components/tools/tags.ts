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
export const getTagVariant = (tag: ToolTag): 'default' | 'secondary' | 'destructive' | 'outline' => {
  switch (tag) {
    case ToolTag.OpenSource:
    case ToolTag.Free:
      return 'secondary'
    case ToolTag.Favorite:
      return 'default'
    case ToolTag.Subscription:
    case ToolTag.Bundle:
    case ToolTag.Paid:
      return 'destructive'
    case ToolTag.SelfHosted:
    case ToolTag.Gifted:
    case ToolTag.Organization:
    case ToolTag.SecondHand:
    case ToolTag.Web:
    case ToolTag.Mobile:
    case ToolTag.Desktop:
      return 'outline'
    default:
      return 'outline'
  }
}
