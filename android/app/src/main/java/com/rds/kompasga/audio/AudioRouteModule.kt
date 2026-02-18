package com.kompasga.audio

import android.content.Context
import android.media.AudioAttributes
import android.media.AudioDeviceInfo
import android.media.AudioFocusRequest
import android.media.AudioManager
import android.os.Build
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AudioRouteModule(
  reactContext: ReactApplicationContext
) : ReactContextBaseJavaModule(reactContext) {

  private val audioManager =
    reactContext.getSystemService(Context.AUDIO_SERVICE) as AudioManager

  private var focusRequest: AudioFocusRequest? = null

  override fun getName(): String = "AudioRoute"

  // =========================================================
  // PUBLIC API (JS)
  // =========================================================
  @ReactMethod
  fun prepareMediaAudio() {
    Log.i("AudioRoute", "prepareMediaAudio CALLED (SDK ${Build.VERSION.SDK_INT})")

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
      prepareForAndroid12Plus()
    } else {
      prepareForLegacyAndroid()
    }

    Log.i(
      "AudioRoute",
      "FINAL STATE → mode=${audioManager.mode}, speaker=${audioManager.isSpeakerphoneOn}"
    )
  }

  @ReactMethod
  fun abandonAudioFocus() {
    Log.i("AudioRoute", "abandonAudioFocus CALLED")

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      focusRequest?.let {
        audioManager.abandonAudioFocusRequest(it)
      }
    } else {
      audioManager.abandonAudioFocus(null)
    }

    audioManager.isSpeakerphoneOn = false
  }

  // =========================================================
  // ANDROID < 12 (SDK < 31)
  // =========================================================
  private fun prepareForLegacyAndroid() {
    Log.i("AudioRoute", "prepareForLegacyAndroid")

    // 🔥 WAJIB UNTUK WEBRTC
    audioManager.mode = AudioManager.MODE_IN_COMMUNICATION

    // ❌ MATIKAN BLUETOOTH
    audioManager.isBluetoothScoOn = false
    audioManager.stopBluetoothSco()

    // 🔊 PAKSA SPEAKER
    audioManager.isSpeakerphoneOn = true

    // 🎧 AUDIO FOCUS (VOICE)
    audioManager.requestAudioFocus(
        null,
        AudioManager.STREAM_VOICE_CALL,
        AudioManager.AUDIOFOCUS_GAIN
    )

    // 🔊 SET VOLUME VOICE CALL (INI YANG HILANG SELAMA INI)
    val max = audioManager.getStreamMaxVolume(AudioManager.STREAM_VOICE_CALL)
    audioManager.setStreamVolume(
        AudioManager.STREAM_VOICE_CALL,
        max,
        0
    )

    Log.i(
        "AudioRoute",
        "Legacy OK → MODE_IN_COMMUNICATION + STREAM_VOICE_CALL($max)"
    )
  }

  // =========================================================
  // ANDROID ≥ 12 (SDK ≥ 31)
  // =========================================================
  private fun prepareForAndroid12Plus() {
    Log.i("AudioRoute", "prepareForAndroid12Plus")

    // 🔥 WAJIB UNTUK WEBRTC
    audioManager.mode = AudioManager.MODE_IN_COMMUNICATION

    // ❌ MATIKAN BLUETOOTH
    audioManager.isBluetoothScoOn = false
    audioManager.stopBluetoothSco()

    // 🔊 SPEAKER ON
    audioManager.isSpeakerphoneOn = true

    // 🎙️ AUDIO ATTRIBUTES (VOICE)
    val attrs = AudioAttributes.Builder()
      .setUsage(AudioAttributes.USAGE_VOICE_COMMUNICATION)
      .setContentType(AudioAttributes.CONTENT_TYPE_SPEECH)
      .build()

    focusRequest = AudioFocusRequest.Builder(AudioManager.AUDIOFOCUS_GAIN)
      .setAudioAttributes(attrs)
      .setAcceptsDelayedFocusGain(false)
      .setOnAudioFocusChangeListener { }
      .build()

    audioManager.requestAudioFocus(focusRequest!!)

    // 🔥 WAJIB ANDROID 12+
    bindSpeakerCommunicationDevice()

    // 🔊 SET VOLUME VOICE
    val max = audioManager.getStreamMaxVolume(AudioManager.STREAM_VOICE_CALL)
    audioManager.setStreamVolume(
      AudioManager.STREAM_VOICE_CALL,
      max,
      0
    )

    Log.i(
      "AudioRoute",
      "Android12+ OK → MODE_IN_COMMUNICATION + VOICE_CALL($max)"
    )
  }

  // =========================================================
  // ANDROID 12+ COMMUNICATION DEVICE
  // =========================================================
  private fun bindSpeakerCommunicationDevice() {
    if (Build.VERSION.SDK_INT < Build.VERSION_CODES.S) return

    val devices = audioManager.availableCommunicationDevices
    val speaker = devices.firstOrNull {
      it.type == AudioDeviceInfo.TYPE_BUILTIN_SPEAKER
    }

    if (speaker != null) {
      audioManager.setCommunicationDevice(speaker)
      Log.i("AudioRoute", "Speaker communication device bound")
    } else {
      Log.w("AudioRoute", "No speaker communication device found")
    }
  }
}
