import { useState } from 'react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { DEFAULT_SETTINGS } from '@/data/constants'
import settingsImage from '../../images/settings.png'

export default function Settings() {
  const [settings, setSettings] = useLocalStorage('posturepal_settings', DEFAULT_SETTINGS)
  const [saved, setSaved] = useState(false)

  function handleChange(key, value) {
    setSettings(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  function handleSave() {
    // Settings are already persisted via useLocalStorage on every change.
    // This button exists for UX feedback only.
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  return (
    <div className="flex flex-col gap-6 items-center w-full min-h-[calc(100vh-6rem)] pt-8 sm:pt-12 px-4">
      {/* Header with settings image */}
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

          <label className="flex items-center gap-3 text-sm text-gray-600">
            <input
              type="checkbox"
              checked={settings.soundAlerts}
              onChange={e => handleChange('soundAlerts', e.target.checked)}
              className="accent-brand-500 w-4 h-4"
            />
            Enable sound alerts
          </label>
        </Card>

        <Card title="Session">
          <label className="block text-sm text-gray-600">
            Reminder interval (minutes): <strong>{settings.reminderInterval}</strong>
            <input
              type="range"
              min={1} max={60} step={1}
              value={settings.reminderInterval}
              onChange={e => handleChange('reminderInterval', Number(e.target.value))}
              className="w-full mt-1 accent-brand-500"
            />
          </label>
        </Card>

        <Button onClick={handleSave}>
          {saved ? 'Saved!' : 'Save Settings'}
        </Button>
      </div>
    </div>
  )
}
