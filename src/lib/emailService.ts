// src/lib/emailService.ts
import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import puppeteer from 'puppeteer'; // 1. Importar o Puppeteer
import { Office, User } from '@prisma/client';
import { format } from 'date-fns';

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: parseInt(process.env.EMAIL_PORT || "465"),
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

interface EmailData {
  user: User;
  office: Office;
  contactEmail: string;
}

// Helper para garantir que o diretório exista
function ensureDirectoryExistence(filePath: string) {
  const dirname = path.dirname(filePath);
  if (fs.existsSync(dirname)) {
    return true;
  }
  fs.mkdirSync(dirname, { recursive: true });
}

// --- FUNÇÃO DE PDF TOTALMENTE REESCRITA ---
async function generatePdfFromHtml(data: EmailData): Promise<string> {
  
  // 1. Carregar o template HTML
  const templatePath = path.join(process.cwd(), 'assets', 'contract-template.html');
  let htmlContent = fs.readFileSync(templatePath, 'utf8');
  
  // 2. Definir os dados para preenchimento
  const officeAddress = `${data.office.street || ''}, ${data.office.city || ''} - ${data.office.state || ''}`;
  const acceptanceDate = format(new Date(data.user.agreedToTermsAt!), 'dd/MM/yyyy \'às\' HH:mm');

  // 3. Substituir os placeholders pelos dados reais
  htmlContent = htmlContent
    .replace('{{NOME_PROFISSIONAL}}', data.user.name)
    .replace('{{CPF_CNPJ}}', data.office.cnpj || 'N/A')
    .replace('{{ENDERECO}}', officeAddress)
    .replace('{{EMAIL_CONTATO}}', data.contactEmail)
    .replace('{{IP_ADDRESS}}', data.user.ipAddress || 'N/A')
    .replace('{{DATA_ACEITE}}', acceptanceDate);

  // 4. Iniciar o Puppeteer
  const browser = await puppeteer.launch({ 
    args: ['--no-sandbox', '--disable-setuid-sandbox'] // Necessário para rodar em servidores Linux/VPS
  });
  const page = await browser.newPage();
  
  // 5. Carregar o nosso HTML preenchido
  await page.setContent(htmlContent, { waitUntil: 'networkidle0' });
  
  // 6. Gerar o PDF
  const pdfBuffer = await page.pdf({
    format: 'A4',
    printBackground: true, // Garante que o CSS (cores, etc.) seja impresso
    margin: {
      top: '2cm',
      right: '1.5cm',
      bottom: '2cm',
      left: '1.5cm',
    }
  });

  await browser.close();

  // 7. Salvar o PDF no servidor (como você pediu)
  const filePath = path.join(process.cwd(), 'uploads', 'contratos', data.office.id, 'contrato_gerado.pdf');
  ensureDirectoryExistence(filePath); 
  fs.writeFileSync(filePath, pdfBuffer);
  
  return filePath;
}


// A função de envio de e-mail (agora chama a nova função de PDF)
export async function sendContractEmail(data: EmailData) {
  try {
    // 1. Gerar e SALVAR o PDF (agora a partir do HTML)
    const savedPdfPath = await generatePdfFromHtml(data);

    // 2. Anexar o PDF salvo localmente
    const mailOptions = {
      from: `"Color Design Parcerias" <${process.env.EMAIL_FROM_ADDRESS}>`,
      to: data.user.email,
      subject: 'Bem-vindo ao Programa de Parceria Color Design!',
      html: `... (O seu HTML de e-mail aqui) ...`,
      attachments: [
        {
          filename: `Contrato_Adesao_${data.user.name.replace(' ', '_')}.pdf`,
          path: savedPdfPath, // Usa o caminho do ficheiro salvo
          contentType: 'application/pdf',
        },
      ],
    };

    await transporter.sendMail(mailOptions);
    console.log(`E-mail de contrato preenchido enviado para: ${data.user.email}`);
    
    return savedPdfPath; // Retorna o caminho para a API de registo

  } catch (error) {
    console.error("Falha ao enviar e-mail de contrato:", error);
    return null; 
  }
}