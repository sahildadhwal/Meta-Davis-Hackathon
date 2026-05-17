import Foundation
import UIKit
import Observation

@Observable
@MainActor
final class AgriLensViewModel {
    var isAnalyzing = false
    var isMockLoading = false
    var mockProduceEmoji = ""
    var isCallingBob = false
    var lastCapturedImage: UIImage?
    var diagnosis: DiagnosisData?
    var transcripts: [TranscriptEntry] = []
    var callStatus = "Idle"
    var showDiagnosis = false
    var showCall = false
    var showSettings = false
    var errorMessage = ""
    var hasError = false
    var demoMode = false

    var backendURL: String {
        get { AgriLensService.shared.backendURL }
        set { AgriLensService.shared.backendURL = newValue }
    }

    @ObservationIgnored private var pollingTask: Task<Void, Never>?

    // MARK: - Loading / Analysis

    func startMockLoading() {
        isMockLoading = true
    }

    func startLoadingAndAnalyze(image: UIImage) {
        lastCapturedImage = image
        isMockLoading = true
        Task {
            do {
                let result = try await AgriLensService.shared.analyzeImage(image)
                if result.isFallback == true {
                    // Fallback — keep loading screen for presenter to select
                } else {
                    isMockLoading = false
                    diagnosis = result
                    showDiagnosis = true
                }
            } catch {
                // Keep loading screen — presenter selects emoji
            }
        }
    }

    func analyze(image: UIImage) async {
        isAnalyzing = true
        defer { isAnalyzing = false }
        do {
            diagnosis = try await AgriLensService.shared.analyzeImage(image)
            showDiagnosis = true
        } catch {
            displayError("Analysis failed: \(error.localizedDescription)")
        }
    }

    // MARK: - Mock Scan (presenter emoji selection)

    func triggerMockScan(_ produce: String) {
        switch produce {

        case "avocado":
            guard let image = lastCapturedImage else {
                displayError("No image available for AI analysis.")
                return
            }
            isMockLoading = true
            Task {
                do {
                    let result = try await AgriLensService.shared.analyzeImage(image)
                    isMockLoading = false
                    diagnosis = result
                    showDiagnosis = true
                } catch {
                    isMockLoading = false
                    displayError("AI analysis failed. Please select produce manually.")
                }
            }
            return

        case "banana":
            setDiagnosis(DiagnosisData(
                status: "PEST_DAMAGE", produceType: "Banana",
                pestType: "Rat (suspected)",
                location: "Produce Section \u{2014} Stall 4B",
                issues: [
                    "Multiple deep puncture holes consistent with rat teeth",
                    "Brown discoloration and bruising surrounding bite sites",
                    "Damage penetrates through fruit flesh",
                    "Holes concentrated at ground-level shelf \u{2014} rodent activity",
                    "Possible rat entry point near rear storage door"
                ],
                severity: "HIGH", severityScore: 9,
                summary: "Banana display at Stall 4B shows clear evidence of rat activity. Deep puncture holes and tissue damage indicate active infestation. Immediate quarantine required.",
                recommendations: [
                    "Quarantine entire Stall 4B immediately",
                    "Set snap traps along identified rat run",
                    "Seal rear storage door gaps",
                    "Contact licensed pest control for full inspection",
                    "Photograph all damage for incident report"
                ],
                workerScript: "Hello Lebron. We found rat damage on the banana display at Stall 4B. Deep bite holes are visible. This needs immediate attention.",
                imageUrl: nil, isFallback: false
            ))

        case "orange":
            setDiagnosis(DiagnosisData(
                status: "PASS", produceType: "Mandarin Orange",
                pestType: nil,
                location: "Produce Section \u{2014} Stall 3A",
                issues: [],
                severity: "NONE", severityScore: 0,
                summary: "Mandarin orange shipment at Stall 3A shows no signs of pest damage, contamination, or quality issues. This shipment meets all safety and quality standards.",
                recommendations: ["Continue standard monitoring", "No action required"],
                workerScript: "Hello Lebron. Great news \u{2014} the mandarin oranges at Stall 3A have passed inspection. No issues detected.",
                imageUrl: nil, isFallback: false
            ))

        case "tomato":
            setDiagnosis(DiagnosisData(
                status: "PEST_DAMAGE", produceType: "Tomato",
                pestType: "Rabbit (suspected)",
                location: "Produce Section \u{2014} Stall 2A",
                issues: [
                    "Clean 45-degree bite cuts consistent with rabbit activity",
                    "Damage concentrated on lower display items",
                    "Multiple tomatoes show surface gnawing",
                    "No claw marks \u{2014} rules out larger mammals",
                    "Droppings observed nearby"
                ],
                severity: "HIGH", severityScore: 7,
                summary: "Tomato display at Stall 2A shows bite patterns consistent with rabbit activity. Lower shelf items most affected. Immediate action required.",
                recommendations: [
                    "Remove and quarantine affected tomatoes",
                    "Set humane traps near Stall 2A",
                    "Seal any gaps in perimeter fencing",
                    "Contact pest control for rabbit deterrent installation",
                    "File incident report with store manager"
                ],
                workerScript: "Hello Lebron. We detected rabbit damage on the tomato display at Stall 2A.",
                imageUrl: nil, isFallback: false
            ))

        case "grapes":
            setDiagnosis(DiagnosisData(
                status: "PEST_DAMAGE", produceType: "Grapes",
                pestType: "Bird (suspected)",
                location: "Outdoor Display \u{2014} Section C",
                issues: [
                    "Pecking damage consistent with bird activity",
                    "Multiple clusters show beak puncture marks",
                    "Exposed fruit pulp increasing spoilage risk",
                    "Damage pattern spread across upper display",
                    "Droppings detected on display surface"
                ],
                severity: "HIGH", severityScore: 7,
                summary: "Grape clusters in Section C show clear signs of bird damage. Puncture marks are exposing fruit to contamination and spoilage.",
                recommendations: [
                    "Remove and quarantine affected clusters",
                    "Install bird deterrent netting over display",
                    "Clean and sanitize affected area",
                    "Contact pest control for bird deterrent assessment",
                    "File incident report with store manager"
                ],
                workerScript: "Hello Lebron. We detected bird damage on the grape display in Section C.",
                imageUrl: nil, isFallback: false
            ))

        case "onion":
            setDiagnosis(DiagnosisData(
                status: "PEST_DAMAGE", produceType: "Onion",
                pestType: "Thrips / Insect Infestation",
                location: "Produce Section \u{2014} Bin 7",
                issues: [
                    "Silver streaking on outer layers consistent with thrip damage",
                    "Distorted and papery outer skin on multiple bulbs",
                    "Visible insect frass between outer layers",
                    "Soft spots indicate secondary fungal infection",
                    "Infestation spread across entire bin"
                ],
                severity: "HIGH", severityScore: 8,
                summary: "Onions in Bin 7 show signs of thrips infestation with secondary fungal damage. The entire bin is at risk of rapid spoilage.",
                recommendations: [
                    "Remove entire bin from display immediately",
                    "Inspect adjacent produce bins for spread",
                    "Contact pest control for insecticide treatment",
                    "Clean and sanitize bin before restocking",
                    "Notify supplier and request replacement shipment"
                ],
                workerScript: "Hello Lebron. We detected insect damage on the onions in Bin 7. Thrip activity is confirmed.",
                imageUrl: nil, isFallback: false
            ))

        default:
            return
        }
    }

