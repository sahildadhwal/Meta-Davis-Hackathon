import Foundation
import UIKit
import Observation

@Observable
@MainActor
final class AgriLensViewModel {
    var isAnalyzing = false
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
