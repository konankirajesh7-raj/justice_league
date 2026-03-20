package com.opportunity.app

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.net.Uri
import android.service.notification.NotificationListenerService
import android.service.notification.StatusBarNotification
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import okhttp3.MediaType.Companion.toMediaType
import okhttp3.OkHttpClient
import okhttp3.Request
import okhttp3.RequestBody.Companion.toRequestBody
import org.json.JSONObject
import java.util.concurrent.TimeUnit

/**
 * Core service that reads notifications from WhatsApp, Telegram, etc.
 * When an opportunity is detected, it calls the AI extraction API
 * and shows a local notification with the result.
 */
class OpportunityNotificationService : NotificationListenerService() {

    companion object {
        private const val TAG = "OpportunityNS"
        const val CHANNEL_ID_FOUND = "opportunity_found"
        const val CHANNEL_ID_PERSISTENT = "opportunity_listening"

        // Apps we watch — WhatsApp, WhatsApp Business, Telegram
        private val WATCHED_PACKAGES = setOf(
            "com.whatsapp",
            "com.whatsapp.w4b",
            "org.telegram.messenger",
            "org.telegram.messenger.web",
            "com.gbwhatsapp",
        )

        // Keywords that suggest an opportunity message
        private val OPPORTUNITY_KEYWORDS = listOf(
            "internship", "intern", "job opening", "job opportunity",
            "hiring", "hackathon", "scholarship", "fellowship",
            "last date", "last day", "deadline", "apply now", "apply link",
            "stipend", "per month", "cgpa", "eligible",
            "registration open", "batch 2025", "batch 2026",
            "campus connect", "campus drive", "off campus",
            "google summer of code", "gsoc", "mlh", "microsoft",
            "tcs nextstep", "infosys", "wipro", "accenture",
        )

        // Min message length — ignore one-liners
        private const val MIN_TEXT_LENGTH = 80

        // API endpoint
        private const val EXTRACT_API_URL =
            "https://frontend-iota-teal-autcgnqxd4.vercel.app/api/extract"
    }

    private val serviceJob = SupervisorJob()
    private val serviceScope = CoroutineScope(Dispatchers.IO + serviceJob)

    private val httpClient = OkHttpClient.Builder()
        .connectTimeout(15, TimeUnit.SECONDS)
        .readTimeout(30, TimeUnit.SECONDS)
        .build()

