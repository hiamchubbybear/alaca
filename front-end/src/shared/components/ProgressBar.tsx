import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import { useEffect } from 'react'

// Configure NProgress
NProgress.configure({
  showSpinner: false, // Hide spinner, only show bar
  speed: 400,
  minimum: 0.1,
  trickleSpeed: 200
})

export function ProgressBar() {
  useEffect(() => {
    // This component just imports the CSS
    // The actual progress is controlled by NProgress.start() and NProgress.done()
  }, [])

  return null
}

export { NProgress }
