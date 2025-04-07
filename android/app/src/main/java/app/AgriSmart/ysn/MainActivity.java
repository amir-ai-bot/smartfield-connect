package app.AgriSmart.ysn;

import android.os.Bundle;
import android.os.Handler;
import android.os.Looper;
import android.view.View;
import android.webkit.WebView;
import android.webkit.WebSettings;
import android.webkit.WebViewClient;
import android.util.Log;
import android.widget.FrameLayout;
import android.widget.Toast;

import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    private static final String TAG = "MainActivity";
    private static final int LOAD_TIMEOUT_MS = 15000; // 15 seconds timeout
    
    private FrameLayout loadingLayout;
    private Handler timeoutHandler;
    private boolean pageLoaded = false;

    @Override
    public void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Find the loading layout
        loadingLayout = findViewById(R.id.loading_layout);
        
        // Set up timeout handler
        timeoutHandler = new Handler(Looper.getMainLooper());
        timeoutHandler.postDelayed(new Runnable() {
            @Override
            public void run() {
                if (!pageLoaded) {
                    Log.e(TAG, "Page load timeout");
                    runOnUiThread(new Runnable() {
                        @Override
                        public void run() {
                            Toast.makeText(MainActivity.this, 
                                "Chargement lent. Réessayer plus tard.", 
                                Toast.LENGTH_LONG).show();
                            
                            // Keep the loading indicator visible but will let the user
                            // continue to use the app even if not fully loaded
                        }
                    });
                }
            }
        }, LOAD_TIMEOUT_MS);
        
        // After WebView is initialized
        WebView webView = getBridge().getWebView();
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                Log.d(TAG, "Page loaded: " + url);
                
                // Hide loading after page is fully loaded
                pageLoaded = true;
                timeoutHandler.removeCallbacksAndMessages(null);
                
                // Small delay to ensure JS has initialized properly
                new Handler(Looper.getMainLooper()).postDelayed(new Runnable() {
                    @Override
                    public void run() {
                        if (loadingLayout != null) {
                            loadingLayout.setVisibility(View.GONE);
                        }
                    }
                }, 500);
            }
            
            @Override
            public void onReceivedError(WebView view, int errorCode, String description, String failingUrl) {
                super.onReceivedError(view, errorCode, description, failingUrl);
                Log.e(TAG, "WebView error: " + description + " (code: " + errorCode + ")");
                
                // Show error toast
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        Toast.makeText(MainActivity.this, 
                            "Erreur de chargement: " + description, 
                            Toast.LENGTH_LONG).show();
                    }
                });
            }
        });
        
        // Configure WebView settings for better performance
        WebSettings settings = webView.getSettings();
        settings.setDomStorageEnabled(true);
        settings.setAppCacheEnabled(true);
        settings.setCacheMode(WebSettings.LOAD_DEFAULT);
        
        // Handle conversation page loading issues with JavaScript
        webView.evaluateJavascript(
            "(function() {" +
                "window.addEventListener('load', function() {" +
                    "console.log('Page fully loaded');" +
                    "if (window.location.href.includes('conversations/')) {" +
                        "// Check if we're on a conversation page and add auto-retry" +
                        "let checkLoading = setInterval(function() {" +
                            "const loadingElement = document.querySelector('.loading-indicator');" +
                            "if (loadingElement && loadingElement.style.display !== 'none') {" +
                                "console.log('Conversation still loading after delay - refreshing');" +
                                "window.location.reload();" +
                                "clearInterval(checkLoading);" +
                            "}" +
                        "}, 8000);" +
                    "}" +
                "});" +
            "})();", 
            null
        );
    }
    
    @Override
    protected void onDestroy() {
        // Clean up resources
        if (timeoutHandler != null) {
            timeoutHandler.removeCallbacksAndMessages(null);
        }
        super.onDestroy();
    }
}
