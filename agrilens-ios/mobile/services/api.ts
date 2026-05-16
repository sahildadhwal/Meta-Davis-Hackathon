// API client for AgriLens backend
// All calls go through backendUrl which is configurable

export async function analyzeImage(imageUri: string, backendUrl: string): Promise<any> {
  const formData = new FormData();
  const filename = imageUri.split('/').pop() || 'image.jpg';
  const match = /\.(\w+)$/.exec(filename);
  const type = match ? `image/${match[1]}` : 'image/jpeg';

  formData.append('image', { uri: imageUri, name: filename, type } as any);

  const response = await fetch(`${backendUrl}/api/analyze-image`, {
    method: 'POST',
    body: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  if (!response.ok) throw new Error(`Analysis failed: ${response.status}`);
  return response.json();
}

export async function callBob(demoMode: boolean, produceInfo: any, backendUrl: string): Promise<any> {
  const response = await fetch(`${backendUrl}/api/call-bob`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ demoMode, produceInfo }),
  });
  if (!response.ok) throw new Error(`Call failed: ${response.status}`);
  return response.json();
}

export async function getTranscripts(backendUrl: string): Promise<any> {
  const response = await fetch(`${backendUrl}/api/transcripts`);
  return response.json();
}
