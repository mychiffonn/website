type ClassValue = string | number | false | null | undefined | ClassValue[]

function collectClassNames(value: ClassValue, result: string[]): void {
  if (Array.isArray(value)) {
    for (const item of value) collectClassNames(item, result)
    return
  }

  if (value) result.push(String(value))
}

export function cn(...values: ClassValue[]): string {
  const result: string[] = []
  for (const value of values) collectClassNames(value, result)
  return result.join(" ")
}

export const isSubpost = (id: string) => id.includes("/")
