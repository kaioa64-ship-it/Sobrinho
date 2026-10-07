import { getAccessToken } from './firebase';

export interface DriveFileItem {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  thumbnailLink?: string;
  createdTime?: string;
  size?: string;
}

/**
 * Uploads a file (Blob, Base64 or string) to Google Drive using multipart upload
 */
export async function uploadToGoogleDrive(params: {
  name: string;
  mimeType: string;
  data: Blob | string;
  description?: string;
}): Promise<DriveFileItem> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado no Google Drive. Faça login primeiro.');
  }

  const metadata = {
    name: params.name,
    mimeType: params.mimeType,
    description: params.description || 'Criado via Coagro Agro Studio',
  };

  const boundary = '-------314159265358979323846';
  const delimiter = `\r\n--${boundary}\r\n`;
  const closeDelimiter = `\r\n--${boundary}--`;

  let fileContentBlob: Blob;
  if (typeof params.data === 'string') {
    if (params.data.startsWith('data:')) {
      // It's a data URL
      const response = await fetch(params.data);
      fileContentBlob = await response.blob();
    } else {
      fileContentBlob = new Blob([params.data], { type: params.mimeType });
    }
  } else {
    fileContentBlob = params.data;
  }

  const metadataPart = new Blob([
    delimiter,
    'Content-Type: application/json; charset=UTF-8\r\n\r\n',
    JSON.stringify(metadata),
    delimiter,
    `Content-Type: ${params.mimeType}\r\n\r\n`,
  ]);

  const multipartRequestBody = new Blob([
    metadataPart,
    fileContentBlob,
    new Blob([closeDelimiter]),
  ]);

  const response = await fetch(
    'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,mimeType,webViewLink,thumbnailLink,createdTime,size',
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': `multipart/related; boundary=${boundary}`,
      },
      body: multipartRequestBody,
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Falha no upload para o Google Drive: ${response.status} - ${errorText}`);
  }

  const result = await response.json();
  return result as DriveFileItem;
}

/**
 * List files created or accessible by this app in Google Drive
 */
export async function listGoogleDriveFiles(): Promise<DriveFileItem[]> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado.');
  }

  const query = encodeURIComponent("trashed = false");
  const fields = encodeURIComponent("files(id, name, mimeType, webViewLink, thumbnailLink, createdTime, size)");
  const orderBy = encodeURIComponent("createdTime desc");

  const response = await fetch(
    `https://www.googleapis.com/drive/v3/files?q=${query}&fields=${fields}&orderBy=${orderBy}&pageSize=30`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`Erro ao listar arquivos do Google Drive: ${errText}`);
  }

  const data = await response.json();
  return (data.files || []) as DriveFileItem[];
}

/**
 * Deletes a file from Google Drive.
 * Note: Per Google Workspace skill rules, this MUST only be called after explicit user confirmation!
 */
export async function deleteFromGoogleDrive(fileId: string): Promise<void> {
  const token = await getAccessToken();
  if (!token) {
    throw new Error('Usuário não autenticado.');
  }

  const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok && response.status !== 204) {
    const err = await response.text();
    throw new Error(`Falha ao excluir arquivo do Google Drive: ${err}`);
  }
}
