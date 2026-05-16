import SwiftUI

struct CallView: View {
    @Bindable var agriVM: AgriLensViewModel
    @Environment(\.dismiss) var dismiss
    @State private var pulseScale: CGFloat = 1.0
    @State private var waveScales: [CGFloat] = [1.0, 1.0, 1.0]

    private var isActive: Bool { agriVM.callStatus == "In Conversation..." }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            VStack(spacing: 0) {
                callHeader
                waveAnimation
                transcriptFeed
                endCallButton
                    .padding(.bottom, 40)
            }
        }
        .onAppear { startWaveAnimation() }
        .onDisappear { agriVM.endCall() }
        .preferredColorScheme(.dark)
    }

    private var callHeader: some View {
        VStack(spacing: 10) {
            HStack {
                Button {
                    agriVM.endCall()
                    dismiss()
                } label: {
                    Image(systemName: "chevron.down")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white.opacity(0.6))
                        .padding(10)
                        .background(Color.white.opacity(0.1))
                        .clipShape(Circle())
                }
                Spacer()
                HStack(spacing: 6) {
                    Circle()
                        .fill(isActive ? Color.green : Color.orange)
                        .frame(width: 7, height: 7)
                        .scaleEffect(pulseScale)
                        .shadow(color: isActive ? .green : .orange, radius: 4)
                    Text(agriVM.callStatus)
                        .font(.system(size: 13, weight: .medium))
                        .foregroundStyle(.white.opacity(0.8))
                }
                Spacer()
                Color.clear.frame(width: 40, height: 40)
            }
            .padding(.horizontal, 20)
            .padding(.top, 20)

            VStack(spacing: 4) {
                Text("BOB")
                    .font(.system(size: 22, weight: .bold))
                    .foregroundStyle(.white)
                Text("Field Worker")
                    .font(.system(size: 12, weight: .medium, design: .monospaced))
                    .tracking(2)
                    .foregroundStyle(.white.opacity(0.35))
            }
        }
    }

    private var waveAnimation: some View {
        ZStack {
            ForEach(0..<3, id: \.self) { i in
                Circle()
                    .stroke(Color.green.opacity(isActive ? (0.12 - Double(i) * 0.035) : 0.04), lineWidth: 1.5)
                    .frame(width: 90 + CGFloat(i) * 44, height: 90 + CGFloat(i) * 44)
                    .scaleEffect(isActive ? waveScales[i] : 1.0)
            }
            Circle()
                .fill(LinearGradient(
                    colors: [Color.green.opacity(0.25), Color.green.opacity(0.08)],
                    startPoint: .top,
                    endPoint: .bottom
                ))
                .frame(width: 90, height: 90)
                .overlay(
                    Image(systemName: "phone.fill")
                        .font(.system(size: 32))
                        .foregroundStyle(.green)
                )
        }
        .frame(height: 220)
        .padding(.vertical, 16)
    }

    private var transcriptFeed: some View {
        VStack(alignment: .leading, spacing: 0) {
            HStack {
                Text("LIVE TRANSCRIPT")
                    .font(.system(size: 9, weight: .bold, design: .monospaced))
                    .tracking(3)
                    .foregroundStyle(.white.opacity(0.35))
                Spacer()
                if !agriVM.transcripts.isEmpty {
                    Text("\(agriVM.transcripts.count) messages")
                        .font(.system(size: 10))
                        .foregroundStyle(.white.opacity(0.25))
                }
            }
            .padding(.horizontal, 20)
            .padding(.bottom, 10)

            Divider().background(Color.white.opacity(0.08))

            if agriVM.transcripts.isEmpty {
                VStack(spacing: 12) {
                    ProgressView().tint(.green)
                    Text("Waiting for conversation...")
                        .font(.system(size: 13))
                        .foregroundStyle(.white.opacity(0.4))
                }
                .frame(maxWidth: .infinity, maxHeight: .infinity)
            } else {
                ScrollViewReader { proxy in
                    ScrollView {
                        LazyVStack(spacing: 14) {
                            ForEach(agriVM.transcripts) { entry in
                                TranscriptBubble(entry: entry)
                                    .id(entry.id)
                            }
                        }
                        .padding(20)
                    }
                    .onChange(of: agriVM.transcripts.count) {
                        if let last = agriVM.transcripts.last {
                            withAnimation(.easeOut(duration: 0.3)) {
                                proxy.scrollTo(last.id, anchor: .bottom)
                            }
                        }
                    }
                }
            }
        }
        .frame(maxHeight: .infinity)
    }

    private var endCallButton: some View {
        Button {
            agriVM.endCall()
            dismiss()
        } label: {
            HStack(spacing: 8) {
                Image(systemName: "phone.down.fill")
                Text("End Call")
                    .font(.system(size: 16, weight: .semibold))
            }
            .foregroundStyle(.white)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 18)
            .background(Color.red.opacity(0.75))
            .clipShape(RoundedRectangle(cornerRadius: 16))
            .padding(.horizontal, 20)
        }
    }

    private func startWaveAnimation() {
        withAnimation(.easeInOut(duration: 1.1).repeatForever(autoreverses: true)) {
            pulseScale = 1.25
        }
        for i in 0..<3 {
            withAnimation(
                .easeInOut(duration: 1.3 + Double(i) * 0.25)
                .repeatForever(autoreverses: true)
                .delay(Double(i) * 0.28)
            ) {
                waveScales[i] = 1.12 + CGFloat(i) * 0.06
            }
        }
    }
}

struct TranscriptBubble: View {
    let entry: TranscriptEntry

    private var isAI: Bool { entry.speaker == "AI" }
    private var speakerColor: Color { isAI ? .blue : .green }

    var body: some View {
        VStack(alignment: isAI ? .leading : .trailing, spacing: 5) {
            Text(isAI ? "AI" : "BOB")
                .font(.system(size: 9, weight: .bold, design: .monospaced))
                .tracking(2)
                .foregroundStyle(speakerColor.opacity(0.8))

            VStack(alignment: .leading, spacing: 5) {
                Text(entry.text)
                    .font(.system(size: 14))
                    .foregroundStyle(.white)
                    .lineSpacing(3)
                if let translation = entry.translation, !translation.isEmpty {
                    Text(translation)
                        .font(.system(size: 12))
                        .foregroundStyle(.white.opacity(0.45))
                        .italic()
                        .lineSpacing(2)
                }
            }
            .padding(.horizontal, 14)
            .padding(.vertical, 10)
            .background(speakerColor.opacity(0.12))
            .clipShape(RoundedRectangle(cornerRadius: 14))
            .overlay(
                RoundedRectangle(cornerRadius: 14)
                    .stroke(speakerColor.opacity(0.18), lineWidth: 1)
            )
        }
        .frame(maxWidth: .infinity, alignment: isAI ? .leading : .trailing)
    }
}
