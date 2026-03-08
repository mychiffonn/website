import stagesData from "@/content/stages.json"

import type { BadgeVariant } from "@/components/base/Badge.astro"

export interface StageConfig {
  name: string
  description: string
  variant: BadgeVariant
}

export const STAGES = stagesData as StageConfig[]
export const STAGE_NAMES = STAGES.map((s) => s.name)

const stageMap = new Map(STAGES.map((s) => [s.name, s]))

export function getStageConfig(name: string): StageConfig | undefined {
  return stageMap.get(name)
}

export function getStageVariant(name: string): BadgeVariant {
  return stageMap.get(name)?.variant ?? "muted"
}
