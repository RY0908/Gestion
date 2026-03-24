import React, { forwardRef } from 'react';
import { SonatrachHeader } from '../common/SonatrachHeader';
import { SonatrachFooter } from '../common/SonatrachFooter';
import { SignatureBlock } from '../common/SignatureBlock';
import { formatDate } from '../utils/formatters';

export const DemandeMateriel = forwardRef(({ data }, ref) => {
    const {
        numero,
        date,
        demandeur,
        articles = [],
        observations,
        urgence
    } = data || {};

    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            <SonatrachHeader
                titre="DEMANDE DE MATÉRIEL"
                numero={numero}
                date={date ? formatDate(date) : formatDate(new Date().toISOString())}
            />

            <div className="flex-grow space-y-6 mt-4">

                {/* Bloc Demandeur */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">IDENTIFICATION DU DEMANDEUR</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm pl-2">
                        <div><span className="font-semibold text-gray-600 w-28 inline-block">Nom & Prénom :</span> {demandeur?.nom} {demandeur?.prenom}</div>
                        <div><span className="font-semibold text-gray-600 w-28 inline-block">Matricule :</span> {demandeur?.matricule}</div>
                        <div><span className="font-semibold text-gray-600 w-28 inline-block">Direction :</span> {demandeur?.direction}</div>
                        <div><span className="font-semibold text-gray-600 w-28 inline-block">Structure :</span> {demandeur?.structure}</div>
                        <div><span className="font-semibold text-gray-600 w-28 inline-block">Poste :</span> {demandeur?.poste}</div>
                        <div><span className="font-semibold text-gray-600 w-28 inline-block">Tél. :</span> {demandeur?.telephone}</div>
                    </div>
                </div>

                {/* Degré d'urgence */}
                <div className="flex gap-12 text-sm pl-2 mt-4 items-center">
                    <span className="font-semibold text-[#E87722] uppercase">Degré d'urgence :</span>
                    <span className="inline-flex items-center">
                        <span className={`w-3 h-3 mr-1 border border-gray-400 ${urgence === 'urgent' ? 'bg-[#E87722]' : 'bg-white'}`}></span> Urgent
                    </span>
                    <span className="inline-flex items-center">
                        <span className={`w-3 h-3 mr-1 border border-gray-400 ${(!urgence || urgence === 'normal') ? 'bg-black' : 'bg-white'}`}></span> Normal
                    </span>
                    <span className="inline-flex items-center">
                        <span className={`w-3 h-3 mr-1 border border-gray-400 ${urgence === 'differable' ? 'bg-black' : 'bg-white'}`}></span> Différable
                    </span>
                </div>

                {/* Tableau des articles */}
                <div className="mt-8">
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th className="w-8 text-center text-white">N°</th>
                                <th className="text-white w-1/3">Désignation</th>
                                <th className="w-32 text-center text-white">Quantité souhaitée</th>
                                <th className="text-white">Motif / Justification</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="text-center">{idx + 1}</td>
                                    <td className="font-medium">{item.designation}</td>
                                    <td className="text-center font-semibold">{item.quantite}</td>
                                    <td className="text-xs">{item.motif}</td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr>
                                    <td colSpan="4" className="text-center text-gray-400 py-6 italic">
                                        Veuillez ajouter des articles à la demande
                                    </td>
                                </tr>
                            )}
                            {/* Lignes vides si moins de 5 articles */}
                            {Array.from({ length: Math.max(0, 5 - articles.length) }).map((_, idx) => (
                                <tr key={`empty-${idx}`}>
                                    <td className="text-center text-transparent">-</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Observations */}
                <div className="mt-6">
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">Observations Complémentaires</h3>
                    <div className="border border-gray-300 rounded p-3 min-h-[100px] text-sm whitespace-pre-wrap">
                        {observations || ''}
                    </div>
                </div>

                {/* Signatures */}
                <SignatureBlock
                    signataires={[
                        "Demandeur",
                        "Visa Chef de structure",
                        "Visa Direction"
                    ]}
                />
            </div>

            <SonatrachFooter
                user={`${demandeur?.nom || ''} ${demandeur?.prenom || ''}`.trim() || 'Système'}
                page={1}
                totalPages={1}
            />
        </div>
    );
});

DemandeMateriel.displayName = 'DemandeMateriel';
