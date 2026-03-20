import html2canvas from 'html2canvas';
import { showInfo } from '../interactions/dialogs.js';

export async function exportPNG() {
  const slide = document.getElementById('slide');
  const savedTransform = slide.style.transform;
  slide.style.transform = 'none';
  try {
    const canvas = await html2canvas(slide, { scale: 2, useCORS: true });
    canvas.toBlob((blob) => {
      if (!blob) {
        showInfo('Export failed.');
        return;
      }
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'timeline.png';
      a.click();
      URL.revokeObjectURL(a.href);
    }, 'image/png');
  } catch (err) {
    console.error('Export failed:', err);
    showInfo('Export failed. See console for details.');
  } finally {
    slide.style.transform = savedTransform;
  }
}