    private func setDiagnosis(_ d: DiagnosisData) {
        isMockLoading = false
        diagnosis = d
        showDiagnosis = true
    }

    // MARK: - Call

    func callBob() async {
        guard !isCallingBob else { return }
        isCallingBob = true
        callStatus = "Dialing..."
        transcripts = []
        try? await AgriLensService.shared.clearTranscripts()
        do {
            try await AgriLensService.shared.callBob(produceInfo: diagnosis, demoMode: demoMode)
            showCall = true
            startPolling()
        } catch {
            callStatus = "Failed"
            displayError("Call failed: \(error.localizedDescription)")
        }
        isCallingBob = false
    }

    func endCall() {
        stopPolling()
        callStatus = "Call Ended"
        showCall = false
    }

    func dismissAll() {
        endCall()
        showCall = false
        showDiagnosis = false
        diagnosis = nil
        transcripts = []
        callStatus = "Idle"
        lastCapturedImage = nil
    }

    // MARK: - Polling

    private func startPolling() {
        stopPolling()
        pollingTask = Task {
            while !Task.isCancelled {
                if let entries = try? await AgriLensService.shared.fetchTranscripts() {
                    transcripts = entries
                    updateCallStatus(from: entries)
                }
                try? await Task.sleep(nanoseconds: 2_000_000_000)
            }
        }
    }

    private func stopPolling() {
        pollingTask?.cancel()
        pollingTask = nil
    }

    private func updateCallStatus(from entries: [TranscriptEntry]) {
        guard !entries.isEmpty else { return }
        if let last = entries.last,
           last.text.contains("Hasta luego") || last.text.contains("goodbye") || last.text.contains("Gracias Bob") {
            callStatus = "Call Ended"
            stopPolling()
        } else {
            callStatus = "In Conversation..."
        }
    }

    private func displayError(_ msg: String) {
        errorMessage = msg
        hasError = true
    }
}
