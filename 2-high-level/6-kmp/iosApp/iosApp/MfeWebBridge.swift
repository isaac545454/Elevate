import SwiftUI
import WebKit
import Shared

final class MfeWebBridge: NSObject, ObservableObject, WKNavigationDelegate, WKScriptMessageHandler {
    let webView: WKWebView
    @Published var activeSlug: String = MfeCatalog.shared.defaultMfe.slug
    @Published var loadError: String?
    @Published var isLoading = true
    private var urlIndex = 0
    private var didRetryFallback = false
    private let assetProxy: ElevateAssetProxy

    private var shellUrls: [String] {
        let arr = MfeCatalog.shared.allShellUrls()
        return (0..<Int(arr.size)).compactMap { arr.get(index: Int32($0)) as? String }
    }

    override init() {
        let assetProxy = ElevateAssetProxy()
        self.assetProxy = assetProxy
        let controller = WKUserContentController()
        controller.addUserScript(
            WKUserScript(
                source: MfeWebBridge.apiProxyScript,
                injectionTime: .atDocumentStart,
                forMainFrameOnly: false
            )
        )
        let config = WKWebViewConfiguration()
        config.userContentController = controller
        config.defaultWebpagePreferences.allowsContentJavaScript = true
        config.defaultWebpagePreferences.preferredContentMode = .mobile
        config.setURLSchemeHandler(assetProxy, forURLScheme: ElevateAssetProxy.scheme)
        webView = WKWebView(frame: .zero, configuration: config)
        super.init()
        controller.add(self, name: NativeBridgeJs.shared.HANDLER_NAME)
        webView.navigationDelegate = self
        webView.customUserAgent =
            "Mozilla/5.0 (iPhone; CPU iPhone OS 18_2 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.2 Mobile/15E148 Safari/604.1"
        if #available(iOS 16.4, *) {
            webView.isInspectable = true
        }
    }

    /// fetch JSON → Vite `/__proxy`. img → fetch + blob (WKWebView não pinta img HTTP/HTTPS daqui).
    private static let apiProxyScript = """
    (function () {
      var fetchMap = [
        ['https://pokeapi.co', '/__proxy/pokeapi'],
        ['https://jsonplaceholder.typicode.com', '/__proxy/jsonplaceholder'],
        ['https://rickandmortyapi.com', '/__proxy/rick'],
        ['https://picsum.photos', '/__proxy/picsum'],
        ['https://fastly.picsum.photos', '/__proxy/picsum'],
        ['https://i.picsum.photos', '/__proxy/picsum'],
        ['https://raw.githubusercontent.com', '/__proxy/ghraw'],
        ['https://fonts.googleapis.com', '/__proxy/fonts'],
        ['https://fonts.gstatic.com', '/__proxy/gstatic']
      ];
      function stripOrigin(url) {
        try {
          if (location && location.origin && url.indexOf(location.origin) === 0) {
            return url.slice(location.origin.length);
          }
        } catch (e) {}
        return url;
      }
      function rewriteFetch(url) {
        if (!url || typeof url !== 'string') return url;
        if (url.indexOf('blob:') === 0 || url.indexOf('data:') === 0) return url;
        var path = stripOrigin(url);
        if (path.indexOf('/__proxy/') === 0) return location.origin + path;
        for (var i = 0; i < fetchMap.length; i++) {
          if (url.indexOf(fetchMap[i][0]) === 0) {
            return location.origin + fetchMap[i][1] + url.slice(fetchMap[i][0].length);
          }
        }
        return url;
      }
      var origFetch = window.fetch;
      window.fetch = function (input, init) {
        if (typeof input === 'string') return origFetch.call(this, rewriteFetch(input), init);
        if (input && typeof Request !== 'undefined' && input instanceof Request) {
          var next = rewriteFetch(input.url);
          if (next !== input.url) return origFetch.call(this, new Request(next, input), init);
        }
        return origFetch.call(this, input, init);
      };
      var origSetAttr = Element.prototype.setAttribute;
      var blobCache = Object.create(null);
      function hydrateImg(el) {
        if (!el || !el.getAttribute) return;
        var raw = el.getAttribute('src');
        if (!raw || raw.indexOf('blob:') === 0 || raw.indexOf('data:') === 0) return;
        var fetchUrl = rewriteFetch(raw);
        if (!fetchUrl || fetchUrl.indexOf('/__proxy/') === -1) return;
        if (el.__elevateHydrated === fetchUrl) return;
        el.__elevateHydrated = fetchUrl;
        if (blobCache[fetchUrl]) {
          origSetAttr.call(el, 'src', blobCache[fetchUrl]);
          return;
        }
        origFetch.call(window, fetchUrl).then(function (res) {
          if (!res.ok) throw new Error(String(res.status));
          return res.blob();
        }).then(function (blob) {
          var u = URL.createObjectURL(blob);
          blobCache[fetchUrl] = u;
          origSetAttr.call(el, 'src', u);
        }).catch(function () {
          el.__elevateHydrated = '';
        });
      }
      function injectNativeCss(shadow) {
        if (!shadow || shadow.__elevateCss) return;
        shadow.__elevateCss = true;
        try {
          var s = document.createElement('style');
          s.textContent = ':host{display:block;width:100%;max-width:100%;box-sizing:border-box}[data-mfe-mount]{display:block;width:100%}.mfe-panel{width:100%!important;max-width:100%!important;box-sizing:border-box;margin:0 auto}.mfe-panel__header{text-align:center}.mfe-panel__grid{grid-template-columns:1fr!important;width:100%;justify-items:stretch}.mfe-item{width:100%!important}';
          shadow.appendChild(s);
        } catch (e) {}
      }
      function scan(root) {
        if (!root || !root.querySelectorAll) return;
        try { root.querySelectorAll('img').forEach(hydrateImg); } catch (e) {}
        try {
          root.querySelectorAll('*').forEach(function (node) {
            if (node.shadowRoot) {
              injectNativeCss(node.shadowRoot);
              scan(node.shadowRoot);
              observe(node.shadowRoot);
            }
          });
        } catch (e) {}
      }
      function observe(root) {
        if (!root || root.__elevateObserved) return;
        root.__elevateObserved = true;
        injectNativeCss(root);
        try {
          var mo = new MutationObserver(function (records) {
            records.forEach(function (rec) {
              if (rec.type === 'attributes' && rec.target && rec.target.tagName === 'IMG') {
                hydrateImg(rec.target);
              }
              if (!rec.addedNodes) return;
              rec.addedNodes.forEach(function (node) {
                if (node.nodeType !== 1) return;
                if (node.tagName === 'IMG') hydrateImg(node);
                scan(node);
              });
            });
          });
          mo.observe(root, { childList: true, subtree: true, attributes: true, attributeFilter: ['src'] });
        } catch (e) {}
      }
      try {
        var origAttach = Element.prototype.attachShadow;
        Element.prototype.attachShadow = function (init) {
          var shadow = origAttach.call(this, init);
          observe(shadow);
          return shadow;
        };
      } catch (e) {}
      window.__elevateHydrateImgs = function () { scan(document); };
      function boot() {
        observe(document.documentElement);
        scan(document);
      }
      if (document.documentElement) boot();
      else document.addEventListener('DOMContentLoaded', boot);
      setInterval(function () { scan(document); }, 700);
    })();
    """

    deinit {
        webView.configuration.userContentController.removeScriptMessageHandler(
            forName: NativeBridgeJs.shared.HANDLER_NAME
        )
    }

    func reloadShell() {
        urlIndex = 0
        didRetryFallback = false
        loadCurrent()
    }

    private func loadCurrent() {
        loadError = nil
        isLoading = true
        let raw = shellUrls.indices.contains(urlIndex) ? shellUrls[urlIndex] : MfeCatalog.shared.SHELL_URL
        guard let url = URL(string: raw) else { return }
        webView.load(URLRequest(url: url, cachePolicy: .reloadIgnoringLocalCacheData, timeoutInterval: 8))
    }

    private func retryOrFail(_ error: Error) {
        let ns = error as NSError
        if ns.domain == NSURLErrorDomain && ns.code == NSURLErrorCancelled { return }
        if urlIndex + 1 < shellUrls.count {
            urlIndex += 1
            didRetryFallback = true
            loadCurrent()
            return
        }
        isLoading = false
        loadError = error.localizedDescription
    }

    func emitNav(slug: String) {
        activeSlug = slug
        webView.evaluateJavaScript(NativeBridgeJs.shared.emitNavCall(slug: slug), completionHandler: nil)
    }

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == NativeBridgeJs.shared.HANDLER_NAME else { return }
        let body: Data?
        if let text = message.body as? String {
            body = text.data(using: .utf8)
        } else if JSONSerialization.isValidJSONObject(message.body),
                  let data = try? JSONSerialization.data(withJSONObject: message.body) {
            body = data
        } else {
            body = nil
        }
        guard let body,
              let json = try? JSONSerialization.jsonObject(with: body) as? [String: Any],
              let type = json["type"] as? String else { return }

        if type == "nav",
           let payload = json["payload"] as? [String: Any],
           let mfeId = payload["mfeId"] as? String {
            DispatchQueue.main.async { self.activeSlug = mfeId }
        }
        if type == "ready" {
            DispatchQueue.main.async {
                self.loadError = nil
                self.isLoading = false
            }
        }
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        verifyShell(attemptsLeft: 10)
        for delay in [0.4, 1.0, 2.0, 3.5] as [Double] {
            DispatchQueue.main.asyncAfter(deadline: .now() + delay) {
                webView.evaluateJavaScript("window.__elevateHydrateImgs && window.__elevateHydrateImgs()")
            }
        }
    }

    private func verifyShell(attemptsLeft: Int) {
        webView.evaluateJavaScript("!!document.querySelector('.shell')") { result, _ in
            DispatchQueue.main.async {
                if result as? Bool == true {
                    self.loadError = nil
                    self.isLoading = false
                    return
                }
                if attemptsLeft > 0 {
                    DispatchQueue.main.asyncAfter(deadline: .now() + 0.35) {
                        self.verifyShell(attemptsLeft: attemptsLeft - 1)
                    }
                    return
                }
                self.retryOrFail(
                    NSError(
                        domain: "MfeWebBridge",
                        code: 1,
                        userInfo: [NSLocalizedDescriptionKey: "Resposta em \(self.webView.url?.absoluteString ?? "?") não é o 5-mfe-partial"]
                    )
                )
            }
        }
    }

    func webView(_ webView: WKWebView, didFail navigation: WKNavigation!, withError error: Error) {
        retryOrFail(error)
    }

    func webView(_ webView: WKWebView, didFailProvisionalNavigation navigation: WKNavigation!, withError error: Error) {
        retryOrFail(error)
    }
}

