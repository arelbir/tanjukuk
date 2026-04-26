import { useEffect, useState } from 'react'

export interface PushSubscription {
  endpoint: string
  keys: {
    p256dh: string
    auth: string
  }
}

export function usePushSubscription() {
  const [subscription, setSubscription] = useState<PushSubscription | null>(null)
  const [isSupported, setIsSupported] = useState(false)
  const [isSubscribed, setIsSubscribed] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Check if push is supported
    setIsSupported('serviceWorker' in navigator && 'PushManager' in window)

    // Register service worker and check existing subscription
    async function init() {
      if (!('serviceWorker' in navigator)) return

      try {
        const registration = await navigator.serviceWorker.register('/sw.js')
        const existingSubscription = await registration.pushManager.getSubscription()

        if (existingSubscription) {
          setSubscription(existingSubscription.toJSON() as PushSubscription)
          setIsSubscribed(true)
        }
      } catch (error) {
        console.error('Service worker registration failed:', error)
      }
    }

    init()
  }, [])

  async function subscribe() {
    if (!isSupported) {
      throw new Error('Push notifications are not supported')
    }

    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY

      if (!vapidPublicKey) {
        throw new Error('VAPID public key is not configured')
      }

      // Convert VAPID key to Uint8Array
      const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey)

      const newSubscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey as BufferSource,
      })

      const subscriptionJson = newSubscription.toJSON() as PushSubscription

      // Send subscription to server
      const response = await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription: subscriptionJson }),
      })

      if (!response.ok) {
        throw new Error('Failed to save subscription on server')
      }

      setSubscription(subscriptionJson)
      setIsSubscribed(true)

      return subscriptionJson
    } catch (error) {
      console.error('Subscription failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  async function unsubscribe() {
    if (!subscription) return

    setIsLoading(true)

    try {
      const registration = await navigator.serviceWorker.ready
      const pushSubscription = await registration.pushManager.getSubscription()

      if (pushSubscription) {
        await pushSubscription.unsubscribe()
      }

      // Remove subscription from server
      await fetch('/api/push/subscribe', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint: subscription.endpoint }),
      })

      setSubscription(null)
      setIsSubscribed(false)
    } catch (error) {
      console.error('Unsubscribe failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isSupported,
    isSubscribed,
    subscription,
    isLoading,
    subscribe,
    unsubscribe,
  }
}

// Helper function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')

  const rawData = window.atob(base64)
  const outputArray = new Uint8Array(rawData.length)

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i)
  }

  return outputArray
}
