import React, { forwardRef } from 'react';
import { SonatrachHeader } from '../common/SonatrachHeader';
import { SonatrachFooter } from '../common/SonatrachFooter';
import { SignatureBlock } from '../common/SignatureBlock';
import { formatDate } from '../utils/formatters';

export const BonSortie = forwardRef(({ data }, ref) => {
    const {
        numero,
        date,
        direction,
        beneficiaire,
        motif,
        articles = [],
        gestionnaire,
        responsableISI
    } = data || {};

    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            <SonatrachHeader
                titre={`BON DE SORTIE N° ${numero || '---'}`}
            />

            <div className="flex-grow">
                <div className="flex justify-end mb-6 text-sm font-medium">
                    Alger, le {formatDate(date || new Date().toISOString())}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                    <div className="border border-gray-200 p-3 rounded bg-[#FDE9D9]/30">
                        <span className="font-semibold block mb-1 text-[#E87722]">Bénéficiaire</span>
                        <div><span className="font-semibold">Nom & Prénom :</span> {beneficiaire?.nom} {beneficiaire?.prenom}</div>
                        <div><span className="font-semibold">Matricule :</span> {beneficiaire?.matricule}</div>
                        <div><span className="font-semibold">Poste :</span> {beneficiaire?.poste}</div>
                    </div>

                    <div className="border border-gray-200 p-3 rounded">
                        <span className="font-semibold block mb-1 text-[#E87722]">Destination</span>
                        <div><span className="font-semibold">Direction :</span> {direction?.code} — {direction?.libelle}</div>
                        <div className="mt-2"><span className="font-semibold">Motif :</span> {motif}</div>
                    </div>
                </div>

                <div className="mb-8">
                    <h3 className="font-bold text-[#E87722] mb-2 uppercase text-sm">Matériel concerné</h3>
                    <table className="print-table print-table-dense">
                        <thead>
                            <tr>
                                <th className="w-8 text-center text-white">N°</th>
                                <th className="text-white">Désignation</th>
                                <th className="text-white">Marque / Modèle</th>
                                <th className="text-white">N° Série</th>
                                <th className="text-white">N° Inv.</th>
                                <th className="w-16 text-center text-white">Qté</th>
                                <th className="text-white">Observations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="text-center">{idx + 1}</td>
                                    <td>
                                        <div className="font-medium">{item.designation}</div>
                                        {item.code && <div className="text-[10px] text-gray-500">{item.code}</div>}
                                    </td>
                                    <td>
                                        <div>{item.marque}</div>
                                        <div className="text-[10px] text-gray-500">{item.modele}</div>
                                    </td>
                                    <td className="font-mono text-[10px]">{item.numSerie}</td>
                                    <td className="font-mono text-[10px]">{item.numInventaire}</td>
                                    <td className="text-center font-semibold">{item.quantite}</td>
                                    <td>{item.observations}</td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr>
                                    <td colSpan="7" className="text-center text-gray-400 py-4 italic">
                                        Aucun article sélectionné
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <SignatureBlock
                    signataires={[
                        "Gestionnaire de stock",
                        "Responsable ISI",
                        "Bénéficiaire (reçu le)"
                    ]}
                />
            </div>

            <SonatrachFooter
                user={gestionnaire || "Agent d'inventaire"}
                page={1}
                totalPages={1}
            />
        </div>
    );
});

BonSortie.displayName = 'BonSortie';
