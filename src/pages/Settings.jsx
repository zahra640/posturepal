import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { DEFAULT_SETTINGS } from '@/data/constants'
import settingsImage from '../../images/settings.png'

const notifSupported = 'Notification' in window

export default function Settings() {
  const [settings, setSettings] = useLocalStorage('posturepal_settings', DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)
  const [notifBlocked, setNotifBlocked] = useState(false)

  function handleChange(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  async function handleNotifToggle(enabled) {
    if (!enabled) {
      handleChange('pushNotifications', false)
      setNotifBlocked(false)
      return
    }

    if (Notification.permission === 'granted') {
      handleChange('pushNotifications', true)
    } else if (Notification.permission === 'denied') {
      setNotifBlocked(true)
    } else {
      const result = await Notification.requestPermission()
      if (result === 'granted') {
        handleChange('pushNotifications', true)
      } else {
        setNotifBlocked(true)
      }
    }
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full min-h-[calc(100vh-6rem)] pt-8 sm:pt-12 px-4">
      <img
        src={settingsImage}
        alt="Settings"
        className="h-16 sm:h-20 w-auto object-contain mb-4"
      />

      <div className="w-full max-w-lg">
        <Card title="Alert Thresholds">
          <label className="block mb-4">
            <span className="text-sm text-gray-600">
              Warn when score drops below: <strong>{settings.warnThreshold}</strong>
            </span>
            <input
              type="range"
              min={10} max={90} step={5}
              value={settings.warnThreshold}
              onChange={e => handleChange('warnThreshold', Number(e.target.value))}
              className="w-full mt-1 accent-brand-500"
            />
          </label>

          <div className="flex flex-col gap-3">
            <label className="flex items-center gap-3 text-sm text-gray-600">
              <input
                type="checkbox"
                checked={settings.soundAlerts}
                onChange={e => handleChange('soundAlerts', e.target.checked)}
                className="accent-brand-500 w-4 h-4"
              />
              Enable sound alerts
            </label>

            <div className="flex flex-col gap-1">
              <label className="flex items-center gap-3 text-sm text-gray-600">
                <input
                  type="checkbox"
                  checked={settings.pushNotifications && Notification.permission === 'granted'}
                  onChange={e => handleNotifToggle(e.target.checked)}
                  disabled={!notifSupported}
                  className="accent-brand-500 w-4 h-4 disabled:opacity-40"
                />
                Enable popup notifications
              </label>
              {!notifSupported && (
                <p className="text-xs text-gray-400 ml-7">Not supported in this browser.</p>
              )}
              {notifBlocked && (
                <p className="text-xs text-red-400 ml-7">
                  Notifications are blocked. Allow them in your browser site settings, then try again.
                </p>
              )}
            </div>
          </div>
        </Card>

        <Button onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
