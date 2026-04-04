import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchPayments } from '../../store/slices/financialSlice';
import Card, { CardBody, CardHeader } from '../../components/common/Card';
import Button from '../../components/common/Button';
import { FileText, Download, Calendar, Loader2, CheckCircle } from 'lucide-react';
import { toast } from 'react-hot-toast';

const ReportsAdmin = () => {
  const dispatch = useDispatch();
  const { payments, loading } = useSelector(state => state.financial);
  const [generating, setGenerating] = useState(null);

  useEffect(() => {
    dispatch(fetchPayments());
  }, [dispatch]);

  const handleGeneratePDF = async () => {
    if (!payments || payments.length === 0) {
      toast.error("Aucune donnée disponible.");
      return;
    }
    
    // Pour l'exemple, on prend le premier rapport comptable existant ou on en crée un
    try {
      setGenerating('pdf');
      const response = await api.get('comptabilite/', { params: { limit: 1 } });
      const rapportId = response.data.results?.[0]?.id || response.data?.[0]?.id;
      
      if (!rapportId) {
        toast.error("Aucun rapport comptable trouvé.");
        setGenerating(null);
        return;
      }

      window.open(`http://localhost:8000/api/comptabilite/${rapportId}/export_pdf/`, '_blank');
      toast.success("Rapport PDF généré !");
    } catch (error) {
      toast.error("Erreur lors de la génération.");
    } finally {
      setGenerating(null);
    }
  };

  const handleExportCSV = async () => {
    if (!payments || payments.length === 0) {
      toast.error("Aucune donnée à exporter.");
      return;
    }

    try {
      setGenerating('export');
      const response = await api.get('comptabilite/', { params: { limit: 1 } });
      const rapportId = response.data.results?.[0]?.id || response.data?.[0]?.id;
      
      if (!rapportId) {
        toast.error("Aucun rapport comptable trouvé.");
        setGenerating(null);
        return;
      }

      window.open(`http://localhost:8000/api/comptabilite/${rapportId}/export_csv/`, '_blank');
      toast.success("Export CSV terminé !");
    } catch (error) {
      toast.error("Erreur lors de l'export.");
    } finally {
      setGenerating(null);
    }
  };

  const handleGenerate = (type) => {
    setGenerating(type);
    setTimeout(() => {
      toast.success(`${type} généré !`);
      setGenerating(null);
      const blob = new Blob(["Rapport " + type], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${type.replace(/ /g, '_')}.txt`;
      link.click();
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-fade-in max-w-5xl mx-auto">
      <div className="border-b border-gray-100 pb-4">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des rapports</h1>
        <p className="text-gray-500 text-sm mt-1">Générez vos documents comptables et exportez les données d'activité.</p>
      </div>

      <Card className="border-0 shadow-sm overflow-hidden">
        <CardBody className="p-0">
          <div className="divide-y divide-gray-100">
            {/* Rapport Fiscal */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                  <FileText size={24} />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-bold text-gray-900">Rapport fiscal DGI</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Synthèse des revenus locatifs pour la déclaration annuelle au Togo.</p>
                </div>
              </div>
              <Button
                variant="primary"
                className="md:w-40 bg-gray-900 hover:bg-black text-white py-2"
                onClick={handleGeneratePDF}
                disabled={generating === 'pdf'}
              >
                {generating === 'pdf' ? <Loader2 className="animate-spin mr-2" size={16} /> : <FileText size={16} className="mr-2" />}
                Générer PDF
              </Button>
            </div>

            {/* Rapport Mensuel */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                  <Calendar size={24} />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-bold text-gray-900">Rapport de performance</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Indicateurs mensuels sur le taux d'occupation et les encaissements.</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="md:w-40 py-2"
                onClick={handleGeneratePDF}
                disabled={generating === 'pdf'}
              >
                {generating === 'pdf' ? <Loader2 className="animate-spin mr-2" size={16} /> : <Calendar size={16} className="mr-2" />}
                Voir Rapport
              </Button>
            </div>

            {/* Export Données */}
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-gray-100 text-gray-600 rounded-lg">
                  <Download size={24} />
                </div>
                <div className="max-w-md">
                  <h3 className="text-base font-bold text-gray-900">Extraction des transactions</h3>
                  <p className="text-sm text-gray-500 mt-0.5">Télécharger toutes les données financières au format CSV (Excel).</p>
                </div>
              </div>
              <Button
                variant="outline"
                className="md:w-40 py-2 text-green-600 border-green-200 hover:bg-green-50"
                onClick={handleExportCSV}
                disabled={generating === 'export'}
              >
                {generating === 'export' ? <Loader2 className="animate-spin mr-2" size={16} /> : <Download size={16} className="mr-2" />}
                Exporter CSV
              </Button>
            </div>
          </div>
        </CardBody>
      </Card>

      <div className="pt-4">
        <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4">Générations récentes</h2>
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          {[
            { title: 'Rapport Fiscal 2026', date: 'il y a 2h', icon: FileText },
            { title: 'Extraction complète Mars', date: 'Hier', icon: Download }
          ].map((h, i) => (
            <div key={i} className="p-4 flex items-center justify-between border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
              <div className="flex items-center gap-3">
                <h.icon size={16} className="text-gray-400" />
                <span className="text-sm font-medium text-gray-700">{h.title}</span>
              </div>
              <span className="text-xs text-gray-400">{h.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Badge = ({ children, className }) => (
  <span className={`px-3 py-1 rounded-full text-xs font-bold ${className}`}>
    {children}
  </span>
);

export default ReportsAdmin;
