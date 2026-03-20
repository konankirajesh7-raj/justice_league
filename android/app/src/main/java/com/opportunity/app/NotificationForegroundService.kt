package com.opportunity.app

import android.app.Notification
import android.app.PendingIntent
import android.app.Service
import android.content.Intent
import android.os.IBinder

/**
 * Foreground service that shows a persistent (silent) notification
 * to keep OpportunityNotificationService alive in the background.
 * Without this, Android may kill the notification listener on low-memory devices.
 */
class NotificationForegroundService : Service() {

    companion object {
        private const val NOTIFICATION_ID = 1001
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        startForeground(NOTIFICATION_ID, buildPersistentNotification())
        return START_STICKY
    }

    private fun buildPersistentNotification(): Notification {
        val openAppIntent = PendingIntent.getActivity(
            this,
            0,
            Intent(this, MainActivity::class.java),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        return Notification.Builder(this, OpportunityNotificationService.CHANNEL_ID_PERSISTENT)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("OpportUnity is watching 🔔")
            .setContentText("Auto-extracting opportunities from WhatsApp messages")
            .setContentIntent(openAppIntent)
            .setOngoing(true)
            .setShowWhen(false)
            .build()
    }
}
