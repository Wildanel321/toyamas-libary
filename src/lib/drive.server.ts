// Server-only Google Drive helpers via Lovable connector gateway.
const GATEWAY = "https://connector-gateway.lovable.dev/google_drive/drive/v3";

function authHeaders() {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const GOOGLE_DRIVE_API_KEY = process.env.GOOGLE_DRIVE_API_KEY;
  if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");
  if (!GOOGLE_DRIVE_API_KEY) throw new Error("GOOGLE_DRIVE_API_KEY is not configured");
  return {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    "X-Connection-Api-Key": GOOGLE_DRIVE_API_KEY,
  };
}

export interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  description?: string;
  thumbnailLink?: string;
  modifiedTime?: string;
}

export async function listPdfsInFolder(folderId?: string): Promise<DriveFile[]> {
  const baseQuery = "mimeType='application/pdf' and trashed=false";
  if (folderId && !/^[a-zA-Z0-9_-]{10,80}$/.test(folderId)) {
    throw new Error("Invalid Google Drive folder ID format");
  }
  const q = folderId ? `${baseQuery} and '${folderId}' in parents` : baseQuery;
  const url = new URL(`${GATEWAY}/files`);
  url.searchParams.set("q", q);
  url.searchParams.set("fields", "files(id,name,mimeType,size,description,thumbnailLink,modifiedTime)");
  url.searchParams.set("pageSize", "200");
  url.searchParams.set("orderBy", "modifiedTime desc");

  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Drive list failed [${res.status}]: ${body}`);
  }
  const data = (await res.json()) as { files?: DriveFile[] };
  return data.files ?? [];
}

export async function streamPdf(fileId: string): Promise<Response> {
  const url = `${GATEWAY}/files/${encodeURIComponent(fileId)}?alt=media`;
  return fetch(url, { headers: authHeaders() });
}

export async function getFileMeta(fileId: string): Promise<DriveFile> {
  const url = new URL(`${GATEWAY}/files/${encodeURIComponent(fileId)}`);
  url.searchParams.set("fields", "id,name,mimeType,size,description,thumbnailLink,modifiedTime");
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Drive meta failed [${res.status}]`);
  return (await res.json()) as DriveFile;
}
