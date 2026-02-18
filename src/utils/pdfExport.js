import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const downloadDashboardPDF = async (
  elementRef,
  title = "Dashboard Report",
  dateRangeText = ""
) => {
  if (!elementRef || !elementRef.current) return;

  const element = elementRef.current;

  try {
    const canvas = await html2canvas(element, {
      scale: 1.5,
      useCORS: true,
      logging: false,
      backgroundColor: "#f8f9fa",
    });

    const imgData = canvas.toDataURL("image/jpeg", 0.8);
    const pdf = new jsPDF("p", "mm", "a4");

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const headerHeight = 20; // 🔥 header space

    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    const currentDate = new Date().toLocaleDateString();

    const logoUrl = "/images/login_logo.png";
    const logoImage = await loadImageAsBase64(logoUrl);

    let heightLeft = imgHeight;
    let position = headerHeight;

    const addHeader = () => {
      // 🔥 Logo (Top Left)
      pdf.addImage(
        logoImage,
        "PNG",
        10,      // left margin
        5,       // top margin
        25,      // width
        12       // height
      );

      // 🔥 Date (Top Right)
      pdf.setFontSize(10);
      pdf.text(
        `Generated on: ${currentDate}`,
        pdfWidth - 10,
        12,
        { align: "right" }
      );
    };

    // ---------- First Page ----------
    addHeader();

    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);

    heightLeft -= pdfHeight;

    // ---------- Additional Pages ----------
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight + headerHeight;
      pdf.addPage();

      addHeader();

      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);

      heightLeft -= pdfHeight;
    }

    pdf.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  }
};


// Helper
const loadImageAsBase64 = (url) => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = url;
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0);
      resolve(canvas.toDataURL("image/png"));
    };
  });
};
