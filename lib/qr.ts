import QRCode from 'qrcode';

export async function generateQrDataUrl(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width: 450,
      margin: 1,
      color: {
        dark: '#4c1d95', // Deep purple brand color
        light: '#ffffff'
      }
    });
  } catch (err) {
    console.error('Error generating QR code:', err);
    return '';
  }
}

export interface QrBadgeOptions {
  qrDataUrl: string;
  companyName?: string;
  companySubtitle?: string;
  clientName?: string;
  machineName: string;
  machineCode: string;
  category?: string;
  phone?: string;
}

/**
 * Generates a complete branded sticker/badge PNG with company name,
 * machine model, client name, code, QR code, and instructions.
 */
export async function generateQrBadgePng(options: QrBadgeOptions): Promise<string> {
  if (typeof window === 'undefined') {
    return options.qrDataUrl;
  }

  const {
    qrDataUrl,
    companyName = 'FAZENDO ESPORTE',
    companySubtitle = 'SFE - Serviços Fazendo Esporte',
    clientName = 'Cliente Fazendo Esporte',
    machineName,
    machineCode,
    category,
    phone = '(21) 99999-5359'
  } = options;

  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const width = 800;
    const height = 1120;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');

    if (!ctx) {
      resolve(qrDataUrl);
      return;
    }

    // Helper for rounded rectangles
    const drawRoundRect = (x: number, y: number, w: number, h: number, r: number) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.lineTo(x + w - r, y);
      ctx.quadraticCurveTo(x + w, y, x + w, y + r);
      ctx.lineTo(x + w, y + h - r);
      ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
      ctx.lineTo(x + r, y + h);
      ctx.quadraticCurveTo(x, y + h, x, y + h - r);
      ctx.lineTo(x, y + r);
      ctx.quadraticCurveTo(x, y, x + r, y);
      ctx.closePath();
    };

    // Helper to wrap text
    const wrapText = (text: string, x: number, y: number, maxWidth: number, lineHeight: number) => {
      const words = text.split(' ');
      let line = '';
      let currentY = y;

      for (let n = 0; n < words.length; n++) {
        const testLine = line + words[n] + ' ';
        const metrics = ctx.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > maxWidth && n > 0) {
          ctx.fillText(line.trim(), x, currentY);
          line = words[n] + ' ';
          currentY += lineHeight;
        } else {
          line = testLine;
        }
      }
      ctx.fillText(line.trim(), x, currentY);
      return currentY;
    };

    // 1. White Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Outer border with subtle shadow effect
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#E2E8F0';
    ctx.strokeRect(10, 10, width - 20, height - 20);

    // 2. Header: Deep Purple Brand Bar
    const headerGrad = ctx.createLinearGradient(0, 0, width, 0);
    headerGrad.addColorStop(0, '#3B0764');
    headerGrad.addColorStop(0.5, '#581C87');
    headerGrad.addColorStop(1, '#7C2D8A');
    ctx.fillStyle = headerGrad;
    ctx.fillRect(10, 10, width - 20, 170);

    // Accent Orange Line below header
    ctx.fillStyle = '#FF6B00';
    ctx.fillRect(10, 180, width - 20, 8);

    // Company Name
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '900 38px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(companyName, width / 2, 80);

    // Company Subtitle & SLA Badge
    ctx.fillStyle = '#FED7AA';
    ctx.font = '700 17px "Inter", "Segoe UI", sans-serif';
    ctx.fillText(companySubtitle.toUpperCase(), width / 2, 115);

    ctx.fillStyle = '#FFEDD5';
    ctx.font = '600 15px "Inter", "Segoe UI", sans-serif';
    ctx.fillText('CENTRAL DE MANUTENÇÃO FITNESS · SLA 24H', width / 2, 145);

    // 3. Client Badge (Empresa / Condomínio)
    if (clientName) {
      ctx.fillStyle = '#FAF5FF';
      drawRoundRect(80, 215, width - 160, 48, 12);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#D8B4FE';
      ctx.stroke();

      ctx.fillStyle = '#6B21A8';
      ctx.font = 'bold 20px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`🏢 ${clientName}`, width / 2, 247);
    }

    // 4. Machine Model / Name (Grande e Nítido)
    ctx.fillStyle = '#0F172A';
    ctx.font = '900 34px "Inter", "Segoe UI", sans-serif';
    ctx.textAlign = 'center';
    const nextY = wrapText(machineName, width / 2, 315, width - 120, 40);

    // Machine Code Badge & Category
    const codeY = nextY + 30;
    const codeText = `CÓDIGO: ${machineCode}` + (category ? `  •  ${category.toUpperCase()}` : '');
    
    ctx.fillStyle = '#0F172A';
    drawRoundRect(width / 2 - 200, codeY - 24, 400, 44, 10);
    ctx.fill();

    ctx.fillStyle = '#F8FAFC';
    ctx.font = 'bold 20px "Courier New", monospace, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(codeText, width / 2, codeY + 6);

    // 5. Draw QR Code in Frame
    const qrImage = new Image();
    qrImage.crossOrigin = 'anonymous';
    qrImage.onload = () => {
      const qrSize = 430;
      const qrX = (width - qrSize) / 2;
      const qrY = codeY + 38;

      // QR Frame background
      ctx.fillStyle = '#F8FAFC';
      drawRoundRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 20);
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = '#CBD5E1';
      ctx.stroke();

      // Draw the QR Code image
      ctx.drawImage(qrImage, qrX, qrY, qrSize, qrSize);

      // 6. Footer Instructions Box
      const footerY = qrY + qrSize + 32;

      ctx.fillStyle = '#F1F5F9';
      drawRoundRect(40, footerY, width - 80, 130, 16);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = '#CBD5E1';
      ctx.stroke();

      // CTA Header
      ctx.fillStyle = '#0F172A';
      ctx.font = '900 21px "Inter", "Segoe UI", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('📸 Aponte a câmera do celular para reportar defeito', width / 2, footerY + 40);

      // Subtitle explanation
      ctx.fillStyle = '#475569';
      ctx.font = '600 15px "Inter", "Segoe UI", sans-serif';
      ctx.fillText('Abertura instantânea sem aplicativo  •  Atendimento técnico em até 24h', width / 2, footerY + 70);

      // Support phone badge
      ctx.fillStyle = '#047857';
      ctx.font = 'bold 18px "Inter", "Segoe UI", sans-serif';
      ctx.fillText(`WhatsApp Suporte: ${phone}`, width / 2, footerY + 104);

      // Return generated PNG
      const dataUrl = canvas.toDataURL('image/png');
      resolve(dataUrl);
    };

    qrImage.onerror = () => {
      resolve(qrDataUrl);
    };

    qrImage.src = qrDataUrl;
  });
}
