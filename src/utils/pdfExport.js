import jsPDF from "jspdf";
import html2canvas from "html2canvas";

export const downloadDashboardPDF = async (elementRef, title = "Dashboard Report", dateRangeText = "") => {
  if (!elementRef || !elementRef.current) return;

  const element = elementRef.current;
  
  // Optional: add a temporary class or style to optimize for print if needed
  // element.classList.add("pdf-export-mode");

  try {
    const canvas = await html2canvas(element, {
      scale: 1.5, // Reduced scale for smaller file size from 2
      useCORS: true,
      logging: false,
      backgroundColor: "#f8f9fa"
    });

    // Use JPEG with 0.8 quality instead of PNG for massive size reduction
    const imgData = canvas.toDataURL("image/jpeg", 0.8);
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Calculate image dimensions to fit PDF width
    const imgProps = pdf.getImageProperties(imgData);
    const imgWidth = pdfWidth;
    const imgHeight = (imgProps.height * imgWidth) / imgProps.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add subsequent pages if content overflows
    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`${title.replace(/\s+/g, "_").toLowerCase()}.pdf`);
  } catch (error) {
    console.error("Error generating PDF:", error);
  } finally {
    // element.classList.remove("pdf-export-mode");
  }
};
