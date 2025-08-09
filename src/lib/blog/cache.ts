/**
 * @fileoverview Caching implementations for post management system
 *
 * Provides different caching strategies using the Strategy pattern.
 * The WeakRef cache implementation helps prevent memory leaks by allowing
 * garbage collection of cached objects when they're no longer referenced elsewhere.
 *
 * @author Claude Code
 * @version 2.0.0
 */

import type { CachingStrategy } from './types'

/**
 * WeakRef-based cache implementation that prevents memory leaks.
 *
 * This cache uses WeakRef to hold references to cached objects, allowing
 * them to be garbage collected when no other references exist. This is
 * particularly useful for caching large objects like post metadata that
 * might not be needed for extended periods.
 *
 * The cache automatically cleans up dead references when accessed,
 * maintaining good memory hygiene without requiring manual cleanup.
 *
 * @template T - Type of objects to cache (must be WeakKey compatible)
 *
 * @example
 * ```typescript
 * const cache = new WeakRefCache<PostMeta>()
 * cache.set('post-1', metadata)
 *
 * // Later...
 * const cached = cache.get('post-1') // Returns metadata or null if GC'd
 * ```
 */
export class WeakRefCache<T extends WeakKey> implements CachingStrategy<T> {
  /** Internal storage using WeakRef for memory-safe caching */
  private cache = new Map<string, WeakRef<T>>()

  /**
   * Retrieves a cached value by key.
   *
   * Automatically cleans up dead WeakRef objects when they're encountered.
   * This helps maintain cache hygiene without requiring periodic cleanup.
   *
   * @param key - Cache key to look up
   * @returns Cached value or null if not found or garbage collected
   */
  get(key: string): T | null {
    const ref = this.cache.get(key)

    if (!ref) {
      return null
    }

    const value = ref.deref()

    if (value === undefined) {
      // Reference was garbage collected, clean up the dead reference
      this.cache.delete(key)
      return null
    }

    return value
  }

  /**
   * Stores a value in the cache using WeakRef.
   *
   * @param key - Cache key to store under
   * @param value - Value to cache (must be a WeakKey)
   */
  set(key: string, value: T): void {
    this.cache.set(key, new WeakRef(value))
  }

  /**
   * Removes a specific key from the cache.
   *
   * @param key - Cache key to remove
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clears all cached values.
   *
   * Useful for cache reset scenarios or during testing.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Returns the number of cache entries.
   *
   * Note: This count includes dead WeakRef objects that haven't been
   * cleaned up yet. The actual number of accessible objects may be lower.
   *
   * @returns Current number of cache entries
   */
  size(): number {
    return this.cache.size
  }

  /**
   * Performs manual cleanup of dead WeakRef objects.
   *
   * While the cache cleans up dead references automatically during get()
   * operations, this method can be called to proactively clean up the cache.
   *
   * @returns Number of dead references removed
   */
  cleanup(): number {
    let removedCount = 0

    for (const [key, ref] of this.cache.entries()) {
      if (ref.deref() === undefined) {
        this.cache.delete(key)
        removedCount++
      }
    }

    return removedCount
  }
}

/**
 * Simple in-memory cache implementation without memory management.
 *
 * This cache holds direct references to objects, which means they will
 * not be garbage collected until explicitly removed from the cache.
 * Use this for objects that should persist for the lifetime of the application
 * or when you need guaranteed cache retention.
 *
 * @template T - Type of objects to cache
 *
 * @example
 * ```typescript
 * const cache = new MemoryCache<string>()
 * cache.set('key1', 'value1')
 * const value = cache.get('key1') // Always returns 'value1' until invalidated
 * ```
 */
export class MemoryCache<T> implements CachingStrategy<T> {
  /** Internal storage using direct object references */
  private cache = new Map<string, T>()

  /**
   * Retrieves a cached value by key.
   *
   * @param key - Cache key to look up
   * @returns Cached value or null if not found
   */
  get(key: string): T | null {
    return this.cache.get(key) ?? null
  }

  /**
   * Stores a value in the cache.
   *
   * @param key - Cache key to store under
   * @param value - Value to cache
   */
  set(key: string, value: T): void {
    this.cache.set(key, value)
  }

  /**
   * Removes a specific key from the cache.
   *
   * @param key - Cache key to remove
   */
  invalidate(key: string): void {
    this.cache.delete(key)
  }

  /**
   * Clears all cached values.
   */
  clear(): void {
    this.cache.clear()
  }

  /**
   * Returns the exact number of cached items.
   *
   * @returns Current number of cache entries
   */
  size(): number {
    return this.cache.size
  }
}

/**
 * No-op cache implementation that doesn't actually cache anything.
 *
 * Useful for testing scenarios where you want to disable caching
 * or for environments where memory usage needs to be minimized.
 *
 * @template T - Type of objects that would be cached
 *
 * @example
 * ```typescript
 * const cache = new NoOpCache<PostMeta>()
 * cache.set('key1', metadata) // Does nothing
 * const value = cache.get('key1') // Always returns null
 * ```
 */
export class NoOpCache<T> implements CachingStrategy<T> {
  /**
   * Always returns null (no caching).
   */
  get(_key: string): T | null {
    return null
  }

  /**
   * Does nothing (no caching).
   */
  set(_key: string, _value: T): void {
    // Intentionally empty
  }

  /**
   * Does nothing (no caching).
   */
  invalidate(_key: string): void {
    // Intentionally empty
  }

  /**
   * Does nothing (no caching).
   */
  clear(): void {
    // Intentionally empty
  }

  /**
   * Always returns 0 (no caching).
   */
  size(): number {
    return 0
  }
}