    // Avoid processing the same message twice
    private val recentlyProcessed = mutableSetOf<String>()

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
        Log.i(TAG, "OpportunityNotificationService started")
    }

    override fun onDestroy() {
        serviceJob.cancel()
        super.onDestroy()
    }

    override fun onNotificationPosted(sbn: StatusBarNotification) {
        val packageName = sbn.packageName ?: return

        // Only watch specified apps
        if (packageName !in WATCHED_PACKAGES) return

        val extras = sbn.notification?.extras ?: return
        val title = extras.getString(Notification.EXTRA_TITLE) ?: ""
        val text = extras.getCharSequence(Notification.EXTRA_TEXT)?.toString() ?: ""
        val bigText = extras.getCharSequence(Notification.EXTRA_BIG_TEXT)?.toString() ?: text

        val fullText = buildString {
            if (title.isNotBlank()) append("$title\n")
            append(bigText)
        }.trim()

        // Skip short messages
        if (fullText.length < MIN_TEXT_LENGTH) return

        // Skip duplicates
        val hash = fullText.take(120).hashCode().toString()
        if (hash in recentlyProcessed) return

        // Check for opportunity keywords
        val lowerText = fullText.lowercase()
        val matchedKeyword = OPPORTUNITY_KEYWORDS.firstOrNull { lowerText.contains(it) }
            ?: return

        Log.i(TAG, "Opportunity keyword '$matchedKeyword' found in ${packageName}. Extracting…")
        recentlyProcessed.add(hash)
        // Keep set bounded
        if (recentlyProcessed.size > 50) recentlyProcessed.clear()

        // Call AI extraction in background coroutine
        serviceScope.launch {
            extractAndNotify(fullText, packageName)
        }
    }

    private suspend fun extractAndNotify(text: String, sourceApp: String) {
        try {
            val body = JSONObject().apply {
                put("text", text)
            }.toString()

            val request = Request.Builder()
                .url(EXTRACT_API_URL)
                .post(body.toRequestBody("application/json".toMediaType()))
                .header("Content-Type", "application/json")
                .header("X-Source", "android-notification-listener")
                .build()

            val response = httpClient.newCall(request).execute()
            val responseBody = response.body?.string() ?: return

            if (!response.isSuccessful) {
                Log.w(TAG, "Extract API error ${response.code}: $responseBody")
                // Still show a notification so user can manually review
                showManualReviewNotification(text, sourceApp)
                return
            }

            val json = JSONObject(responseBody)
            val company = json.optString("company", "Unknown Company")
            val role = json.optString("role", "Unknown Role")
            val type = json.optString("type", "Opportunity")
            val deadline = json.optString("deadline", "")
            val stipend = json.optString("stipend", "")
            val isSpam = json.optBoolean("isSpam", false)

            if (isSpam) {
                Log.i(TAG, "Spam detected — skipping notification")
                return
            }

            showOpportunityNotification(
                company = company,
                role = role,
                type = type,
                deadline = deadline,
                stipend = stipend,
                originalText = text,
            )

        } catch (e: Exception) {
            Log.e(TAG, "Extract failed: ${e.message}")
            showManualReviewNotification(text, sourceApp)
        }
    }

    private fun showOpportunityNotification(
        company: String,
        role: String,
        type: String,
        deadline: String,
        stipend: String,
        originalText: String,
    ) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val deadlineStr = if (deadline.isNotBlank()) " · Deadline: $deadline" else ""
        val stipendStr = if (stipend.isNotBlank() && stipend != "Not mentioned") " · $stipend" else ""

        // Deep link intent → opens the extract page pre-filled
        val deepLinkUri = Uri.Builder()
            .scheme("opportunity")
            .authority("extract")
            .appendQueryParameter("text", originalText)
            .build()

        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            Intent(Intent.ACTION_VIEW, deepLinkUri).apply {
                setClass(this@OpportunityNotificationService, MainActivity::class.java)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = Notification.Builder(this, CHANNEL_ID_FOUND)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("🎓 $type found: $company")
            .setContentText("$role$deadlineStr$stipendStr")
            .setStyle(
                Notification.BigTextStyle()
                    .bigText("Role: $role$deadlineStr$stipendStr\n\nTap to review & save →")
            )
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .setVibrate(longArrayOf(0, 250, 100, 250))
            .build()

        nm.notify(System.currentTimeMillis().toInt(), notification)
        Log.i(TAG, "Showed opportunity notification: $company – $role")
    }

    private fun showManualReviewNotification(text: String, sourceApp: String) {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        val appName = when (sourceApp) {
            "com.whatsapp", "com.whatsapp.w4b" -> "WhatsApp"
            "org.telegram.messenger" -> "Telegram"
            else -> "a message"
        }

        val deepLinkUri = Uri.Builder()
            .scheme("opportunity")
            .authority("extract")
            .appendQueryParameter("text", text)
            .build()

        val pendingIntent = PendingIntent.getActivity(
            this,
            System.currentTimeMillis().toInt(),
            Intent(Intent.ACTION_VIEW, deepLinkUri).apply {
                setClass(this@OpportunityNotificationService, MainActivity::class.java)
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP
            },
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE,
        )

        val notification = Notification.Builder(this, CHANNEL_ID_FOUND)
            .setSmallIcon(android.R.drawable.ic_dialog_info)
            .setContentTitle("📋 Opportunity in $appName")
            .setContentText("Tap to extract & save this opportunity")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        nm.notify(System.currentTimeMillis().toInt(), notification)
    }

    private fun createNotificationChannels() {
        val nm = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

        // High-priority channel for found opportunities
        val foundChannel = NotificationChannel(
            CHANNEL_ID_FOUND,
            "Opportunities Found",
            NotificationManager.IMPORTANCE_HIGH,
        ).apply {
            description = "Notifications when an opportunity is detected in your messages"
            enableVibration(true)
            vibrationPattern = longArrayOf(0, 250, 100, 250)
        }

        // Silent channel for the persistent "OpportUnity is watching" notification
        val listeningChannel = NotificationChannel(
            CHANNEL_ID_PERSISTENT,
            "Listening Status",
            NotificationManager.IMPORTANCE_MIN,
        ).apply {
            description = "Background service status"
            setSound(null, null)
        }

        nm.createNotificationChannel(foundChannel)
        nm.createNotificationChannel(listeningChannel)
    }
}
