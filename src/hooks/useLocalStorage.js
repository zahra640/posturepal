import { useState, useEffect } from 'react'

const EVENT = 'posturepal:storage'

export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch {
      return initialValue
    }
  })

  // Re-sync when another component on this page writes the same key
  useEffect(() => {
    function onUpdate(e) {
      if (e.detail.key === key) setStoredValue(e.detail.value)
    }
    window.addEventListener(EVENT, onUpdate)
    return () => window.removeEventListener(EVENT, onUpdate)
  }, [key])

  function setValue(value) {
    setStoredValue(prev => {
      const next = typeof value === 'function' ? value(prev) : value
      localStorage.setItem(key, JSON.stringify(next))
      window.dispatchEvent(new CustomEvent(EVENT, { detail: { key, value: next } }))
      return next
    })
  }

  return [storedValue, setValue]
}
