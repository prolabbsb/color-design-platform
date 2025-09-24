// src/lib/googleDriveService.ts
import { google } from 'googleapis';
import { Readable } from 'stream';

// Define as permissões que o nosso "robô" (Service Account) precisa
const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

/**
 * Prepara um cliente de API do Google Drive autenticado.
 */
function getDriveClient() {
  // Verifica se as credenciais essenciais estão presentes
  if (!process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL || !process.env.GOOGLE_PRIVATE_KEY) {
    throw new Error('As credenciais da Google Service Account (EMAIL ou KEY) não estão definidas no .env');
  }

  // O .env armazena a chave com "\\n" em vez de quebras de linha reais.
  // Precisamos de formatar a chave privada de volta para o formato PEM.
  const privateKey = process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, '\n');

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: privateKey,
    },
    scopes: SCOPES,
  });

  // Retorna um cliente 'drive' autenticado
  return google.drive({ version: 'v3', auth });
}

/**
 * Procura por uma pasta dentro de uma pasta-pai. Se não encontrar, cria uma nova.
 * Esta é a função que usaremos para construir a estrutura de pastas da sua política.
 */
async function findOrCreateFolder(drive: any, folderName: string, parentFolderId: string): Promise<string> {
  // 1. Tenta encontrar a pasta
  const query = `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and '${parentFolderId}' in parents and trashed=false`;
  
  const res = await drive.files.list({
    q: query,
    fields: 'files(id, name)',
    spaces: 'drive',
  });

  if (res.data.files && res.data.files.length > 0) {
    // 2. Encontrou a pasta, retorna o ID dela
    return res.data.files[0].id!;
  }

  // 3. Não encontrou, cria a pasta
  const fileMetadata = {
    name: folderName,
    mimeType: 'application/vnd.google-apps.folder',
    parents: [parentFolderId],
  };

  const newFolder = await drive.files.create({
    resource: fileMetadata,
    fields: 'id',
  });

  return newFolder.data.id!;
}

/**
 * Constrói a hierarquia de pastas exigida pela política (ex: /Escritorio/Obra/01_Contratos)
 * e retorna o ID da pasta final.
 */
export async function getOrCreateProjectFolders(officeName: string, projectName: string, subFolder: string): Promise<string> {
  const drive = getDriveClient();
  const rootFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID!;

  // Etapa 1: Encontra/Cria a pasta do Escritório (ex: /[Nome do Escritório])
  const officeFolderId = await findOrCreateFolder(drive, officeName, rootFolderId);

  // Etapa 2: Encontra/Cria a pasta da Obra (ex: /[Nome da Obra])
  const projectFolderId = await findOrCreateFolder(drive, projectName, officeFolderId);

  // Etapa 3: Encontra/Cria a sub-pasta (ex: /01_Contratos)
  const finalFolderId = await findOrCreateFolder(drive, subFolder, projectFolderId);
  
  return finalFolderId;
}


/**
 * Faz o upload de um ficheiro (stream) para uma pasta específica no Google Drive.
 */
export async function uploadFileToDrive(fileName: string, mimeType: string, fileStream: Readable, folderId: string) {
  const drive = getDriveClient();

  const media = {
    mimeType: mimeType,
    body: fileStream,
  };

  const fileMetadata = {
    name: fileName,
    parents: [folderId],
  };

  const newFile = await drive.files.create({
    resource: fileMetadata,
    media: media,
    fields: 'id, webViewLink, name', // O que queremos que a API do Google nos retorne
  });

  // Retorna o ID do ficheiro e o link "visualizável" (para salvarmos no nosso DB Prisma)
  return newFile.data; 
}