/**
 * Locale-aware pluralization built on Intl.PluralRules.
 *
 * English only needs "one"/"other", but hardcoding `count === 1` bakes that
 * assumption into every call site. Going through Intl.PluralRules means the
 * category is chosen by the site locale's own rules, so a locale with "zero",
 * "two", or "few" forms is a matter of passing more forms, not rewriting
 * conditionals.
 */

import { SITE } from "@site-config"

/**
 * Noun forms keyed by CLDR plural category. `other` is the required fallback
 * used whenever the locale selects a category no form was supplied for.
 */
export type PluralForms = Partial<Record<Intl.LDMLPluralRule, string>> & {
  other: string
}

const rulesByLocale = new Map<string, Intl.PluralRules>()
const numberFormatByLocale = new Map<string, Intl.NumberFormat>()

function getPluralRules(locale: string): Intl.PluralRules {
  let rules = rulesByLocale.get(locale)
  if (!rules) {
    rules = new Intl.PluralRules(locale)
    rulesByLocale.set(locale, rules)
  }
  return rules
}

function getNumberFormat(locale: string): Intl.NumberFormat {
  let numberFormat = numberFormatByLocale.get(locale)
  if (!numberFormat) {
    numberFormat = new Intl.NumberFormat(locale)
    numberFormatByLocale.set(locale, numberFormat)
  }
  return numberFormat
}

/** Expands the shorthand: a bare singular noun pluralized with a trailing "s". */
function toForms(noun: string | PluralForms): PluralForms {
  return typeof noun === "string" ? { one: noun, other: `${noun}s` } : noun
}

/**
 * Selects the noun form matching `count` in the given locale.
 *
 * @param count - Quantity the noun describes
 * @param noun - Singular noun (regular "+s" plural), or explicit forms per plural category
 * @param locale - BCP 47 language tag (defaults to site locale)
 * @returns The noun alone, without the count
 *
 * @example
 * pluralize(1, "post") // "post"
 * pluralize(3, "post") // "posts"
 * pluralize(3, { one: "entry", other: "entries" }) // "entries"
 */
export function pluralize(
  count: number,
  noun: string | PluralForms,
  locale: string = SITE.locale.lang,
): string {
  const forms = toForms(noun)
  return forms[getPluralRules(locale).select(count)] ?? forms.other
}

/**
 * Formats a count together with its noun, e.g. "1 post" / "1,204 posts".
 *
 * @param count - Quantity the noun describes
 * @param noun - Singular noun (regular "+s" plural), or explicit forms per plural category
 * @param locale - BCP 47 language tag (defaults to site locale)
 * @returns Localized number followed by the matching noun form
 */
export function formatCount(
  count: number,
  noun: string | PluralForms,
  locale: string = SITE.locale.lang,
): string {
  return `${getNumberFormat(locale).format(count)} ${pluralize(count, noun, locale)}`
}
