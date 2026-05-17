import SwiftUI

private func emojiFor(_ produceType: String?) -> String {
    switch produceType?.lowercased() {
    case "banana", "bananas": return "🍌"
    case "tomato", "tomatoes": return "🍅"
    case "onion", "onions": return "🧅"
    case "grape", "grapes": return "🍇"
    case "orange", "oranges": return "🍊"
    case "lettuce": return "🥬"
    case "avocado", "avocados": return "🥑"
    case "mandarin orange", "mandarin": return "🍊"
    case "strawberry", "strawberries": return "🍓"
    case "apple", "apples": return "🍎"
    default: return "🌿"
    }
}

private let pestContacts: [PestContact] = [
    PestContact(name: "Lebron", role: "Field Manager", phone: "+17078632820",
                isInternal: true, badge: "On-site"),
    PestContact(name: "Davis Pest Solutions", role: "Licensed Exterminator", phone: "(530) 759-4430", isInternal: false, badge: "4.8★ · 0.3 mi"),
    PestContact(name: "Capitol Wildlife Control", role: "Raccoon & Rodent Specialist", phone: "(916) 638-5771", isInternal: false, badge: "4.6★ · 1.2 mi"),
    PestContact(name: "BugBusters Emergency", role: "24/7 Pest Response", phone: "(916) 482-2057", isInternal: false, badge: "4.5★ · 2.1 mi"),
]

struct DiagnosisView: View {
    @Bindable var agriVM: AgriLensViewModel
    @Environment(\.dismiss) var dismiss

    var body: some View {
        NavigationStack {
            ScrollView {
                VStack(spacing: 14) {
                    if let d = agriVM.diagnosis {
                        if d.status == "PASS" {
                            passCard(d)
                        } else {
                            incidentCard(d)
                            analysisCard(d)
                            contactsCard
                            if agriVM.showCall { liveCallCard }
                        }
                    }
                    Spacer(minLength: 32)
                }
                .padding(16)
            }
            .background(Color(UIColor.systemGroupedBackground))
            .navigationTitle("Incident Report")
            .navigationBarTitleDisplayMode(.large)
            .toolbar {
                ToolbarItem(placement: .navigationBarLeading) {
                    Button("Close") {
                        agriVM.dismissAll()
                        dismiss()
                    }
                    .foregroundStyle(.red)
                }
            }
        }
    }

    // MARK: - Pass Card

    private func passCard(_ d: DiagnosisData) -> some View {
        VStack(spacing: 24) {
            VStack(spacing: 14) {
                ZStack {
                    Circle().fill(Color.green.opacity(0.12)).frame(width: 100, height: 100)
                    Image(systemName: "checkmark.seal.fill")
                        .font(.system(size: 48))
                        .foregroundStyle(.green)
                }
                Text("Passes Inspection")
                    .font(.system(size: 26, weight: .bold))
                    .foregroundStyle(.primary)
                HStack(spacing: 6) {
                    Image(systemName: "mappin.circle.fill")
                        .font(.system(size: 12))
                        .foregroundStyle(.secondary)
                    Text(d.location ?? "Produce Section")
                        .font(.system(size: 14))
                        .foregroundStyle(.secondary)
                }
                Text(d.summary ?? "No issues detected. This shipment meets all safety and quality standards.")
                    .font(.system(size: 14))
                    .foregroundStyle(.secondary)
                    .multilineTextAlignment(.center)
                    .lineSpacing(4)
            }
            .padding(24)
            .frame(maxWidth: .infinity)
            .background(Color.white)
            .clipShape(RoundedRectangle(cornerRadius: 20))
            .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
            .overlay(RoundedRectangle(cornerRadius: 20).stroke(Color.green.opacity(0.25), lineWidth: 1.5))

            Button {
                agriVM.dismissAll()
                dismiss()
            } label: {
                Label("Scan Another", systemImage: "camera.fill")
                    .font(.system(size: 16, weight: .semibold))
                    .foregroundStyle(.white)
                    .frame(maxWidth: .infinity)
                    .padding(.vertical, 16)
                    .background(Color.blue)
                    .clipShape(RoundedRectangle(cornerRadius: 14))
            }
        }
        .padding(.top, 20)
    }

    // MARK: - Incident Card

