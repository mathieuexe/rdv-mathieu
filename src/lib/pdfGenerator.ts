import { PDFDocument, rgb, StandardFonts, PDFFont, Color } from "pdf-lib";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

export async function generateContactPdf(data: {
  civility: string;
  email: string;
  phone?: string;
  subject: string;
  message: string;
}) {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595.28, 841.89]); // A4 size
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const margin = 50;
  let cursorY = height - margin;

  const drawText = (text: string, options: { font?: PDFFont; size?: number; color?: Color; align?: "left" | "right" | "center" } = {}) => {
    const fontSize = options.size || 11;
    const currentFont = options.font || font;
    
    // Simple text wrapping
    const words = text.split(' ');
    let line = '';
    
    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const testWidth = currentFont.widthOfTextAtSize(testLine, fontSize);
      if (testWidth > width - 2 * margin && n > 0) {
        let x = margin;
        if (options.align === "right") {
           x = width - margin - currentFont.widthOfTextAtSize(line, fontSize);
        } else if (options.align === "center") {
           x = margin + (width - 2 * margin - currentFont.widthOfTextAtSize(line, fontSize)) / 2;
        }
        page.drawText(line.trim(), {
          x,
          y: cursorY,
          size: fontSize,
          font: currentFont,
          color: options.color || rgb(0, 0, 0),
        });
        line = words[n] + ' ';
        cursorY -= fontSize * 1.5;
      } else {
        line = testLine;
      }
    }
    
    if (line.trim().length > 0) {
      let x = margin;
      if (options.align === "right") {
         x = width - margin - currentFont.widthOfTextAtSize(line, fontSize);
      } else if (options.align === "center") {
         x = margin + (width - 2 * margin - currentFont.widthOfTextAtSize(line, fontSize)) / 2;
      }
      page.drawText(line.trim(), {
        x,
        y: cursorY,
        size: fontSize,
        font: currentFont,
        color: options.color || rgb(0, 0, 0),
      });
      cursorY -= fontSize * 1.5;
    }
  };

  // Header
  drawText("GenDoc", { font: boldFont, size: 14 });
  cursorY -= 20;

  // Date (right aligned)
  const currentDate = format(new Date(), "d MMMM yyyy", { locale: fr });
  drawText(`Le ${currentDate}`, { align: "right" });
  cursorY -= 40;

  // Subject
  drawText(`Objet : ${data.subject}`, { font: boldFont });
  cursorY -= 20;

  // Greeting
  drawText(`${data.civility},`);
  cursorY -= 10;

  // Body
  drawText("Nous accusons bonne réception de votre demande formulée via notre formulaire de contact en ligne. Vous trouverez ci-dessous le récapitulatif des informations que vous nous avez transmises :");
  cursorY -= 20;

  // Recap
  drawText("Coordonnées de contact :", { font: boldFont });
  drawText(`E-mail : ${data.email}`);
  if (data.phone) {
    drawText(`Téléphone : ${data.phone}`);
  }
  cursorY -= 20;

  drawText("Votre message :", { font: boldFont });
  // Split message by newlines to preserve formatting
  const messageLines = data.message.split("\n");
  for (const line of messageLines) {
    if (line.trim().length === 0) {
      cursorY -= 10;
    } else {
      drawText(line);
    }
  }
  cursorY -= 30;

  // Footer
  drawText("Nous traiterons votre demande dans les plus brefs délais et reviendrons vers vous rapidement.");
  cursorY -= 20;

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString("base64");
}