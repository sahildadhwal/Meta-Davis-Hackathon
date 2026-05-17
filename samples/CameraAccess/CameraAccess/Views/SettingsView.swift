import SwiftUI

struct AgriLensSettingsView: View {
    @Bindable var agriVM: AgriLensViewModel
    @Environment(\.dismiss) var dismiss
    @State private var urlDraft = ""
    @State private var connectionStatus = ""
    @State private var isTesting = false

    var body: some View {
        ZStack {
            Color(white: 0.06).ignoresSafeArea()

            VStack(spacing: 0) {
                sheetHandle
                header
                ScrollView {
                    VStack(spacing: 16) {
                        backendSection
                        infoSection
                    }
                    .padding(20)
                }
            }
        }
        .onAppear { urlDraft = agriVM.backendURL }
        .preferredColorScheme(.dark)
    }

    private var sheetHandle: some View {
        Capsule()
            .fill(Color.white.opacity(0.18))
            .frame(width: 38, height: 4)
            .padding(.top, 12)
    }

    private var header: some View {
        HStack {
            Text("FarmEye Settings")
                .font(.system(size: 20, weight: .bold))
                .foregroundStyle(.white)
            Spacer()
            Button("Done") { dismiss() }
                .font(.system(size: 16, weight: .semibold))
                .foregroundStyle(.green)
        }
        .padding(.horizontal, 20)
        .padding(.vertical, 16)
    }

    private var backendSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionLabel("Backend", icon: "server.rack")

            VStack(alignment: .leading, spacing: 10) {
                Text("Backend URL")
                    .font(.system(size: 12, weight: .medium))
                    .foregroundStyle(.white.opacity(0.45))

                HStack(spacing: 8) {
                    TextField("http://localhost:3002", text: $urlDraft)
                        .font(.system(size: 13, design: .monospaced))
                        .foregroundStyle(.white)
                        .autocorrectionDisabled()
                        .textInputAutocapitalization(.never)
                        .onSubmit { agriVM.backendURL = urlDraft }

                    Button("Save") { agriVM.backendURL = urlDraft }
                        .font(.system(size: 13, weight: .semibold))
                        .foregroundStyle(.green)
                }
                .padding(14)
                .background(Color.white.opacity(0.07))
                .clipShape(RoundedRectangle(cornerRadius: 12))

                Button {
                    Task { await testConnection() }
                } label: {
                    HStack(spacing: 8) {
                        if isTesting {
                            ProgressView().tint(.white).scaleEffect(0.75)
                        } else {
                            Image(systemName: connectionStatus.contains("!") ? "checkmark.circle.fill" : "wifi")
                                .foregroundStyle(connectionStatus.contains("!") ? .green : .white)
                        }
                        Text(connectionStatus.isEmpty ? "Test Connection" : connectionStatus)
                            .font(.system(size: 14, weight: .medium))
                    }
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 12)
                    .background(Color.white.opacity(0.08))
                    .clipShape(RoundedRectangle(cornerRadius: 12))
                }
                .disabled(isTesting)
            }
            .padding(16)
            .background(Color.white.opacity(0.04))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private var demoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionLabel("Demo Mode", icon: "play.circle.fill")

            Toggle(isOn: $agriVM.demoMode) {
                VStack(alignment: .leading, spacing: 3) {
                    Text("Simulation Mode")
                        .font(.system(size: 15, weight: .medium))
                        .foregroundStyle(.white)
                    Text("Simulates Bob's call without a real phone number")
                        .font(.system(size: 12))
                        .foregroundStyle(.white.opacity(0.45))
                }
            }
            .tint(.green)
            .padding(16)
            .background(Color.white.opacity(0.04))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private var infoSection: some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionLabel("About", icon: "info.circle.fill")

            VStack(spacing: 0) {
                infoRow("App", "FarmEye AI")
                Divider().background(Color.white.opacity(0.06))
                infoRow("AI Vision", "Gemini 1.5 Flash")
                Divider().background(Color.white.opacity(0.06))
                infoRow("Voice Synth", "ElevenLabs")
                Divider().background(Color.white.opacity(0.06))
                infoRow("Transcription", "Deepgram Nova-2")
                Divider().background(Color.white.opacity(0.06))
                infoRow("Calls", "Twilio Voice API")
            }
            .padding(16)
            .background(Color.white.opacity(0.04))
            .clipShape(RoundedRectangle(cornerRadius: 16))
        }
    }

    private func sectionLabel(_ title: String, icon: String) -> some View {
        Label(title.uppercased(), systemImage: icon)
            .font(.system(size: 10, weight: .bold, design: .monospaced))
            .tracking(2)
            .foregroundStyle(.white.opacity(0.35))
    }
 
    private func infoRow(_ label: String, _ value: String) -> some View {
        HStack {
            Text(label)
                .font(.system(size: 14))
                .foregroundStyle(.white.opacity(0.55))
            Spacer()
            Text(value)
                .font(.system(size: 14, weight: .medium))
                .foregroundStyle(.white)
        }
        .padding(.vertical, 10)
    }

    private func testConnection() async {
        isTesting = true
        connectionStatus = "Testing..."
        agriVM.backendURL = urlDraft
        guard let url = URL(string: "\(urlDraft)/health") else {
            connectionStatus = "Invalid URL"
            isTesting = false
            return
        }
        do {
            let (_, response) = try await URLSession.shared.data(from: url)
            connectionStatus = (response as? HTTPURLResponse)?.statusCode == 200 ? "Connected!" : "Server error"
        } catch {
            connectionStatus = "Cannot connect"
        }
        isTesting = false
    }
}
