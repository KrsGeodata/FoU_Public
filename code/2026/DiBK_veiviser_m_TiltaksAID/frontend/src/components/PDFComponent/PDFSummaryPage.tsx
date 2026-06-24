import { pdf } from "@react-pdf/renderer"
import { useLocation } from "react-router-dom"
import { MyPDFDocument } from "./MyPDFDocument"
import { Link } from "react-router-dom"
import type { SummaryState } from "../SummaryComponent/SummaryTypes"
import { MyRawDataSummary } from "./MyRawDataSummary"
import JSZip from "jszip"
import { useState } from "react"

const PDFSummaryPage = () => {
  const location = useLocation();
  const summary = location.state as SummaryState | null;
  const [isDownloading, setIsDownloading] = useState(false);

  if (!summary) {
    return (
      <div className="h-screen w-screen flex flex-col gap-4 items-center justify-center bg-secondary">
        <p className="text-black">Ingen sammendrag funnet. Fullfør undersøkelsen først.</p>
        <Link
          to="/sammendrag"
          className="bg-secondary text-primary border-2 border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline"
        >
          Tilbake til sammendrag
        </Link>
      </div>
    );
  }

  const downloadBothPdfs = async () => {
    setIsDownloading(true);

    try {
      const reportBlob = await pdf(<MyPDFDocument summary={summary} />).toBlob();
      const rawDataBlob = await pdf(<MyRawDataSummary summary={summary} />).toBlob();

      const zip = new JSZip();
      zip.file('Tiltak_sammendrag.pdf', reportBlob);
      zip.file('Rådata_sammendrag.pdf', rawDataBlob);

      const zipBlob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(zipBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'PDF_sammendrag.zip';
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={downloadBothPdfs}
      disabled={isDownloading}
      className="bg-secondary text-primary border-primary px-7 py-2.5 text-base font-medium cursor-pointer hover:underline disabled:cursor-not-allowed disabled:opacity-60"
    >
      {isDownloading ? 'Genererer ZIP...' : 'Last ned begge PDF-er (ZIP)'}
    </button>
  );
};

export default PDFSummaryPage;