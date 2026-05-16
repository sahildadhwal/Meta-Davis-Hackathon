import Foundation
import UIKit

// MARK: - Response Models

struct AnalyzeImageResponse: Codable {
    let success: Bool
    let data: DiagnosisData?
}

struct DiagnosisData: Codable {
    let status: String
    let produceType: String?
    let issues: [String]
    let severity: String
    let severityScore: Int?
    let summary: String?
    let recommendations: [String]
    let workerScript: String?
    let imageUrl: String?
}

struct TranscriptsResponse: Codable {
    let success: Bool
    let data: [TranscriptEntry]
}

struct TranscriptEntry: Codable, Identifiable {
    let id: String
    let speaker: String
    let text: String
    let lang: String?
    let translation: String?
    let timestamp: Double?
}

// MARK: - Service

final class AgriLensService {
    static let shared = AgriLensService()
    private init() {}

    var backendURL: String {
        get { UserDefaults.standard.string(forKey: "agrilens_backend_url") ?? "https://tiptop-sarcasm-humped.ngrok-free.dev" }
        set { UserDefaults.standard.set(newValue, forKey: "agrilens_backend_url") }
    }

    func analyzeImage(_ image: UIImage) async throws -> DiagnosisData {
        guard let url = URL(string: "\(backendURL)/api/analyze-image") else { throw URLError(.badURL) }
        var request = URLRequest(url: url, timeoutInterval: 60)
        request.httpMethod = "POST"
        request.setValue("true", forHTTPHeaderField: "ngrok-skip-browser-warning")
        let boundary = "AgriLens-\(UUID().uuidString)"
        request.setValue("multipart/form-data; boundary=\(boundary)", forHTTPHeaderField: "Content-Type")
        guard let imageData = image.jpegData(compressionQuality: 0.8) else { throw URLError(.cannotDecodeContentData) }
        var body = Data()
        body.appendString("--\(boundary)\r\n")
        body.appendString("Content-Disposition: form-data; name=\"image\"; filename=\"produce.jpg\"\r\n")
        body.appendString("Content-Type: image/jpeg\r\n\r\n")
        body.append(imageData)
        body.appendString("\r\n--\(boundary)--\r\n")
        request.httpBody = body
        let (data, _) = try await URLSession.shared.data(for: request)
        let response = try JSONDecoder().decode(AnalyzeImageResponse.self, from: data)
        guard response.success, let diagnosis = response.data else { throw URLError(.badServerResponse) }
        return diagnosis
    }

    func callBob(produceInfo: DiagnosisData?, demoMode: Bool) async throws {
        guard let url = URL(string: "\(backendURL)/api/call-bob") else { throw URLError(.badURL) }
        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("true", forHTTPHeaderField: "ngrok-skip-browser-warning")
        var body: [String: Any] = ["demoMode": demoMode]
        if let info = produceInfo {
            body["produceInfo"] = [
                "status": info.status,
                "severity": info.severity,
                "summary": info.summary ?? "",
                "produceType": info.produceType ?? "Produce"
            ]
        }
        request.httpBody = try? JSONSerialization.data(withJSONObject: body)
        _ = try await URLSession.shared.data(for: request)
    }

    func fetchTranscripts() async throws -> [TranscriptEntry] {
        guard let url = URL(string: "\(backendURL)/api/transcripts") else { throw URLError(.badURL) }
        var request = URLRequest(url: url)
        request.setValue("true", forHTTPHeaderField: "ngrok-skip-browser-warning")
        let (data, _) = try await URLSession.shared.data(for: request)
        return (try JSONDecoder().decode(TranscriptsResponse.self, from: data)).data
    }

    func clearTranscripts() async throws {
        guard let url = URL(string: "\(backendURL)/api/transcripts") else { return }
        var request = URLRequest(url: url)
        request.httpMethod = "DELETE"
        _ = try await URLSession.shared.data(for: request)
    }
}

private extension Data {
    mutating func appendString(_ s: String) {
        if let d = s.data(using: .utf8) { append(d) }
    }
}
