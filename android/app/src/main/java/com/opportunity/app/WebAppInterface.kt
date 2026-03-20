package com.opportunity.app

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.provider.Settings
import android.webkit.JavascriptInterface

/**
 * JavaScript ↔ Android bridge.
 * The web app can call Android.openUrl(), Android.shareText(), etc.
 */
class WebAppInterface(private val context: Context) {

    /** Open a URL in the external browser */
    @JavascriptInterface
    fun openExternalUrl(url: String) {
        val intent = Intent(Intent.ACTION_VIEW, Uri.parse(url)).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }

    /** Share text using Android share sheet */
    @JavascriptInterface
    fun shareText(text: String, title: String = "Share Opportunity") {
        val intent = Intent(Intent.ACTION_SEND).apply {
            type = "text/plain"
            putExtra(Intent.EXTRA_TEXT, text)
            putExtra(Intent.EXTRA_TITLE, title)
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(Intent.createChooser(intent, title).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        })
    }

    /** Returns whether we're running inside the Android app shell */
    @JavascriptInterface
    fun isAndroidApp(): Boolean = true

    /** Returns app version string */
    @JavascriptInterface
    fun getAppVersion(): String = "1.0.0"

    /** Check notification listener permission status */
    @JavascriptInterface
    fun isNotificationListenerEnabled(): Boolean =
        NotificationPermissionHelper.isNotificationListenerEnabled(context)

    /** Open Notification Listener settings */
    @JavascriptInterface
    fun openNotificationSettings() {
        val intent = Intent(Settings.ACTION_NOTIFICATION_LISTENER_SETTINGS).apply {
            flags = Intent.FLAG_ACTIVITY_NEW_TASK
        }
        context.startActivity(intent)
    }
}