    private func incidentCard(_ d: DiagnosisData) -> some View {
        VStack(alignment: .leading, spacing: 14) {
            HStack {
                Label("INCIDENT DETECTED", systemImage: "exclamationmark.triangle.fill")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.orange)
                Spacer()
                Text(d.severity.uppercased())
                    .font(.system(size: 10, weight: .bold))
                    .foregroundStyle(.white)
                    .padding(.horizontal, 10)
                    .padding(.vertical, 4)
                    .background(Color.red)
                    .clipShape(Capsule())
            }

            HStack(spacing: 14) {
                RoundedRectangle(cornerRadius: 14)
                    .fill(Color.orange.opacity(0.1))
                    .frame(width: 60, height: 60)
                    .overlay(Text(emojiFor(d.produceType)).font(.system(size: 30)))

                VStack(alignment: .leading, spacing: 4) {
                    Text(d.produceType ?? "Produce")
                        .font(.system(size: 22, weight: .bold))
                        .foregroundStyle(.primary)
                    HStack(spacing: 4) {
                        Image(systemName: "mappin.circle.fill")
                            .font(.system(size: 11))
                            .foregroundStyle(.secondary)
                        Text(d.location ?? "Stall 4B · Produce Section")
                            .font(.system(size: 13))
                            .foregroundStyle(.secondary)
                    }
                    HStack(spacing: 4) {
                        Image(systemName: "ladybug.fill")
                            .font(.system(size: 11))
                            .foregroundStyle(.red)
                        Text(d.pestType ?? "Animal damage detected")
                            .font(.system(size: 13, weight: .medium))
                            .foregroundStyle(.red)
                    }
                }
            }

            Text(d.summary ?? "")
                .font(.system(size: 14))
                .foregroundStyle(.secondary)
                .lineSpacing(4)
        }
        .padding(16)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
    }

    // MARK: - Analysis Card

    private func analysisCard(_ d: DiagnosisData) -> some View {
        VStack(alignment: .leading, spacing: 12) {
            Text("DAMAGE ANALYSIS")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 8) {
                ForEach(d.issues, id: \.self) { issue in
                    HStack(alignment: .top, spacing: 10) {
                        Circle()
                            .fill(Color.red)
                            .frame(width: 5, height: 5)
                            .padding(.top, 6)
                        Text(issue)
                            .font(.system(size: 14))
                            .foregroundStyle(.primary)
                            .lineSpacing(2)
                    }
                }
            }

            Divider().padding(.vertical, 4)

            Text("RECOMMENDED ACTIONS")
                .font(.system(size: 11, weight: .semibold))
                .foregroundStyle(.secondary)

            VStack(alignment: .leading, spacing: 8) {
                ForEach(d.recommendations, id: \.self) { rec in
                    HStack(alignment: .top, spacing: 10) {
                        Image(systemName: "checkmark")
                            .font(.system(size: 11, weight: .bold))
                            .foregroundStyle(.blue)
                            .padding(.top, 3)
                        Text(rec)
                            .font(.system(size: 14))
                            .foregroundStyle(.primary)
                            .lineSpacing(2)
                    }
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
    }

    // MARK: - Contacts Card

    private var contactsCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                Text("AVAILABLE CONTACTS")
                    .font(.system(size: 11, weight: .semibold))
                    .foregroundStyle(.secondary)
                Spacer()
                Label("AI Recommended", systemImage: "sparkles")
                    .font(.system(size: 10, weight: .medium))
                    .foregroundStyle(.blue)
            }

            VStack(spacing: 8) {
                ForEach(pestContacts) { contact in
                    contactRow(contact)
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
    }

    private func contactRow(_ contact: PestContact) -> some View {
        HStack(spacing: 12) {
            Circle()
                .fill(contact.isInternal ? Color.blue.opacity(0.1) : Color(UIColor.systemGray5))
                .frame(width: 44, height: 44)
                .overlay(
                    Text(contact.isInternal ? "👤" : "🐀")
                        .font(.system(size: 20))
                )

            VStack(alignment: .leading, spacing: 2) {
                HStack(spacing: 6) {
                    Text(contact.name)
                        .font(.system(size: 15, weight: .semibold))
                        .foregroundStyle(.primary)
                    if contact.isInternal {
                        Text("FIELD")
                            .font(.system(size: 8, weight: .bold))
                            .foregroundStyle(.white)
                            .padding(.horizontal, 5)
                            .padding(.vertical, 2)
                            .background(Color.blue)
                            .clipShape(Capsule())
                    }
                }
                Text(contact.role)
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
                if let badge = contact.badge {
                    Text(badge)
                        .font(.system(size: 11))
                        .foregroundStyle(contact.isInternal ? .green : .secondary)
                }
            }

            Spacer()

            if contact.isInternal {
                Button {
                    Task { await agriVM.callBob() }
                } label: {
                    Group {
                        if agriVM.isCallingBob {
                            ProgressView().tint(.white).scaleEffect(0.8)
                                .frame(width: 60)
                        } else {
                            Label("Call", systemImage: "phone.fill")
                                .font(.system(size: 13, weight: .semibold))
                        }
                    }
                }
                .foregroundStyle(.white)
                .padding(.horizontal, 14)
                .padding(.vertical, 9)
                .background(agriVM.showCall ? Color.gray : Color.blue)
                .clipShape(Capsule())
                .disabled(agriVM.isCallingBob || agriVM.showCall)
            } else {
                Text(contact.phone)
                    .font(.system(size: 12, design: .monospaced))
                    .foregroundStyle(.blue)
            }
        }
        .padding(12)
        .background(contact.isInternal ? Color.blue.opacity(0.04) : Color.clear)
        .clipShape(RoundedRectangle(cornerRadius: 12))
        .overlay(
            RoundedRectangle(cornerRadius: 12)
                .stroke(contact.isInternal ? Color.blue.opacity(0.2) : Color(UIColor.systemGray5), lineWidth: 1)
        )
    }

    // MARK: - Live Call Card

    private var liveCallCard: some View {
        VStack(alignment: .leading, spacing: 12) {
            HStack {
                HStack(spacing: 6) {
                    Circle()
                        .fill(Color.green)
                        .frame(width: 8, height: 8)
                    Text("LIVE CALL · LEBRON")
                        .font(.system(size: 11, weight: .bold))
                        .foregroundStyle(Color(red: 0.1, green: 0.55, blue: 0.1))
                }
                Spacer()
                Text(agriVM.callStatus)
                    .font(.system(size: 12))
                    .foregroundStyle(.secondary)
                Button {
                    agriVM.endCall()
                } label: {
                    Image(systemName: "phone.down.fill")
                        .font(.system(size: 13))
                        .foregroundStyle(.white)
                        .padding(8)
                        .background(Color.red)
                        .clipShape(Circle())
                }
            }

            Divider()

            if agriVM.transcripts.isEmpty {
                HStack(spacing: 8) {
                    ProgressView().scaleEffect(0.8)
                    Text("Connecting to Lebron...")
                        .font(.system(size: 13))
                        .foregroundStyle(.secondary)
                }
                .padding(.vertical, 4)
            } else {
                ScrollViewReader { proxy in
                    ScrollView {
                        VStack(spacing: 10) {
                            ForEach(agriVM.transcripts) { entry in
                                transcriptRow(entry).id(entry.id)
                            }
                        }
                    }
                    .frame(maxHeight: 240)
                    .onChange(of: agriVM.transcripts.count) {
                        if let last = agriVM.transcripts.last {
                            withAnimation { proxy.scrollTo(last.id, anchor: .bottom) }
                        }
                    }
                }
            }
        }
        .padding(16)
        .background(Color.white)
        .clipShape(RoundedRectangle(cornerRadius: 16))
        .shadow(color: .black.opacity(0.05), radius: 8, y: 2)
        .overlay(
            RoundedRectangle(cornerRadius: 16)
                .stroke(Color.green.opacity(0.3), lineWidth: 1.5)
        )
    }

    private func transcriptRow(_ entry: TranscriptEntry) -> some View {
        let isAI = entry.speaker == "AI"
        return HStack(alignment: .top, spacing: 10) {
            Text(isAI ? "AI" : "Bob")
                .font(.system(size: 11, weight: .bold))
                .foregroundStyle(isAI ? .blue : .primary)
                .frame(width: 28, alignment: .leading)
            VStack(alignment: .leading, spacing: 2) {
                Text(entry.text)
                    .font(.system(size: 13))
                    .foregroundStyle(.primary)
                    .lineSpacing(2)
                if let translation = entry.translation, !translation.isEmpty {
                    Text(translation)
                        .font(.system(size: 11))
                        .foregroundStyle(.secondary)
                        .italic()
                }
            }
        }
        .frame(maxWidth: .infinity, alignment: .leading)
    }
}
