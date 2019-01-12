import send from 'sketch-module-google-analytics'
import { getUserPreferences } from './preferences'

const key = 'UA-805972-9'

export function sendEvent (context, category, action, label, value) {
  console.log(action)
  // const { sendAnalytics } = getUserPreferences(context)
  // if (!sendAnalytics) { return }
  const payload = {}
  if (category) { payload.ec = category }
  if (action) { payload.ea = action }
  if (label) { payload.el = label }
  if (value) { payload.ev = value }

  return send(context, key, 'event', payload)
}

export function sendError (context, error) {
  console.log(error)

  // const { sendAnalytics } = getUserPreferences(context)
  // if (!sendAnalytics) { return }
  return send(context, key, 'event', {exd: error})
}
