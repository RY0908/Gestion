import React from 'react';

export function SignatureBlock({ signataires = [] }) {
    if (!signataires || signataires.length === 0) return null;

    const colsClass = {
        1: 'grid-cols-1',
        2: 'grid-cols-2',
        3: 'grid-cols-3',
        4: 'grid-cols-4',
    }[Math.min(signataires.length, 4)] || 'grid-cols-3';

    return (
        <div className={`grid ${colsClass} gap-8 mt-12 w-full page-break-inside-avoid no-break`}>
            {signataires.map((sig, index) => {
                const titre = typeof sig === 'string' ? sig : sig.titre;
                const nom = typeof sig === 'object' && sig.nom ? sig.nom : '';

                return (
                    <div key={index} className="flex flex-col space-y-4">
                        <div className="font-bold text-sm text-center underline decoration-1 underline-offset-2">
                            {titre}
                        </div>

                        {nom && (
                            <div className="text-sm">
                                <span className="font-semibold">Nom :</span> {nom}
                            </div>
                        )}

                        <div className="text-sm">
                            <span className="font-semibold">Date :</span> ___________
                        </div>

                        <div className="text-sm flex flex-col">
                            <span className="font-semibold mb-8">Signature :</span>
                            <div className="h-16"></div> {/* Espace pour la signature physique */}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
