package com.opportunity.app

import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.Looper
import androidx.appcompat.app.AppCompatActivity
import androidx.core.splashscreen.SplashScreen.Companion.installSplashScreen
import com.opportunity.app.databinding.ActivitySplashBinding

class SplashActivity : AppCompatActivity() {

    private lateinit var binding: ActivitySplashBinding

    override fun onCreate(savedInstanceState: Bundle?) {
        installSplashScreen()
        super.onCreate(savedInstanceState)
        binding = ActivitySplashBinding.inflate(layoutInflater)
        setContentView(binding.root)

        // Animate logo
        binding.logoText.alpha = 0f
        binding.taglineText.alpha = 0f
        binding.logoText.animate().alpha(1f).setDuration(600).start()
        binding.taglineText.animate().alpha(1f).setStartDelay(300).setDuration(600).start()

        // After 1.8s: check notification permission, then go to main
        Handler(Looper.getMainLooper()).postDelayed({
            checkPermissionAndProceed()
        }, 1800)
    }

    private fun checkPermissionAndProceed() {
        val isEnabled = NotificationPermissionHelper.isNotificationListenerEnabled(this)
        if (!isEnabled) {
            // Show permission dialog before main activity
            showPermissionRationale()
        } else {
            goToMain()
        }
    }

    private fun showPermissionRationale() {
        androidx.appcompat.app.AlertDialog.Builder(this)
            .setTitle("Enable Notification Access")
            .setMessage(
                "OpportUnity needs Notification Access to automatically detect " +
                "opportunities in your WhatsApp messages.\n\n" +
                "Tap 'Open Settings', then find OpportUnity and toggle it ON."
            )
            .setPositiveButton("Open Settings") { _, _ ->
                startActivity(Intent("android.settings.ACTION_NOTIFICATION_LISTENER_SETTINGS"))
                goToMain()
            }
            .setNegativeButton("Skip for now") { _, _ ->
                goToMain()
            }
            .setCancelable(false)
            .show()
    }

    private fun goToMain() {
        startActivity(Intent(this, MainActivity::class.java))
        finish()
    }
}
