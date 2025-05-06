// Request notification permission
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) {
    console.log("This browser does not support notifications")
    return false
  }

  if (Notification.permission === "granted") {
    return true
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission()
    return permission === "granted"
  }

  return false
}

// Show a browser notification
export function showNotification(title: string, options: NotificationOptions = {}): void {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return
  }

  try {
    new Notification(title, options)
  } catch (error) {
    console.error("Error showing notification:", error)
  }
}

// Play notification sound with high precision
export async function playNotificationSound(): Promise<void> {
  try {
    // Use Web Audio API for more precise timing
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()

    // Create an oscillator for a simple beep
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    // Connect the nodes
    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    // Configure the sound
    oscillator.type = "sine"
    oscillator.frequency.value = 880 // A5 note
    gainNode.gain.value = 0.1 // Lower volume

    // Schedule the sound with precise timing
    const now = audioContext.currentTime

    // Fade in
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(0.1, now + 0.01)

    // Fade out
    gainNode.gain.setValueAtTime(0.1, now + 0.1)
    gainNode.gain.linearRampToValueAtTime(0, now + 0.2)

    // Start and stop the oscillator
    oscillator.start(now)
    oscillator.stop(now + 0.2)

    // Log timing for debugging
    console.log(`Sound scheduled at ${now}, current time: ${Date.now()}`)
  } catch (error) {
    console.error("Error playing notification sound:", error)

    // Fallback to simple beep if Web Audio API fails
    try {
      const audio = new Audio(
        "data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YWoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBhxQoN/l8/7nxYpCKTM8WH2dvN3w/PDVpHg9Hxw1Z6XN7v7++820c0EZEyFPjN79//768M2TXDIVHkSH2P7/+vngvH9AFRs9f9X9/fv56cJ6PxceQoTY+/v599yoaTcUIVKe6fv599eaVScPKGjD/f36782JRBcVOHrU/Pv54rpqMBIiXrf6+vjJl08fHEqT5/v35K5hJw8yfeH8+OW3cTYZLXfX/PnYoVwpGkSJ3/z44rVvMRc5i+T8+N2lYy0WPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv44rRuMRY4iuL8+N2lYy0XPX/b/PjfrGYtGDyA2fv4AA==",
      )
      audio.volume = 0.5
      await audio.play()
    } catch (fallbackError) {
      console.error("Fallback audio method also failed:", fallbackError)
    }
  }
}
