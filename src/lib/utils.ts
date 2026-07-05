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

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date)
}

export const isSubpost = (id: string) => id.includes("/")

export const subpostSlug = (id: string) => id.split("/")[1]

export const normalizePath = (pathname: string) => {
  try {
    return decodeURIComponent(pathname).replace(/\/+$/, "")
  } catch {
    return pathname.replace(/\/+$/, "")
  }
}

export const hashId = (hash: string) => decodeURIComponent(hash.slice(1))
