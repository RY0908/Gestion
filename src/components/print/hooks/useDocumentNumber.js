import { useState, useEffect } from 'react';

const PREFIXES = {
    DEMANDE_MATERIEL: 'DM',
    FICHE_BESOIN: 'FB',
    BON_COMMANDE: 'BC',
    BON_RECEPTION: 'BR',
    BON_SORTIE: 'BS',
    DECHARGE: 'DCH',
    DEMANDE_INTERV: 'DI',
    FICHE_INTERV: 'FIT',
    RAPPORT_INTERV: 'RI',
    DEMANDE_GARANTIE: 'DRG',
    FICHE_INVENTAIRE: 'FIN'
};

export function useDocumentNumber(documentType) {
    const [numero, setNumero] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        async function fetchNumber() {
            try {
                // Mocking the sequence number format API
                const year = new Date().getFullYear();
                const prefix = PREFIXES[documentType] || 'DOC';
                const randomSeq = String(Math.floor(Math.random() * 1000)).padStart(4, '0');

                if (mounted) setNumero(`${prefix}-${year}-${randomSeq}`);
            } catch (error) {
                console.error("Erreur génération numéro:", error);
                const year = new Date().getFullYear();
                const prefix = PREFIXES[documentType] || 'DOC';
                const tsSeq = String(Date.now() % 10000).padStart(4, '0');
                if (mounted) setNumero(`${prefix}-${year}-${tsSeq}`);
            } finally {
                if (mounted) setLoading(false);
            }
        }

        // Simulating network delay
        setTimeout(fetchNumber, 300);

        return () => { mounted = false; };
    }, [documentType]);

    return { numero, loading };
}
