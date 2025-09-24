// src/app/api/architect/add-custom-product/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { UsageRights, Role } from '@prisma/client';
import { getOrCreateProjectFolders, uploadFileToDrive } from '@/lib/googleDriveService';
import { IncomingForm } from 'formidable';
import fs from 'fs';
import { Readable } from 'stream';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// Helper para obter o Utilizador (Arquiteto) e os dados do seu Projeto
async function getRequesterAndProjectData(indicationId: string): Promise<{ userId: string, officeName: string, projectName: string } | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  if (!tokenCookie) return null;

  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    const userId = (payload as { userId: string }).userId;

    // Precisamos de todos estes dados para construir a estrutura de pastas do Drive
    const indication = await prisma.indication.findUnique({
      where: { id: indicationId, architectId: userId }, // Garante que o projeto é do arquiteto
      include: {
        architect: {
          include: {
            office: { select: { name: true } }
          }
        },
        client: { select: { name: true } }
      }
    });

    if (!indication || !indication.architect.office) return null;
    
    return { 
      userId: userId, 
      officeName: indication.architect.office.name,
      projectName: indication.client.name // Usamos o nome do cliente como "Nome da Obra" [cite: 74]
    };
  } catch (e) {
    return null;
  }
}

// Desativar o bodyParser
export const config = {
  api: {
    bodyParser: false,
  },
};

// Função de parse do Formidable
async function parseFormData(request: Request): Promise<{ fields: any, file: any }> {
  const req = request as any;
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();
    form.parse(req, (err, fields, files) => {
      if (err) return reject(err);
      const file = files.file ? (Array.isArray(files.file) ? files.file[0] : files.file) : null;
      resolve({ fields: fields as any, file: file as any });
    });
  });
}

export async function POST(request: Request) {
  try {
    // 2. Parse do Formulário (Ficheiro + Metadados)
    const { fields, file } = await parseFormData(request);
    
    if (!file) {
      return NextResponse.json({ message: 'Nenhum ficheiro enviado.' }, { status: 400 });
    }

    // 3. Validar Metadados (que vêm do formulário)
    const indicationId = fields.indicationId[0] as string;
    const productName = fields.productName[0] as string;
    const notes = fields.notes[0] as string || undefined;
    const usageRights = fields.usageRights[0] as UsageRights;

    // 4. Segurança: O utilizador pode fazer upload para este projeto?
    const projectData = await getRequesterAndProjectData(indicationId);
    if (!projectData) {
      return NextResponse.json({ message: 'Acesso não autorizado ou Projeto não encontrado.' }, { status: 403 });
    }

    // 5. Criar Pastas no Google Drive (ex: /[Escritorio]/[Obra]/02_Projetos_CAD/)
    const finalFolderId = await getOrCreateProjectFolders(
      projectData.officeName, 
      projectData.projectName,
      "02_Projetos_CAD" // Conforme a política [cite: 76]
    );

    // 6. Fazer Upload do Ficheiro para o Drive
    const fileStream = fs.createReadStream(file.filepath);
    const driveResponse = await uploadFileToDrive(
      file.originalFilename, // Nome original
      file.mimetype,
      fileStream as Readable,
      finalFolderId
    );

    // 7. Salvar tudo no nosso Banco Prisma (Transação)
    const newProduct = await prisma.product.create({
      data: {
        name: productName,
        notes: notes,
        indicationId: indicationId,
        catalogItemId: null, // NULO = Produto Customizado
        assets: {
          create: [
            { 
              name: file.originalFilename || productName,
              url: driveResponse.webViewLink!, // Link do Drive
              status: 'PENDING_VALIDATION',
              usageRights: usageRights,
              uploadedById: projectData.userId, // ID do arquiteto
            }
          ]
        }
      },
    });

    return NextResponse.json({ message: 'Produto customizado e ficheiro SKP enviados para validação!', product: newProduct }, { status: 201 });

  } catch (error) {
    console.error('Upload Custom Product API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor durante o upload.' }, { status: 500 });
  }
}