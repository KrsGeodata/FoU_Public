// Top-level routing configuration for the application.
// Defines two routes:
//   "/"           – Main page with the map and survey sidebar
//   "/sammendrag" – Summary/receipt page shown after survey completion
import { Routes, Route } from 'react-router-dom';
import Index from './index'
import Navigator from './Navigator'
import Summary from './components/SummaryComponent/SummaryPresentation'
import PDFSummaryPage from './components/PDFComponent/PDFSummaryPage';

import './App.css'

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<Index />} />

      <Route path="/veiviser" element={<Navigator />} />

      <Route path="/sammendrag" element={<Summary />} />

      <Route path="/PDFSammendrag" element={<PDFSummaryPage />} />

    </Routes>
  );
};

export default App
