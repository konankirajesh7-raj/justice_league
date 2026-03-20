# OpportUnity — Android App

Native Android wrapper for the [OpportUnity web app](https://frontend-iota-teal-autcgnqxd4.vercel.app) with **automatic WhatsApp opportunity extraction**.

## How It Works

```
WhatsApp notification arrives
       ↓
OpportunityNotificationService reads it
       ↓
Keyword detection (internship, deadline, apply, etc.)
       ↓
Calls /api/extract  →  Groq AI extracts details
       ↓
Android notification: "🎓 TCS found: Software Developer Intern · Deadline: 2025-04-30"
       ↓
Tap notification → App opens pre-filled with extracted data → Save with one tap
```

## Requirements

| Tool | Version |
|------|---------|
| Android Studio | Hedgehog (2023.1.1) or newer |
| JDK | 17 (bundled with Android Studio) |
| Android SDK | API 26+ (Android 8.0+) |
| Gradle | 8.2 (auto-downloaded) |

## Setup in Android Studio

### 1. Open the Project

1. Open **Android Studio**
2. Click **File → Open**
3. Navigate to `e:\OneDrive\Desktop\opportunity\android`
4. Click **OK** — Gradle will sync automatically (takes ~2 min first time)

### 2. Build & Run on Emulator

1. Click **Device Manager** (right sidebar) → **Create Device**
2. Choose **Pixel 7** → Next → **API 34 (Android 14)** → Download if needed → Finish
3. Select the emulator in the toolbar dropdown
4. Press **▶ Run** (Shift+F10)

### 3. Build & Run on Real Device

1. On your Android phone: **Settings → About Phone → tap "Build Number" 7 times** (enables Developer Options)
2. **Settings → Developer Options → USB Debugging: ON**
3. Connect phone via USB, select **File Transfer** mode
4. Phone appears in Android Studio toolbar — press **▶ Run**

### 4. Grant Notification Access (Required!)

When the app opens for the first time:
1. A dialog appears: **"Enable Notification Access"**
2. Tap **Open Settings**
3. Find **OpportUnity** in the list → Toggle **ON**
4. Confirm the warning dialog (this is safe — the app only reads notifications to extract opportunities)

> ⚠️ **Without this permission, auto-extraction won't work.** You can still use the app manually.

### 5. Test Notification Extraction

1. Open WhatsApp (or use an emulator)
2. Send yourself a message like:
   ```
   🚀 TCS is hiring Software Developer Interns!
   Stipend: ₹15,000/month | Deadline: April 30, 2025
   Eligible: CSE/IT/ECE | CGPA ≥ 7.5
   Apply: https://tcs.com/careers/apply
   ```
3. → OpportUnity notification appears within seconds
4. Tap → Extracted card opens → Hit **Save**

## Build a Release APK

1. **Build → Generate Signed Bundle / APK**
2. Choose **APK** → Next
3. Create a new keystore (save the password safely!)
4. Choose **release** build variant → Finish
5. APK will be at: `android/app/release/app-release.apk`

## Architecture

```
android/
├── app/src/main/
│   ├── AndroidManifest.xml          ← permissions + service declarations
│   ├── java/com/opportunity/app/
│   │   ├── SplashActivity.kt        ← splash + permission check
│   │   ├── MainActivity.kt          ← WebView hosting the web app
│   │   ├── OpportunityNotificationService.kt  ← reads WhatsApp, calls AI
│   │   ├── NotificationForegroundService.kt   ← keeps listener alive
│   │   ├── WebAppInterface.kt       ← JS → Android bridge
│   │   ├── NotificationPermissionHelper.kt
│   │   └── BootReceiver.kt          ← restarts after device reboot
│   └── res/
│       ├── layout/activity_main.xml    ← full-screen WebView
│       ├── layout/activity_splash.xml  ← splash screen
│       ├── values/strings.xml
│       ├── values/colors.xml
│       ├── values/themes.xml
│       ├── drawable/ic_launcher_foreground.xml
│       └── xml/notification_listener.xml
```

## Supported Apps

The notification listener watches these apps by default (edit `WATCHED_PACKAGES` in `OpportunityNotificationService.kt` to add more):

- WhatsApp (`com.whatsapp`)
- WhatsApp Business (`com.whatsapp.w4b`)
- Telegram (`org.telegram.messenger`)
- GB WhatsApp (`com.gbwhatsapp`)

## Troubleshooting

| Issue | Fix |
|-------|-----|
| Gradle sync fails | File → Invalidate Caches → Restart |
| App crashes on launch | Check Logcat tab for error; usually Gradle JDK mismatch |
| No opportunity notifications | Check Settings → Apps → Special App Access → Notification Access → OpportUnity is ON |
| Notifications appear but extraction fails | Check internet access (emulator needs Google APIs image) |
| App killed in background | Phone settings → Battery → OpportUnity → No Restrictions |

## Environment Variables

The app calls your production Vercel URL (`https://frontend-iota-teal-autcgnqxd4.vercel.app/api/extract`). No local env vars needed for the Android app. The API key is stored securely in Vercel.

To point to a different backend, edit `EXTRACT_API_URL` in `OpportunityNotificationService.kt`.
