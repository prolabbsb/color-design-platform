// src/app/api/architect/upload-contract/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { jwtVerify } from 'jose';
import prisma from '@/lib/prisma';
import { DocumentType, UsageRights } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET!);

// --- FUNÇÃO HELPER CORRIGIDA ---
async function getRequesterData(): Promise<{ userId: string, officeId: string } | null> {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('auth_token');
  if (!tokenCookie) return null;

  try {
    const { payload } = await jwtVerify(tokenCookie.value, JWT_SECRET);
    const userId = (payload as { userId: string }).userId; // 1. Temos o userId do token

    // 2. Buscamos o utilizador no DB SÓ para verificar se ele existe e tem um escritório
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { officeId: true } // Só precisamos do officeId
    });

    // 3. Se o utilizador não existir ou não tiver escritório, falhamos
    if (!user || !user.officeId) return null;
    
    // 4. Retornamos o userId (do token) e o officeId (do DB)
    return { userId: userId, officeId: user.officeId };

  } catch (e) {
    return null;
  }
}
// --- FIM DA CORREÇÃO ---

// Helper para salvar o ficheiro no disco
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
    // Agora userData terá { userId: "...", officeId: "..." }
    const userData = await getRequesterData(); 
    
    if (!userData) {
      return NextResponse.json({ message: 'Acesso não autorizado ou escritório não encontrado.' }, { status: 401 });
    }

    const formData = await request.formData();
    
    const file = formData.get('file') as File | null;
    const documentName = formData.get('documentName') as string | null;
    const usageRights = formData.get('usageRights') as UsageRights | null;

    if (!file || !documentName || !usageRights) {
      return NextResponse.json({ message: 'Dados do formulário em falta (ficheiro, nome ou direitos de uso).' }, { status: 400 });
    }
    
    const fileName = `contrato_assinado${path.extname(file.name || '.pdf')}`;
    const targetPath = path.join(process.cwd(), 'uploads', 'contratos', userData.officeId, fileName);

    await saveFileLocally(file, targetPath);

    // O upsert agora receberá os IDs definidos
    const updatedDocument = await prisma.document.upsert({
      where: { 
        userId_type: { // Usando o índice composto @@unique([userId, type])
          userId: userData.userId,
          type: DocumentType.CONTRACT
        }
      },
      update: {
        name: documentName,
        url: targetPath, 
        status: 'PENDING_VALIDATION',
        usageRights: usageRights,
        uploadedById: userData.userId, // Agora está definido
      },
      create: {
        name: documentName,
        url: targetPath,
        type: DocumentType.CONTRACT,
        status: 'PENDING_VALIDATION',
        usageRights: usageRights,
        uploadedById: userData.userId, // Agora está definido
        userId: userData.userId,       // Agora está definido
      }
    });

    return NextResponse.json({ message: 'Contrato assinado enviado para análise!', document: updatedDocument }, { status: 201 });

  } catch (error) {
    // O erro 'Argument `userId` is missing' não deve mais acontecer
    console.error('Upload Contract API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor durante o upload.' }, { status: 500 });
  }
}