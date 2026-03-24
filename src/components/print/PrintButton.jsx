import React, { useEffect, useState } from 'react';
import { Printer, Download, Eye, AlertTriangle } from 'lucide-react';
import { useReactToPrint } from 'react-to-print';
import { toast } from 'react-hot-toast';

export function PrintButton({ documentRef, documentType, data, isUnsaved = false }) {
    const isDataValid = data && Object.keys(data).length > 0;

    const handlePrint = useReactToPrint({
        content: () => documentRef.current,
        documentTitle: `SONATRACH_${documentType}_${new Date().getTime()}`,
        onBeforeGetContent: () => {
            if (!isDataValid) {
                toast.error('Veuillez remplir les champs obligatoires avant impression.');
                return Promise.reject('Invalid data');
            }
            return Promise.resolve();
        },
        onAfterPrint: () => {
            console.log(`[LOG_ACTIVITE] Document ${documentType} imprimé.`);
            toast.success('Impression réussie.');
        }
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
                e.preventDefault();
                handlePrint();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handlePrint]);

    const handleDownloadPDF = () => {
        if (window.confirm('Voulez-vous générer la version PDF de ce document ?')) {
            toast.success('Génération du PDF en cours...');
            handlePrint();
        }
    };

    const handlePreview = () => {
        handlePrint();
    };

    return (
        <div className="flex items-center gap-3 no-print">
            {isUnsaved && (
                <div className="flex items-center text-amber-600 text-sm font-medium mr-2" title="Données modifiées non sauvegardées">
                    <AlertTriangle className="w-4 h-4 mr-1" />
                    Non sauvegardé
                </div>
            )}

            <button
                onClick={handlePreview}
                title="Aperçu avant impression"
                className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-700 font-medium transition-colors shadow-sm"
            >
                <Eye className="w-4 h-4" />
                <span className="hidden sm:inline">Aperçu</span>
            </button>

            <button
                onClick={handleDownloadPDF}
                title="Télécharger en format PDF"
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors shadow-sm"
            >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">PDF</span>
            </button>

            <button
                onClick={handlePrint}
                title="Imprimer le document (Ctrl+P)"
                disabled={!isDataValid}
                className={`flex items-center gap-2 px-4 py-2 text-white rounded-lg font-medium transition-colors shadow-sm ${isDataValid
                        ? 'bg-[#E87722] hover:bg-[#d0671c]'
                        : 'bg-gray-400 cursor-not-allowed border-2 border-red-500'
                    }`}
            >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Imprimer</span>
            </button>
        </div>
    );
}
