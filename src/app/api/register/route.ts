// src/app/api/register/route.ts
import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import prisma from '@/lib/prisma';
import { ContactType, ArchitectOfficeRole, DocumentType, UsageRights } from '@prisma/client';
import { sendContractEmail } from '@/lib/emailService';

// Schema de validação COMPLETO E CORRETO
const registrationSchema = z.object({
  userData: z.object({
    name: z.string().min(3),
    email: z.string().email(),
    password: z.string().min(6), // A validação está aqui
    cau: z.string().min(3),
  }),
  officeData: z.object({
    name: z.string().min(3),
    cnpj: z.string().min(11),
    street: z.string().min(3),
    city: z.string().min(2),
    state: z.string().min(2),
    zipCode: z.string().min(8),
  }),
  contactData: z.array(z.object({
    type: z.nativeEnum(ContactType),
    value: z.string().min(1),
  })).min(1),
});

export async function POST(request: Request) {
  try {
    const headersList = await headers(); 
    const ipAddress = headersList.get('x-forwarded-for') || headersList.get('remote-addr');
    
    const body = await request.json();
    // O Zod agora irá falhar (corretamente) se a senha estiver em falta
    const { userData, officeData, contactData } = registrationSchema.parse(body);

    // Verificações de duplicidade
    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email: userData.email }, { cau: userData.cau }] }});
    if (existingUser) {
      const message = existingUser.email === userData.email ? 'Este e-mail já está em uso.' : 'Este CAU já está cadastrado.';
      return NextResponse.json({ message }, { status: 409 });
    }
    const existingOffice = await prisma.office.findUnique({ where: { cnpj: officeData.cnpj } });
    if (existingOffice) {
      return NextResponse.json({ message: 'Este CPF/CNPJ já está vinculado a outro escritório.' }, { status: 409 });
    }

    // Esta linha agora é segura, pois o Zod garantiu que 'userData.password' existe
    const hashedPassword = await bcrypt.hash(userData.password, 10);
    const agreedToTermsAt = new Date();

    let newUser;
    let newOffice;

    // Transação Prisma
    await prisma.$transaction(async (tx) => {
      newOffice = await tx.office.create({
        data: {
          ...officeData,
          contacts: { create: contactData.map(c => ({...c})) },
        },
      });
      newUser = await tx.user.create({
        data: {
          ...userData, // Contém name, email, cau
          password: hashedPassword,
          role: 'ARCHITECT',
          status: 'PENDING_APPROVAL',
          architectRole: 'MANAGER',
          ipAddress: ipAddress,
          agreedToTermsAt: agreedToTermsAt,
          officeId: newOffice!.id, 
        },
      });
    });

    if (!newUser || !newOffice) {
      throw new Error("Falha na transação de criação de utilizador/escritório.");
    }

    // Chamar o Serviço de E-mail (que salva o PDF localmente)
    const contactEmail = contactData.find(c => c.type === 'EMAIL_MAIN')?.value || newUser.email;
    const savedPdfPath = await sendContractEmail({
      user: newUser,
      office: newOffice,
      contactEmail: contactEmail
    });

    // Guardar o PDF Gerado no nosso Banco de Dados
    if (savedPdfPath) {
      await prisma.document.create({
        data: {
          name: "Contrato de Adesão (Gerado)",
          type: DocumentType.CONTRACT,
          url: savedPdfPath, // O caminho do ficheiro local
          status: 'PENDING_VALIDATION', 
          usageRights: 'INTERNAL_USE_ONLY',
          uploadedById: newUser.id,
          userId: newUser.id,
        }
      });
    }
    
    return NextResponse.json({ message: 'Adesão realizada! Sua conta está aguardando aprovação.' }, { status: 201 });

  } catch (error) {
    // Agora, se o Zod falhar (ex: senha curta), ele cairá aqui
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.issues[0]?.message || 'Dados inválidos.' }, { status: 400 });
    }
    // O erro 'bcrypt' não deve mais acontecer, mas se acontecer, cairá aqui
    console.error('Register API Error:', error);
    return NextResponse.json({ message: 'Ocorreu um erro no servidor.' }, { status: 500 });
  }
}