final class ElevateAssetProxy: NSObject, WKURLSchemeHandler {
    static let scheme = "elevate-proxy"

    private static let upstream: [String: String] = [
        "picsum": "https://picsum.photos",
        "ghraw": "https://raw.githubusercontent.com",
        "rick": "https://rickandmortyapi.com",
        "pokeapi": "https://pokeapi.co",
        "jsonplaceholder": "https://jsonplaceholder.typicode.com",
        "fonts": "https://fonts.googleapis.com",
        "gstatic": "https://fonts.gstatic.com",
    ]

    private let lock = NSLock()
    private var stopped = Set<ObjectIdentifier>()

    func webView(_ webView: WKWebView, start urlSchemeTask: WKURLSchemeTask) {
        let id = ObjectIdentifier(urlSchemeTask)
        print("[ElevateAssetProxy] \(urlSchemeTask.request.url?.absoluteString ?? "?")")
        guard let reqURL = urlSchemeTask.request.url,
              let host = reqURL.host,
              let base = Self.upstream[host],
              let target = URL(string: base + reqURL.path + (reqURL.query.map { "?\($0)" } ?? ""))
        else {
            urlSchemeTask.didFailWithError(URLError(.badURL))
            return
        }

        var request = URLRequest(url: target)
        request.setValue("ElevateNativeProxy/1.0", forHTTPHeaderField: "User-Agent")
        request.setValue("*/*", forHTTPHeaderField: "Accept")

        URLSession.shared.dataTask(with: request) { [weak self] data, response, error in
            DispatchQueue.main.async {
                guard let self else { return }
                self.lock.lock()
                let cancelled = self.stopped.contains(id)
                self.lock.unlock()
                if cancelled { return }

                if let error {
                    urlSchemeTask.didFailWithError(error)
                    return
                }
                guard let data else {
                    urlSchemeTask.didFailWithError(URLError(.badServerResponse))
                    return
                }

                let status = (response as? HTTPURLResponse)?.statusCode ?? 200
                var headers: [String: String] = [
                    "Access-Control-Allow-Origin": "*",
                    "Content-Length": String(data.count),
                    "Cache-Control": "public, max-age=3600",
                ]
                if let type = (response as? HTTPURLResponse)?.value(forHTTPHeaderField: "Content-Type")
                    ?? response?.mimeType {
                    headers["Content-Type"] = type
                } else if data.prefix(2) == Data([0xFF, 0xD8]) {
                    headers["Content-Type"] = "image/jpeg"
                } else if data.prefix(2) == Data([0x89, 0x50]) {
                    headers["Content-Type"] = "image/png"
                }

                guard let http = HTTPURLResponse(
                    url: reqURL,
                    statusCode: status,
                    httpVersion: "HTTP/1.1",
                    headerFields: headers
                ) else {
                    urlSchemeTask.didFailWithError(URLError(.badServerResponse))
                    return
                }
                urlSchemeTask.didReceive(http)
                urlSchemeTask.didReceive(data)
                urlSchemeTask.didFinish()
            }
        }.resume()
    }

