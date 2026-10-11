import SwiftUI
import Shared

struct ContentView: View {
    @StateObject private var bridge = MfeWebBridge()
    @State private var sidebarOpen = false
    private let links: [MfeLink] = {
        let arr = MfeCatalog.shared.allLinks()
        return (0..<Int(arr.size)).compactMap { arr.get(index: Int32($0)) as? MfeLink }
    }()
    private let platform = Greeting().greet()

    var body: some View {
        ZStack {
                MfeWebView(webView: bridge.webView, onFirstLayout: bridge.reloadShell)
                    .frame(maxWidth: .infinity, maxHeight: .infinity)
                    .allowsHitTesting(!sidebarOpen)

            if let error = bridge.loadError {
                errorOverlay(error)
            } else if bridge.isLoading {
                ProgressView("Carregando 5-mfe-partial…")
                    .padding()
                    .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 12))
            }

            if !sidebarOpen {
                menuButton
                    .padding(.leading, 12)
                    .padding(.top, 12)
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .topLeading)
            }

            if sidebarOpen {
                Color.black.opacity(0.4)
                    .ignoresSafeArea()
                    .contentShape(Rectangle())
                    .onTapGesture { closeSidebar() }

                sidebar
                    .frame(maxWidth: .infinity, maxHeight: .infinity, alignment: .leading)
                    .transition(.move(edge: .leading))
            }
        }
        .animation(.easeInOut(duration: 0.22), value: sidebarOpen)
        .ignoresSafeArea(edges: .bottom)
    }

    private var menuButton: some View {
        Button {
            sidebarOpen = true
        } label: {
            Image(systemName: "line.3.horizontal")
                .font(.title3.weight(.semibold))
                .foregroundStyle(.white)
                .frame(width: 40, height: 40)
                .background(Color(red: 30 / 255, green: 41 / 255, blue: 59 / 255), in: Circle())
                .shadow(radius: 4, y: 2)
        }
        .accessibilityLabel("Abrir menu")
    }

    private var sidebar: some View {
        VStack(alignment: .leading, spacing: 8) {
            HStack {
                Text("Elevate")
                    .font(.headline)
                    .foregroundStyle(.white)
                Spacer()
                Button {
                    closeSidebar()
                } label: {
                    Image(systemName: "xmark")
                        .font(.body.weight(.bold))
                        .foregroundStyle(Color(white: 0.9))
                        .frame(width: 36, height: 36)
                        .background(Color.white.opacity(0.15), in: Circle())
                }
                .buttonStyle(.plain)
                .accessibilityLabel("Fechar menu")
            }
            .padding(.bottom, 8)

            ForEach(links, id: \.slug) { link in
                Button {
                    bridge.emitNav(slug: link.slug)
                    closeSidebar()
                } label: {
                    HStack(spacing: 10) {
                        Circle()
                            .fill(Color(hex: link.accentHex))
                            .frame(width: 8, height: 8)
                        Text(link.label)
                            .font(.subheadline.weight(.semibold))
                            .multilineTextAlignment(.leading)
                        Spacer(minLength: 0)
                    }
                    .padding(.horizontal, 10)
                    .padding(.vertical, 10)
                    .background(
                        RoundedRectangle(cornerRadius: 8)
                            .fill(bridge.activeSlug == link.slug ? Color.white.opacity(0.12) : .clear)
                    )
                    .overlay(alignment: .leading) {
                        if bridge.activeSlug == link.slug {
                            Capsule()
                                .fill(Color(hex: link.accentHex))
                                .frame(width: 3)
                        }
                    }
                }
                .buttonStyle(.plain)
                .foregroundStyle(bridge.activeSlug == link.slug ? Color.white : Color(white: 0.8))
            }

            Spacer()

            Button("Recarregar") { bridge.reloadShell() }
                .font(.caption.weight(.semibold))
                .foregroundStyle(Color(white: 0.7))

            Text(platform)
                .font(.caption2)
                .foregroundStyle(Color(white: 0.45))
                .fixedSize(horizontal: false, vertical: true)
        }
        .padding(12)
        .padding(.top, 8)
        .safeAreaPadding(.top)
        .frame(width: 228, alignment: .leading)
        .frame(maxHeight: .infinity)
        .background(Color(red: 30 / 255, green: 41 / 255, blue: 59 / 255))
        .ignoresSafeArea(edges: .bottom)
    }

    private func closeSidebar() {
        sidebarOpen = false
    }

    private func errorOverlay(_ message: String) -> some View {
        VStack(spacing: 12) {
            Text("Shell JS offline")
                .font(.headline)
            Text("Suba o 5-mfe-partial (`npm run dev`) em :5000–5003.")
                .font(.subheadline)
                .multilineTextAlignment(.center)
                .foregroundStyle(.secondary)
            Text(message)
                .font(.caption)
                .foregroundStyle(.red)
                .multilineTextAlignment(.center)
            Button("Tentar de novo") { bridge.reloadShell() }
                .buttonStyle(.borderedProminent)
        }
        .padding(24)
        .frame(maxWidth: 360)
        .background(.ultraThinMaterial, in: RoundedRectangle(cornerRadius: 16))
    }
}

private extension Color {
    init(hex: String) {
        let cleaned = hex.trimmingCharacters(in: CharacterSet.alphanumerics.inverted)
        var value: UInt64 = 0
        Scanner(string: cleaned).scanHexInt64(&value)
        self.init(
            red: Double((value >> 16) & 0xFF) / 255,
            green: Double((value >> 8) & 0xFF) / 255,
            blue: Double(value & 0xFF) / 255
        )
    }
}

#Preview {
    ContentView()
}
