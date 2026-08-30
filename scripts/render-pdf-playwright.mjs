import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

const pdfPath = '/Users/edv/.gemini/antigravity/brain/ba4454e8-1f64-4e5e-a90b-0e505fa23824/.user_uploaded/media_1787711413852.pdf';
const outDir = '/Users/edv/.gemini/antigravity/scratch/carlophillips-site/test_reports/pdf-rendered';
fs.mkdirSync(outDir, { recursive: true });

const pdfData = fs.readFileSync(pdfPath);
const base64Pdf = pdfData.toString('base64');

const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js"></script>
</head>
<body style="margin: 0; background: #000;">
  <canvas id="pdf-canvas"></canvas>
  <script>
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
    const pdfData = atob("${base64Pdf}");
    const rawLength = pdfData.length;
    const array = new Uint8Array(new ArrayBuffer(rawLength));
    for (let i = 0; i < rawLength; i++) {
      array[i] = pdfData.charCodeAt(i);
    }

    let pdfDoc = null;
    window.loadPdf = async () => {
      pdfDoc = await pdfjsLib.getDocument({ data: array }).promise;
      return pdfDoc.numPages;
    };

    window.renderPage = async (num) => {
      const page = await pdfDoc.getPage(num);
      const viewport = page.getViewport({ scale: 2.0 });
      const canvas = document.getElementById('pdf-canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      await page.render({ canvasContext: context, viewport }).promise;
      return { width: viewport.width, height: viewport.height };
    };
  </script>
</body>
</html>
`;

async function main() {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  await page.setContent(htmlContent);
  await page.waitForFunction(() => typeof window.loadPdf === 'function');
  const numPages = await page.evaluate(() => window.loadPdf());
  console.log(`Total pages: ${numPages}`);

  for (let i = 1; i <= numPages; i++) {
    const dim = await page.evaluate((n) => window.renderPage(n), i);
    const canvas = await page.$('#pdf-canvas');
    const outFile = path.join(outDir, `page-${String(i).padStart(2, '0')}.png`);
    await canvas.screenshot({ path: outFile });
    console.log(`Rendered page ${i}/${numPages} -> ${outFile}`);
  }

  await browser.close();
  console.log('All PDF pages rendered successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
