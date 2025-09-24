// src/app/api/architect/upload-contract/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { DocumentType, UsageRights } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// Helper para obter o Utilizador (Arquiteto) e o seu Escritório
async function getRequesterData(): Promise<{ userId: string, officeId: string } | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  if (!tokenCookie) return null;

  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    const userId = (payload as { userId: string }).userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { officeId: true }
    });

    if (!user || !user.officeId) return null;
    
    return { userId: user.id, officeId: user.officeId };
  } catch (e) {
    return null;
  }
}

// Helper para salvar o stream do ficheiro no disco
async function saveFileLocally(file: File, targetPath: string): Promise<void> {
  const fileBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(fileBuffer);
  
  const dirname = path.dirname(targetPath);
  if (!fs.existsSync(dirname)) {
    fs.mkdirSync(dirname, { recursive: true });
  }
  
  fs.writeFileSync(targetPath, buffer);
}

export async function POST(request: Request) {
  try {
    const userData = await getRequesterData();
    if (!userData) {
      return NextResponse.json({ message: 'Acesso não autorizado ou escritório não encontrado.' }, { status: 401 });
    }

    // 1. Parse do Formulário (Método Nativo do Next.js)
    const formData = await request.formData();
    
    const file = formData.get('file') as File | null;
    const documentName = formData.get('documentName') as string | null;
    const usageRights = formData.get('usageRights') as UsageRights | null;

    if (!file) {
      return NextResponse.json({ message: 'Nenhum ficheiro enviado.' }, { status: 400 });
    }
    if (!documentName || !usageRights) {
      return NextResponse.json({ message: 'Metadados (nome e direitos de uso) em falta.' }, { status: 400 });
    }
    
    // 2. Definir o caminho de destino (O SEU REQUISITO 2: Substituir o ficheiro)
    // (ex: /var/www/uploads/contratos/[office_id]/contrato_assinado.pdf)
    const fileName = `contrato_assinado${path.extname(file.name || '.pdf')}`;
    const targetPath = path.join(process.cwd(), 'uploads', 'contratos', userData.officeId, fileName);

    // 3. Salvar o ficheiro no disco (sobrescrevendo se já existir)
    await saveFileLocally(file, targetPath);

    // 4. Atualizar o registo no Banco de Dados (Upsert)
    const updatedDocument = await prisma.document.upsert({
      where: { 
        userId_type: { // Procura o contrato pertencente a este utilizador
          userId: userData.userId,
          type: DocumentType.CONTRACT
        }
      },
      // Se encontrar, atualiza a URL, o nome e o status (para o Admin validar)
      update: {
        name: documentName,
        url: targetPath, // O novo caminho local
        status: 'PENDING_VALIDATION',
        usageRights: usageRights,
        uploadedById: userData.userId,
      },
      // Se não encontrou o 'contrato_gerado' (o que não deve acontecer), cria um novo registo
      create: {
        name: documentName,
        url: targetPath,
        type: DocumentType.CONTRACT,
        status: 'PENDING_VALIDATION',
        usageRights: usageRights,
        uploadedById: userData.userId,
        userId: userData.userId,
      }
    });

    return NextResponse.json({ message: 'Contrato assinado enviado para análise!', document: updatedDocument }, { status: 201 });

  } catch (error) {
    console.error('Upload Contract API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor durante o upload.' }, { status: 500 });
  }
}