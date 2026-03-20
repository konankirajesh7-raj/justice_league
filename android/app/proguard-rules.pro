# Default ProGuard rules for Android app
-keep class com.opportunity.app.** { *; }
-keepclassmembers class com.opportunity.app.WebAppInterface {
    @android.webkit.JavascriptInterface <methods>;
}
-dontwarn okhttp3.**
-keep class okhttp3.** { *; }
