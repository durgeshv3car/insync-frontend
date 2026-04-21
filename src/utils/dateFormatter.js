export function formatDate(dateStr) {
  if (!dateStr || dateStr === "All Time") return dateStr;

  // Handle YYYY/MM (Monthly format)
  if (typeof dateStr === "string" && dateStr.length === 7 && dateStr.includes("/")) {
    const [year, month] = dateStr.split("/");
    return `${month}-${year}`;
  }
  
  // Handle YYYY/MM/DD or YYYY-MM-DD
  const normalizedDateStr = dateStr.includes("/") ? dateStr.replace(/\//g, "-") : dateStr;
  const date = new Date(normalizedDateStr);
  
  if (isNaN(date.getTime())) return dateStr;
  
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  
  return `${day}-${month}-${year}`;
}
