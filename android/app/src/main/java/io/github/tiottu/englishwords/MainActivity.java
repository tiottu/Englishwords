package io.github.tiottu.englishwords;

// 단어 친구들 안드로이드 앱: 폰의 웹뷰로 게임 사이트를 열고, 발음은 폰의 음성 엔진(TextToSpeech)으로 직접 읽는다.
// (웹뷰에는 브라우저의 speechSynthesis 가 없어서, 자바스크립트에서 AndroidTTS.speak("word") 로 부른다.)
// 게임 내용은 사이트에서 받아 오므로, 게임을 고쳐서 사이트에 올리면 앱을 다시 깔지 않아도 새 버전이 된다.

import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.provider.Settings;
import android.speech.tts.TextToSpeech;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

import java.util.Locale;

public class MainActivity extends Activity {
    static final String SITE = "https://tiottu.github.io/Englishwords/";
    static final String HOST = "tiottu.github.io";
    WebView web;
    TextToSpeech tts;
    volatile boolean ttsInit = false;
    volatile String ttsState = "notready"; // ok | notready | noengine | nodata | notsupported

    // 영어 목소리 준비 상태를 확인한다 (설정에서 음성 데이터를 설치한 뒤에도 다시 확인할 수 있게 매번 부른다)
    void checkLang() {
        if (tts == null || !ttsInit) return;
        int r = tts.setLanguage(Locale.US);
        if (r < 0) {
            int r2 = tts.setLanguage(Locale.ENGLISH);
            if (r2 >= 0) r = r2;
        }
        if (r >= 0) { ttsState = "ok"; tts.setSpeechRate(0.9f); }
        else ttsState = (r == TextToSpeech.LANG_MISSING_DATA) ? "nodata" : "notsupported";
    }

    class Bridge {
        @JavascriptInterface
        public String speak(String text) {
            if (tts == null) return "noengine";
            if (!ttsInit) return ttsState;
            if (!"ok".equals(ttsState)) checkLang();
            if (!"ok".equals(ttsState)) return ttsState;
            tts.speak(text, TextToSpeech.QUEUE_FLUSH, null, "wd");
            return "ok";
        }

        @JavascriptInterface
        public String status() {
            if (ttsInit && !"ok".equals(ttsState)) checkLang();
            return ttsState;
        }

        @JavascriptInterface
        public void openTtsSettings() {
            runOnUiThread(new Runnable() {
                public void run() {
                    try { startActivity(new Intent("com.android.settings.TTS_SETTINGS")); }
                    catch (Exception e) {
                        try { startActivity(new Intent(Settings.ACTION_SETTINGS)); } catch (Exception e2) { /* 열 수 없으면 그냥 둔다 */ }
                    }
                }
            });
        }
    }

    @Override
    protected void onCreate(Bundle saved) {
        super.onCreate(saved);
        requestWindowFeature(Window.FEATURE_NO_TITLE);
        Window w = getWindow();
        w.setStatusBarColor(Color.parseColor("#ff8a3d"));

        tts = new TextToSpeech(this, new TextToSpeech.OnInitListener() {
            @Override
            public void onInit(int status) {
                if (status != TextToSpeech.SUCCESS) { ttsState = "noengine"; return; }
                ttsInit = true;
                checkLang();
            }
        });

        web = new WebView(this);
        web.setBackgroundColor(Color.parseColor("#fff7e0"));
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);           // 외운 단어 기록 (localStorage)
        s.setDatabaseEnabled(true);
        s.setMediaPlaybackRequiresUserGesture(false); // 효과음
        s.setCacheMode(WebSettings.LOAD_DEFAULT);
        s.setTextZoom(100);                     // 폰 글자 크기 설정과 상관없이 화면이 깨지지 않게
        s.setUserAgentString(s.getUserAgentString() + " WordFriendsApp");
        web.addJavascriptInterface(new Bridge(), "AndroidTTS");

        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest req) {
                Uri u = req.getUrl();
                if (HOST.equals(u.getHost())) return false; // 게임 안은 앱에서
                try { startActivity(new Intent(Intent.ACTION_VIEW, u)); } catch (Exception e) { /* 열 앱이 없으면 그냥 둔다 */ }
                return true;
            }

            @Override
            public void onReceivedError(WebView view, WebResourceRequest req, WebResourceError err) {
                if (!req.isForMainFrame()) return;
                view.loadDataWithBaseURL(null,
                    "<html><body style='font-family:sans-serif;background:#fff7e0;color:#4a3b2a;text-align:center;padding:40px 20px'>"
                    + "<div style='font-size:48px'>📶</div><h2>인터넷이 연결되지 않았어요</h2>"
                    + "<p>와이파이나 데이터를 켜고 아래 버튼을 눌러 주세요.</p>"
                    + "<button style='font-size:20px;padding:12px 24px;border:none;border-radius:16px;background:#ff8a3d;color:#fff' "
                    + "onclick=\"location.href='" + SITE + "'\">다시 해 보기</button></body></html>",
                    "text/html", "utf-8", null);
            }
        });

        setContentView(web);
        if (saved != null) web.restoreState(saved);
        else web.loadUrl(SITE);
    }

    @Override
    protected void onSaveInstanceState(Bundle out) {
        super.onSaveInstanceState(out);
        web.saveState(out);
    }

    @Override
    public void onBackPressed() {
        if (web.canGoBack()) web.goBack();
        else super.onBackPressed();
    }

    @Override
    protected void onPause() { super.onPause(); web.onPause(); }

    @Override
    protected void onResume() { super.onResume(); web.onResume(); }

    @Override
    protected void onDestroy() {
        if (tts != null) { tts.stop(); tts.shutdown(); }
        super.onDestroy();
    }
}
