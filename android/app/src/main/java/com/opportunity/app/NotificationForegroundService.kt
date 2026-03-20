package com.opportunity.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.os.IBinder

/**
 * Foreground service that shows a persistent (silent) notification to keep the
 * OpportunityNotificationService alive in the background.
 *
 * IMPORTANT: This service creates its own notification channels so it doesn't
 * depend on OpportunityNotificationService.onCreate() having run first.
 */
class NotificationForegroundService : Service() {

    companion object {
        private const val NOTIFICATION_ID = 1001
        private const val CHANNEL_ID_FOUND = "opportunity_found"
        private const val CHANNEL_ID_PERSISTENT = "opportunity_listening"
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        // Create channels HERE — not relying on OpportunityNotificationService
        ensureNotificationChannels()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, buildPersistentNotification())
        return START_STICKY
    }

    private fun ensureNotificationChannels() {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        if (nm.getNotificationChannel(CHANNEL_ID_FOUND) == null) {
            nm.createNotificationChannel(
                NotificationChannel(
                    CHANNEL_ID_FOUND,
                    "Opportunities Found",
                    NotificationManager.IMPORTANCE_HIGH,
                ).apply {
                    description = "Notifications when an opportunity is detected"
                    enableVibration(true)
                    vibrationPattern = longArrayOf(0, 250, 100, 250)
                }
            )
        }

        if (nm.getNotificationChannel(CHANNEL_ID_PERSISTENT) == null) {
            nm.createNotificationChannel(
                NotificationChannel(
                    CHANNEL_ID_PERSISTENT,
                    "Listening Status",
                    NotificationManager.IMPORTANCE_MIN,
                ).apply {
                    description = "Background service status"
                    setSound(null, null)
                }
            )
        }
    }

    private fun buildPersistentNotification(): Notification {
        val openAppIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        return Notification.Builder(this, CHANNEL_ID_PERSISTENT)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("OpportUnity is watching \uD83D\uDD14")
            .setContentText("Auto-extracting opportunities from WhatsApp messages")
            .setContentIntent(openAppIntent)
            .setOngoing(true)
            .setShowWhen(false)
            .build()
    }
}
