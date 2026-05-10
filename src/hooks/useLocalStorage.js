import { useState } from 'react'

/**
 * Drop-in replacement for useState that persists to localStorage.
 *
 * @template T
 * @param {string} key - localStorage key
 * @param {T} initialValue - default value when key is absent
 * @returns {[T, (value: T | ((prev: T) => T)) => void]}
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  function setValue(value) {
    setStoredValue(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(next))
      return next
    })
  }

  return [storedValue, setValue]
}
