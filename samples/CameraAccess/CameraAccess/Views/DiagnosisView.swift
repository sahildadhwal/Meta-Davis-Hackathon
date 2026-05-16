import SwiftUI

struct DiagnosisView: View {
    @Bindable var agriVM: AgriLensViewModel
    @Environment(\.dismiss) var dismiss
    @State private var pulseScale: CGFloat = 1.0

    private var severityColor: Color {
        switch agriVM.diagnosis?.severity.uppercased() {
        case "CRITICAL": return .red
        case "HIGH": return Color(red: 1.0, green: 0.3, blue: 0.2)
        case "MEDIUM": return .orange
        default: return .green
        }
    }

    var body: some View {
        ZStack {
            Color.black.ignoresSafeArea()

            ScrollView {
                VStack(spacing: 20) {
                    headerView
                    if let d = agriVM.diagnosis {
                        severityCard(d)
                        summaryCard(d)
                        issuesCard(d)
                        recommendationsCard(d)
                    }
                    callButton
                    Spacer(minLength: 40)
                }
                .padding(.horizontal, 20)
                .padding(.top, 70)
            }

            topBar
        }
        .sheet(isPresented: $agriVM.showCall) {
            CallView(agriVM: agriVM)
        }
        .onAppear {
            withAnimation(.easeInOut(duration: 1.2).repeatForever(autoreverses: true)) {
                pulseScale = 1.18
            }
        }
        .preferredColorScheme(.dark)
    }

    private var topBar: some View {
        VStack {
            HStack {
                Button {
                    agriVM.dismissAll()
                    dismiss()
                } label: {
                    Image(systemName: "xmark")
                        .font(.system(size: 14, weight: .semibold))
                        .foregroundStyle(.white)
                        .padding(10)
                        .background(Color.white.opacity(0.12))
                        .clipShape(Circle())
                }
                Spacer()
            }
            .padding(.horizontal, 20)
            .padding(.top, 16)
            Spacer()
        }
    }

    private var headerView: some View {
        VStack(spacing: 8) {
            HStack(spacing: 8) {
                Circle()
                    .fill(Color.green)
                    .frame(width: 8, height: 8)
                    .scaleEffect(pulseScale)
                    .shadow(color: .green, radius: 4)
                Text("AGRILENS AI")
                    .font(.system(size: 11, weight: .bold, design: .monospaced))
                    .foregroundStyle(.green)
                    .tracking(3)
            }
            Text("Diagnosis Report")
                .font(.system(size: 30, weight: .bold))
                .foregroundStyle(.white)
        }
        .padding(.top, 16)
    }

    private func severityCard(_ d: DiagnosisData) -> some View {
        VStack(spacing: 14) {
            HStack(alignment: .top) {
                VStack(alignment: .leading, spacing: 4) {
                    Text("LOT #6")
                        .font(.system(size: 10, weight: .bold, design: .monospaced))
                        .foregroundStyle(.white.opacity(0.4))
                        .tracking(3)
                    Text(d.produceType ?? "Produce")
                        .font(.system(size: 24, weight: .bold))
                        .foregroundStyle(.white)
                }
                Spacer()
                severityBadge(d.severity)
            }

            if let score = d.severityScore {
                GeometryReader { geo in
                    ZStack(alignment: .leading) {
                        Capsule().fill(Color.white.opacity(0.08)).frame(height: 6)
                        Capsule()
                            .fill(severityColor)
                            .frame(width: geo.size.width * CGFloat(score) / 10, height: 6)
                            .shadow(color: severityColor.opacity(0.9), radius: 6)
                    }
                }
                .frame(height: 6)
            }
        }
        .padding(20)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .overlay(
            RoundedRectangle(cornerRadius: 18)
                .stroke(severityColor.opacity(0.5), lineWidth: 1)
        )
        .shadow(color: severityColor.opacity(0.25), radius: 14)
    }

    private func severityBadge(_ severity: String) -> some View {
        Text(severity.uppercased())
            .font(.system(size: 10, weight: .black, design: .monospaced))
            .tracking(2)
            .foregroundStyle(.white)
            .padding(.horizontal, 12)
            .padding(.vertical, 7)
            .background(severityColor)
            .clipShape(Capsule())
            .scaleEffect(pulseScale * 0.97)
            .shadow(color: severityColor, radius: 10)
    }

    private func summaryCard(_ d: DiagnosisData) -> some View {
        VStack(alignment: .leading, spacing: 10) {
            sectionLabel("Summary", systemImage: "doc.text.fill")
            Text(d.summary ?? d.workerScript ?? "Quality issues detected.")
                .font(.system(size: 15))
                .foregroundStyle(.white.opacity(0.88))
                .lineSpacing(5)
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 18))
    }

    private func issuesCard(_ d: DiagnosisData) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionLabel("Issues Detected", systemImage: "exclamationmark.triangle.fill", color: .orange)
            ForEach(d.issues, id: \.self) { issue in
                HStack(alignment: .top, spacing: 10) {
                    Circle().fill(Color.orange).frame(width: 5, height: 5).padding(.top, 7)
                    Text(issue)
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.85))
                        .lineSpacing(3)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.orange.opacity(0.2), lineWidth: 1))
    }

    private func recommendationsCard(_ d: DiagnosisData) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            sectionLabel("Recommended Actions", systemImage: "checkmark.shield.fill", color: .green)
            ForEach(d.recommendations, id: \.self) { rec in
                HStack(alignment: .top, spacing: 10) {
                    Image(systemName: "arrow.right")
                        .font(.system(size: 9, weight: .bold))
                        .foregroundStyle(.green)
                        .padding(.top, 5)
                    Text(rec)
                        .font(.system(size: 14))
                        .foregroundStyle(.white.opacity(0.85))
                        .lineSpacing(3)
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
        .padding(20)
        .background(.ultraThinMaterial)
        .clipShape(RoundedRectangle(cornerRadius: 18))
        .overlay(RoundedRectangle(cornerRadius: 18).stroke(Color.green.opacity(0.2), lineWidth: 1))
    }

    private var callButton: some View {
        Button {
            Task { await agriVM.callBob() }
        } label: {
            HStack(spacing: 12) {
                if agriVM.isCallingBob {
                    ProgressView().tint(.black)
                    Text("Initiating Call...")
                        .font(.system(size: 16, weight: .bold))
                } else {
                    Image(systemName: "phone.fill")
                        .font(.system(size: 16))
                    Text("CALL BOB NOW")
                        .font(.system(size: 16, weight: .bold, design: .monospaced))
                        .tracking(2)
                }
            }
            .foregroundStyle(.black)
            .frame(maxWidth: .infinity)
            .padding(.vertical, 20)
            .background(Color.green)
            .clipShape(RoundedRectangle(cornerRadius: 18))
            .shadow(color: .green.opacity(0.6), radius: 16)
        }
        .disabled(agriVM.isCallingBob)
    }

    private func sectionLabel(_ title: String, systemImage: String, color: Color = .white) -> some View {
        Label(title.uppercased(), systemImage: systemImage)
            .font(.system(size: 10, weight: .bold, design: .monospaced))
            .tracking(2)
            .foregroundStyle(color.opacity(0.7))
    }
}
