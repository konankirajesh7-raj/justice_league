package com.opportunity.app

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

/**
 * Restarts the foreground service after device reboot
 * so notification listening resumes automatically.
 */
class BootReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == Intent.ACTION_BOOT_COMPLETED) {
            context.startForegroundService(
                Intent(context, NotificationForegroundService::class.java)
            )
        }
    }
}
