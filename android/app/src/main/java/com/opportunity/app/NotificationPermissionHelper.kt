package com.opportunity.app

import android.content.ComponentName
import android.content.Context
import android.provider.Settings
import android.text.TextUtils

/**
 * Helper to check if the notification listener permission is granted.
 */
object NotificationPermissionHelper {

    fun isNotificationListenerEnabled(context: Context): Boolean {
        val pkgName = context.packageName
        val flat = Settings.Secure.getString(
            context.contentResolver,
            "enabled_notification_listeners"
        ) ?: return false
        if (flat.isNullOrBlank()) return false

        val names = flat.split(":")
        for (name in names) {
            val cn = ComponentName.unflattenFromString(name) ?: continue
            if (cn.packageName == pkgName) return true
        }
        return false
    }
}
