package com.opportunity.app

import android.annotation.SuppressLint
import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.view.KeyEvent
import android.webkit.JavascriptInterface
import android.webkit.WebChromeClient
import android.webkit.WebResourceRequest
import android.webkit.WebSettings
import android.webkit.WebView
import android.webkit.WebViewClient
import androidx.appcompat.app.AppCompatActivity
import com.opportunity.app.databinding.ActivityMainBinding

class MainActivity : AppCompatActivity() {

    companion object {
        const val WEB_APP_URL = "https://frontend-iota-teal-autcgnqxd4.vercel.app"
    }

    private lateinit var binding: ActivityMainBinding
    private lateinit var webView: WebView

    @SuppressLint("SetJavaScriptEnabled")
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        binding = ActivityMainBinding.inflate(layoutInflater)
        setContentView(binding.root)

        webView = binding.webView
        setupWebView()

        // Start the foreground service to keep notification listener alive
        val serviceIntent = Intent(this, NotificationForegroundService::class.java)
        startForegroundService(serviceIntent)

        // Handle deep link (opportunity://extract?text=...)
        handleDeepLink(intent)
    }

    @SuppressLint("SetJavaScriptEnabled")
    private fun setupWebView() {
        with(webView.settings) {
            javaScriptEnabled = true
            domStorageEnabled = true
            databaseEnabled = true
            setSupportZoom(false)
            builtInZoomControls = false
            displayZoomControls = false
            useWideViewPort = true
            loadWithOverviewMode = true
            mixedContentMode = WebSettings.MIXED_CONTENT_NEVER_ALLOW
            cacheMode = WebSettings.LOAD_DEFAULT
            mediaPlaybackRequiresUserGesture = false
            userAgentString = "${webView.settings.userAgentString} OpportUnityAndroid/1.0"
        }

        // Add JavaScript → Android bridge
        webView.addJavascriptInterface(WebAppInterface(this), "Android")

        webView.webViewClient = object : WebViewClient() {
            override fun shouldOverrideUrlLoading(view: WebView, request: WebResourceRequest): Boolean {
                val url = request.url.toString()
                return when {
                    // Stay inside the app for our domain
                    url.startsWith(WEB_APP_URL) -> false
                    // Open external links in browser
                    url.startsWith("http") -> {
                        startActivity(Intent(Intent.ACTION_VIEW, Uri.parse(url)))
                        true
                    }
                    else -> false
                }
            }

            override fun onPageFinished(view: WebView, url: String) {
                super.onPageFinished(view, url)
                // Inject Android detection so the web app knows it's in the Android shell
                view.evaluateJavascript(
                    "window.__ANDROID_APP__ = true; window.__APP_VERSION__ = '1.0';",
                    null
                )
            }
        }

        webView.webChromeClient = WebChromeClient()
        webView.loadUrl(WEB_APP_URL)
    }

    override fun onNewIntent(intent: Intent) {
        super.onNewIntent(intent)
        handleDeepLink(intent)
    }

    private fun handleDeepLink(intent: Intent?) {
        val data = intent?.data ?: return
        if (data.scheme == "opportunity" && data.host == "extract") {
            val text = data.getQueryParameter("text") ?: return
            val encoded = Uri.encode(text)
            val targetUrl = "$WEB_APP_URL/extract?text=$encoded"
            webView.loadUrl(targetUrl)
        }
    }

    override fun onKeyDown(keyCode: Int, event: KeyEvent?): Boolean {
        if (keyCode == KeyEvent.KEYCODE_BACK && webView.canGoBack()) {
            webView.goBack()
            return true
        }
        return super.onKeyDown(keyCode, event)
    }

    override fun onResume() {
        super.onResume()
        webView.onResume()
    }

    override fun onPause() {
        webView.onPause()
        super.onPause()
    }
}
