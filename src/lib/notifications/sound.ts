// @ts-nocheck
import { uiLogger } from '@/lib/logger'

/**
 * Notification Sound Manager
 * Handles playing notification sounds with volume control
 */

let audioContext: AudioContext | null = null
let soundEnabled = true
let soundVolume = 0.5

// Initialize audio context (lazy loading)
function getAudioContext(): AudioContext {
  if (!audioContext) {
    audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  }
  return audioContext
}

/**
 * Play notification sound using Web Audio API
 * Creates a pleasant notification tone
 */
export function playNotificationSound(volume: number = soundVolume): void {
  if (!soundEnabled || typeof window === 'undefined') {return}

  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // Create oscillator for the tone
    const oscillator = ctx.createOscillator()
    const gainNode = ctx.createGain()

    // Connect nodes
    oscillator.connect(gainNode)
    gainNode.connect(ctx.destination)

    // Set frequency (pleasant notification tone)
    oscillator.frequency.setValueAtTime(800, now)
    oscillator.frequency.exponentialRampToValueAtTime(600, now + 0.1)

    // Set volume envelope (fade in/out)
    gainNode.gain.setValueAtTime(0, now)
    gainNode.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01)
    gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.3)

    // Play sound
    oscillator.start(now)
    oscillator.stop(now + 0.3)

  } catch (error: unknown) {
    // Silent fail - notification sounds are non-critical
    if (process.env.NODE_ENV === 'development') {
      uiLogger.error({ error }, 'Failed to play notification sound')
    }
  }
}

/**
 * Play urgent notification sound (more attention-grabbing)
 */
export function playUrgentNotificationSound(volume: number = soundVolume): void {
  if (!soundEnabled || typeof window === 'undefined') {return}

  try {
    const ctx = getAudioContext()
    const now = ctx.currentTime

    // First beep
    const osc1 = ctx.createOscillator()
    const gain1 = ctx.createGain()
    osc1.connect(gain1)
    gain1.connect(ctx.destination)
    osc1.frequency.setValueAtTime(900, now)
    gain1.gain.setValueAtTime(0, now)
    gain1.gain.linearRampToValueAtTime(volume * 0.4, now + 0.01)
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.15)
    osc1.start(now)
    osc1.stop(now + 0.15)

    // Second beep
    const osc2 = ctx.createOscillator()
    const gain2 = ctx.createGain()
    osc2.connect(gain2)
    gain2.connect(ctx.destination)
    osc2.frequency.setValueAtTime(900, now + 0.2)
    gain2.gain.setValueAtTime(0, now + 0.2)
    gain2.gain.linearRampToValueAtTime(volume * 0.4, now + 0.21)
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.35)
    osc2.start(now + 0.2)
    osc2.stop(now + 0.35)

  } catch (error: unknown) {
    // Silent fail - notification sounds are non-critical
    if (process.env.NODE_ENV === 'development') {
      uiLogger.error({ error }, 'Failed to play urgent notification sound')
    }
  }
}

/**
 * Set sound enabled state
 */
export function setSoundEnabled(enabled: boolean): void {
  soundEnabled = enabled
}

/**
 * Set sound volume (0.0 to 1.0)
 */
export function setSoundVolume(volume: number): void {
  soundVolume = Math.max(0, Math.min(1, volume))
}

/**
 * Get current sound settings
 */
export function getSoundSettings(): { enabled: boolean; volume: number } {
  return {
    enabled: soundEnabled,
    volume: soundVolume,
  }
}

/**
 * Test notification sound
 */
export function testNotificationSound(volume?: number): void {
  playNotificationSound(volume)
}

/**
 * Test urgent notification sound
 */
export function testUrgentSound(volume?: number): void {
  playUrgentNotificationSound(volume)
}
