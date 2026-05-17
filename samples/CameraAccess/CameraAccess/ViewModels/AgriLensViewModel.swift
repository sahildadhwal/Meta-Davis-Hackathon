import Foundation
import UIKit
import Observation

@Observable
@MainActor
final class AgriLensViewModel {
    var isAnalyzing = false
    var isMockLoading = false
    var mockProduceEmoji = ""

    func startMockLoading() {
        mockProduceEmoji = ""
        isMockLoading = true
    }

    func startLoadingAndAnalyze(image: UIImage) {
        isMockLoading = true
        Task {
            do {
                let result = try await AgriLensService.shared.analyzeImage(image)
                isMockLoading = false
                diagnosis = result
                showDiagnosis = true
            } catch {
                // Gemini failed — loading screen stays, presenter selects emoji
            }
        }
    }
    var isCallingBob = false
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
    }

    func triggerMockScan(_ produce: String) {
        let d: DiagnosisData
        switch produce {
        case "banana":
            d = DiagnosisData(
                status: "PEST_DAMAGE", produceType: "Banana",
                pestType: "Raccoon / Rat (suspected)",
                location: "Produce Section — Stall 4B",
                issues: [
                    "Visible bite marks consistent with medium-sized mammal activity",
                    "Teeth impression pattern suggests raccoon or large rat",
                    "Multiple bananas affected across lower shelf level",
                    "Damage concentrated at ground level — indicates rodent or raccoon entry",
                    "Possible pest entry point near rear storage door"
                ],
                severity: "HIGH", severityScore: 8,
                summary: "Banana display at Stall 4B shows clear signs of animal damage. Bite patterns are consistent with raccoon or rat activity. Immediate pest control intervention required.",
                recommendations: [
                    "Quarantine all affected produce immediately",
                    "Inspect storage area for pest entry points",
                    "Contact pest control for on-site assessment",
                    "Photograph all damage for incident report",
                    "Notify store manager and health inspector"
                ],
                workerScript: "Hello Bob. We detected animal damage on the banana display at Stall 4B.",
                imageUrl: nil
            )
        case "tomato":
            d = DiagnosisData(
                status: "PEST_DAMAGE", produceType: "Tomato",
                pestType: "Rabbit (suspected)",
                location: "Produce Section — Stall 2A",
                issues: [
                    "Clean 45-degree bite cuts consistent with rabbit activity",
                    "Damage concentrated on lower display items",
                    "Multiple tomatoes show surface gnawing",
                    "No claw marks — rules out larger mammals",
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
                workerScript: "Hello Bob. We detected rabbit damage on the tomato display at Stall 2A.",
                imageUrl: nil
            )
        case "grapes":
            d = DiagnosisData(
                status: "PEST_DAMAGE", produceType: "Grapes",
                pestType: "Bird (suspected)",
                location: "Outdoor Display — Section C",
                issues: [
                    "Pecking damage consistent with bird activity",
                    "Multiple clusters show beak puncture marks",
                    "Exposed fruit pulp increasing spoilage risk",
                    "Damage pattern spread across upper display",
                    "Droppings detected on display surface"
                ],
                severity: "HIGH", severityScore: 7,
                summary: "Grape clusters in Section C show clear signs of bird damage. Puncture marks are exposing fruit to contamination and accelerated spoilage.",
                recommendations: [
                    "Remove and quarantine affected clusters",
                    "Install bird deterrent netting over display",
                    "Clean and sanitize affected area",
                    "Contact pest control for bird deterrent assessment",
                    "File incident report with store manager"
                ],
                workerScript: "Hello Bob. We detected bird damage on the grape display in Section C. Multiple clusters are compromised.",
                imageUrl: nil
            )
        case "orange":
            d = DiagnosisData(
                status: "PEST_DAMAGE", produceType: "Orange",
                pestType: "Rat (suspected)",
                location: "Storage Room — Shelf B2",
                issues: [
                    "Gnaw marks through rind consistent with rat activity",
                    "Hollow sections indicate extended feeding",
                    "Several oranges show entry holes at stem end",
                    "Rat droppings found on adjacent shelving",
                    "Oily smear marks along wall consistent with rat run"
                ],
                severity: "HIGH", severityScore: 8,
                summary: "Orange stock in Storage Room Shelf B2 shows strong evidence of rat infestation. Entry holes and droppings confirm active rodent presence.",
                recommendations: [
                    "Quarantine all stock from Shelf B2",
                    "Set traps along identified rat run",
                    "Seal wall gaps and pipe penetrations",
                    "Contact licensed exterminator immediately",
                    "Deep clean and sanitize storage room"
                ],
                workerScript: "Hello Bob. We found rat damage in the storage room on Shelf B2. The orange stock needs to be quarantined immediately.",
                imageUrl: nil
            )
        case "onion":
            d = DiagnosisData(
                status: "PEST_DAMAGE", produceType: "Onion",
                pestType: "Thrips / Insect Infestation",
                location: "Produce Section — Bin 7",
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
                    "Clean and sanitize bin thoroughly before restocking",
                    "Notify supplier and request replacement shipment"
                ],
                workerScript: "Hello Bob. We detected insect damage on the onions in Bin 7. Thrip activity is confirmed and the bin needs to be removed immediately.",
                imageUrl: nil
            )
        default:
            return
        }
        isMockLoading = false
        diagnosis = d
        showDiagnosis = true
    }

    func dismissAll() {
        endCall()
        showCall = false
        showDiagnosis = false
        diagnosis = nil
        transcripts = []
        callStatus = "Idle"
    }

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
