import React, { forwardRef } from 'react';
import { SonatrachHeader } from '../common/SonatrachHeader';
import { SonatrachFooter } from '../common/SonatrachFooter';
import { SignatureBlock } from '../common/SignatureBlock';
import { formatDate, formatDA } from '../utils/formatters';

export const FicheBesoin = forwardRef(({ data }, ref) => {
    const {
        reference,
        date,
        structure,
        nature,
        articles = [],
        justification,
        budget,
        imputation,
        etabliPar,
        approuvePar
    } = data || {};

    // Calcul du total estimatif
    const totalEstime = articles.reduce((acc, curr) => acc + (curr.quantite * curr.prixUnitaire), 0);

    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            <SonatrachHeader
                titre="FICHE D'EXPRESSION DE BESOIN"
                numero={reference}
                date={date ? formatDate(date) : formatDate(new Date().toISOString())}
            />

            <div className="flex-grow space-y-6 mt-4">

                {/* Informations Générales */}
                <div className="bg-gray-100 p-4 border border-gray-300 rounded shadow-sm text-sm">
                    <div className="grid grid-cols-2 gap-4">
                        <div><span className="font-bold text-[#E87722] block mb-1">Structure Demanderesse :</span> <span className="font-semibold text-gray-800 text-base">{structure || '---'}</span></div>

                        <div>
                            <span className="font-bold text-[#E87722] block mb-2">Nature du besoin :</span>
                            <div className="flex gap-6">
                                <span className="inline-flex items-center">
                                    <span className={`w-3 h-3 mr-1 border border-gray-400 ${nature === 'renouvellement' ? 'bg-[#E87722]' : 'bg-white'}`}></span> Renouvellement
                                </span>
                                <span className="inline-flex items-center">
                                    <span className={`w-3 h-3 mr-1 border border-gray-400 ${nature === 'extension' ? 'bg-[#E87722]' : 'bg-white'}`}></span> Extension
                                </span>
                                <span className="inline-flex items-center">
                                    <span className={`w-3 h-3 mr-1 border border-gray-400 ${nature === 'nouveau' ? 'bg-[#E87722]' : 'bg-white'}`}></span> Nouveau
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tableau des Articles */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">Détail du Besoin Matériel / Logiciel</h3>
                    <table className="print-table print-table-dense">
                        <thead>
                            <tr>
                                <th className="w-8 text-center text-white">N°</th>
                                <th className="text-white w-48">Désignation</th>
                                <th className="w-12 text-center text-white">Qté</th>
                                <th className="text-white">Spécifications techniques minimales requises</th>
                                <th className="w-24 text-right text-white leading-tight">Prix Unitaire Estimé (DA)</th>
                                <th className="w-24 text-right text-white leading-tight">Montant Total Estimé (DA)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="text-center">{idx + 1}</td>
                                    <td className="font-bold">{item.designation}</td>
                                    <td className="text-center font-bold text-[#E87722]">{item.quantite}</td>
                                    <td className="text-[10px] whitespace-pre-wrap">{item.specifications}</td>
                                    <td className="text-right text-[10px]">{formatDA(item.prixUnitaire).replace('DA', '').trim()}</td>
                                    <td className="text-right font-semibold text-[10px]">{formatDA(item.quantite * item.prixUnitaire).replace('DA', '').trim()}</td>
                                </tr>
                            ))}
                            {/* Empty rows if few items */}
                            {Array.from({ length: Math.max(0, 5 - articles.length) }).map((_, idx) => (
                                <tr key={`empty-${idx}`}>
                                    <td className="text-transparent">-</td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </tr>
                            ))}
                            <tr className="bg-gray-100 border-t-2 border-[#E87722]">
                                <td colSpan="5" className="text-right font-bold uppercase text-xs pt-2">Budget Total Estimatif (TTC) :</td>
                                <td className="text-right font-bold text-[#E87722] pt-2">{formatDA(totalEstime)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Justification & Budget */}
                <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2">
                        <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">Justification Technique / Opérationnelle</h3>
                        <div className="border border-gray-300 rounded p-3 min-h-[120px] text-sm whitespace-pre-wrap italic text-gray-700">
                            {justification || ''}
                        </div>
                    </div>

                    <div className="col-span-1 flex flex-col space-y-4">
                        <div>
                            <h3 className="font-bold text-sm bg-[#E87722] text-white p-1 mb-2 px-2 text-center">Données Budgétaires</h3>
                            <div className="border border-gray-300 rounded p-3 bg-gray-50 text-sm space-y-4">
                                <div>
                                    <span className="font-semibold text-gray-600 block mb-1">Budget Disponible alloué :</span>
                                    <div className="font-mono text-right font-bold border-b border-gray-300 pb-1">{formatDA(budget || 0)}</div>
                                </div>
                                <div>
                                    <span className="font-semibold text-gray-600 block mb-1">Imputation (Compte/Centre) :</span>
                                    <div className="font-mono text-center font-semibold bg-white border border-gray-300 p-1">{imputation || '---'}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SignatureBlock
                    signataires={[
                        { titre: "Établi par (Demandeur) :", nom: etabliPar },
                        { titre: "Visé par :", nom: "Responsable Hiérarchique" },
                        { titre: "Approuvé par :", nom: approuvePar || "Direction" }
                    ]}
                />
            </div>

            <SonatrachFooter
                user={etabliPar}
                page={1}
                totalPages={1}
            />
        </div>
    );
});

FicheBesoin.displayName = 'FicheBesoin';
