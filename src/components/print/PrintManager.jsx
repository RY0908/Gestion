import React, { useRef } from 'react';
import { PrintButton } from './PrintButton';
import { useDocumentNumber } from './hooks/useDocumentNumber';

// Imports des documents
import { BonSortie } from './documents/BonSortie';
import { DemandeIntervention } from './documents/DemandeIntervention';
import { FicheIntervention } from './documents/FicheIntervention';
import { BonCommande } from './documents/BonCommande';
import { BonReception } from './documents/BonReception';
import { Decharge } from './documents/Decharge';
import { DemandeMateriel } from './documents/DemandeMateriel';
import { FicheInventaire } from './documents/FicheInventaire';
import { RapportIntervention } from './documents/RapportIntervention';
import { FicheBesoin } from './documents/FicheBesoin';
import { DemandeGarantie } from './documents/DemandeGarantie';

export function PrintManager({ documentType, data, isUnsaved }) {
    const componentRef = useRef(null);
    const { numero, loading } = useDocumentNumber(documentType);

    if (loading) {
        return (
            <div className="text-sm text-gray-500 animate-pulse">
                Génération du numéro d'enregistrement...
            </div>
        );
    }

    const renderDocument = () => {
        const enrichedData = { ...data, numero };

        switch (documentType) {
            case 'BON_SORTIE':
                return <BonSortie data={enrichedData} ref={componentRef} />;
            case 'DEMANDE_INTERV':
                return <DemandeIntervention data={enrichedData} ref={componentRef} />;
            case 'FICHE_INTERV':
                return <FicheIntervention data={enrichedData} ref={componentRef} />;
            case 'BON_COMMANDE':
                return <BonCommande data={enrichedData} ref={componentRef} />;
            case 'BON_RECEPTION':
                return <BonReception data={enrichedData} ref={componentRef} />;
            case 'DECHARGE':
                return <Decharge data={enrichedData} ref={componentRef} />;
            case 'DEMANDE_MATERIEL':
                return <DemandeMateriel data={enrichedData} ref={componentRef} />;
            case 'FICHE_INVENTAIRE':
                return <FicheInventaire data={enrichedData} ref={componentRef} />;
            case 'RAPPORT_INTERV':
                return <RapportIntervention data={enrichedData} ref={componentRef} />;
            case 'FICHE_BESOIN':
                return <FicheBesoin data={enrichedData} ref={componentRef} />;
            case 'DEMANDE_GARANTIE':
                return <DemandeGarantie data={enrichedData} ref={componentRef} />;
            default:
                return (
                    <div ref={componentRef} className="p-8 text-center text-gray-400 font-medium">
                        Le gabarit d'impression pour [{documentType}] est en cours d'implémentation.
                    </div>
                );
        }
    };

    return (
        <div className="flex flex-col gap-4">
            <div className="flex justify-end w-full mb-2">
                <PrintButton
                    documentRef={componentRef}
                    documentType={documentType}
                    data={data}
                    isUnsaved={isUnsaved}
                />
            </div>

            <div className="bg-gray-100 border border-gray-200 rounded-xl shadow-inner p-4 overflow-auto max-h-[800px] flex justify-center">
                <div className="print-root w-[210mm] min-h-[297mm] bg-white text-black p-[15mm] shadow-md relative" id="print-root">
                    {renderDocument()}
                </div>
            </div>
        </div>
    );
}
