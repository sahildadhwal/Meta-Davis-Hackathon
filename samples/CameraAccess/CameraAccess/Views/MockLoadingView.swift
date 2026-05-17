import SwiftUI

private let allProduce: [(emoji: String, key: String)] = [
    ("🍌", "banana"), ("🍊", "orange"), ("🥑", "avocado"), ("🍇", "grapes"), ("🍅", "tomato")
]

private let scattered: [(x: CGFloat, y: CGFloat, idx: Int)] = [
    (0.08, 0.10, 0), (0.80, 0.08, 1), (0.05, 0.42, 2),
    (0.88, 0.35, 3), (0.15, 0.72, 4), (0.82, 0.68, 0),
    (0.42, 0.06, 1), (0.50, 0.88, 2), (0.28, 0.52, 3),
    (0.68, 0.48, 4), (0.35, 0.22, 0), (0.62, 0.80, 1),
    (0.55, 0.30, 2), (0.20, 0.88, 3), (0.75, 0.18, 4),
]

struct MockLoadingView: View {
    let agriVM: AgriLensViewModel
    @State private var pulse = false
    @State private var dotCount = 1
    @State private var dotTimer: Timer?

    var body: some View {
        ZStack {
            Color.white.ignoresSafeArea()

            GeometryReader { geo in
                ForEach(0..<scattered.count, id: \.self) { i in
                    Text(allProduce[scattered[i].idx].emoji)
                        .font(.system(size: 44))
                        .opacity(0.05)
                        .position(x: geo.size.width * scattered[i].x,
                                  y: geo.size.height * scattered[i].y)
                        .scaleEffect(pulse ? 1.04 : 0.96)
                        .animation(.easeInOut(duration: 1.6).repeatForever(autoreverses: true).delay(Double(i) * 0.09), value: pulse)
                }
            }

            VStack(spacing: 0) {
                Spacer()

                VStack(spacing: 18) {
                    ZStack {
                        Circle().stroke(Color.blue.opacity(0.08), lineWidth: 3).frame(width: 100, height: 100)
                        Circle().stroke(Color.blue.opacity(0.15), lineWidth: 2).frame(width: 72, height: 72)
                        Image(systemName: "camera.viewfinder")
                            .font(.system(size: 36))
                            .foregroundStyle(Color.blue.opacity(0.45))
                            .scaleEffect(pulse ? 1.08 : 0.92)
                            .animation(.easeInOut(duration: 1.0).repeatForever(autoreverses: true), value: pulse)
                    }
                    VStack(spacing: 6) {
                        Text("Analyzing produce\(String(repeating: ".", count: dotCount))")
                            .font(.system(size: 18, weight: .medium))
                            .foregroundStyle(.primary)
                        Text("FarmEye AI is scanning for pest activity")
                            .font(.system(size: 13))
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                // Faint produce selector — presenter eyes only
                HStack(spacing: 24) {
                    ForEach(allProduce, id: \.key) { item in
                        Button {
                            agriVM.triggerMockScan(item.key)
                        } label: {
                            Text(item.emoji).font(.system(size: 34)).opacity(0.22)
                        }
                    }
                }
                .padding(.bottom, 44)
            }
        }
        .onAppear {
            pulse = true
            dotTimer = Timer.scheduledTimer(withTimeInterval: 0.5, repeats: true) { _ in
                dotCount = dotCount % 3 + 1
            }
        }
        .onDisappear { dotTimer?.invalidate() }
    }
}