    func webView(_ webView: WKWebView, stop urlSchemeTask: WKURLSchemeTask) {
        lock.lock()
        stopped.insert(ObjectIdentifier(urlSchemeTask))
        lock.unlock()
    }
}

final class WebViewBox: UIView {
    var onFirstLayout: (() -> Void)?
    private var didFire = false

    override func layoutSubviews() {
        super.layoutSubviews()
        guard bounds.width > 8, !didFire else { return }
        didFire = true
        onFirstLayout?()
    }
}

struct MfeWebView: UIViewRepresentable {
    let webView: WKWebView
    var onFirstLayout: () -> Void

    func makeUIView(context: Context) -> WebViewBox {
        let box = WebViewBox()
        box.backgroundColor = .clear
        box.onFirstLayout = onFirstLayout
        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.scrollView.contentInsetAdjustmentBehavior = .never
        webView.scrollView.contentInset = .zero
        webView.backgroundColor = .clear
        webView.isOpaque = false
        if webView.superview !== box {
            webView.removeFromSuperview()
            box.addSubview(webView)
        }
        NSLayoutConstraint.activate([
            webView.topAnchor.constraint(equalTo: box.topAnchor),
            webView.bottomAnchor.constraint(equalTo: box.bottomAnchor),
            webView.leadingAnchor.constraint(equalTo: box.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: box.trailingAnchor),
        ])
        return box
    }

    func updateUIView(_ uiView: WebViewBox, context: Context) {
        uiView.onFirstLayout = onFirstLayout
    }

    func sizeThatFits(_ proposal: ProposedViewSize, uiView: WebViewBox, context: Context) -> CGSize {
        let fallback = UIScreen.main.bounds
        return CGSize(
            width: proposal.width ?? fallback.width,
            height: proposal.height ?? fallback.height
        )
    }
}
