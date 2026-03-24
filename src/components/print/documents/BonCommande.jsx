import React, { forwardRef } from 'react';
import { SonatrachHeader } from '../common/SonatrachHeader';
import { SignatureBlock } from '../common/SignatureBlock';
import { formatDA, formatDate } from '../utils/formatters';

export const BonCommande = forwardRef(({ data }, ref) => {
    const {
        numero,
        date,
        fournisseur,
        articles = [],
        conditions,
        imputation,
        solliciteur,
        approbateur
    } = data || {};

    // Calcul des totaux
    const totalHT = articles.reduce((acc, current) => acc + (current.quantite * current.prixUnitaire), 0);
    const tvaAmount = totalHT * 0.19; // 19% TVA standard
    const totalTTC = totalHT + tvaAmount;

    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            <SonatrachHeader
                titre={`BON DE COMMANDE N° ${numero || '---'}`}
            />

            <div className="flex-grow flex flex-col">
                <div className="flex justify-end mb-6 text-sm font-medium">
                    Alger, le {formatDate(date || new Date().toISOString())}
                </div>

                <div className="grid grid-cols-2 gap-6 mb-8 text-sm">
                    {/* Infos Fournisseur */}
                    <div className="border border-gray-300 p-4 rounded bg-[#FDE9D9]/20 shadow-sm">
                        <span className="font-bold block mb-2 text-[#E87722] text-base border-b border-[#E87722] pb-1">FOURNISSEUR</span>
                        <div className="space-y-1">
                            <div><span className="font-semibold text-gray-700 w-24 inline-block">Commande à :</span> <span className="font-bold">{fournisseur?.nom}</span></div>
                            <div><span className="font-semibold text-gray-700 w-24 inline-block align-top">Adresse :</span> <span className="inline-block w-[calc(100%-6rem)] whitespace-pre-wrap">{fournisseur?.adresse}</span></div>
                            <div><span className="font-semibold text-gray-700 w-24 inline-block">Contact :</span> {fournisseur?.contact}</div>
                        </div>
                    </div>

                    {/* Conditions Particulières */}
                    <div className="border border-gray-300 p-4 rounded shadow-sm">
                        <span className="font-bold block mb-2 text-[#E87722] text-base border-b border-[#E87722] pb-1">CONDITIONS PARTICULIÈRES</span>
                        <div className="space-y-1">
                            <div><span className="font-semibold text-gray-700 w-44 inline-block">Réf. Devis / Facture proforma :</span> {conditions?.refDevis || '---'}</div>
                            <div><span className="font-semibold text-gray-700 w-44 inline-block">Date de livraison souhaitée :</span> {conditions?.dateLivraison ? formatDate(conditions.dateLivraison) : '---'}</div>
                            <div><span className="font-semibold text-gray-700 w-44 inline-block">Mode d'expédition :</span> {conditions?.modeExpedition || 'Standard'}</div>
                            <div className="mt-2 pt-2 border-t border-gray-100">
                                <span className="font-semibold text-gray-700 block mb-1">Note de la Commande :</span>
                                <p className="text-xs italic text-gray-600 line-clamp-2">{conditions?.note || 'Aucune note spécifique relative à cette commande.'}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Tableau Matériel */}
                <div className="mb-4">
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th className="w-20 text-center text-white">CODE</th>
                                <th className="text-white">DÉSIGNATION</th>
                                <th className="w-16 text-center text-white">Qté</th>
                                <th className="w-32 text-right text-white">Prix Unitaire</th>
                                <th className="w-32 text-right text-white">Montant (DA)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="text-center font-mono text-xs">{item.code || `ART-${String(idx + 1).padStart(3, '0')}`}</td>
                                    <td className="font-medium">{item.designation}</td>
                                    <td className="text-center font-semibold">{item.quantite}</td>
                                    <td className="text-right">{formatDA(item.prixUnitaire).replace('DA', '').trim()}</td>
                                    <td className="text-right font-semibold">{formatDA(item.quantite * item.prixUnitaire).replace('DA', '').trim()}</td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr>
                                    <td colSpan="5" className="text-center text-gray-400 py-6 italic">
                                        Aucun article dans cette commande.
                                    </td>
                                </tr>
                            )}
                            {/* Totaux */}
                            <tr>
                                <td colSpan="3" className="border-none"></td>
                                <td className="text-right font-bold bg-gray-50 uppercase text-xs">TOTAL HT</td>
                                <td className="text-right font-bold bg-gray-50">{formatDA(totalHT)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="border-none"></td>
                                <td className="text-right font-bold bg-gray-50 uppercase text-xs">TVA 19%</td>
                                <td className="text-right font-bold bg-gray-50">{formatDA(tvaAmount)}</td>
                            </tr>
                            <tr>
                                <td colSpan="3" className="border-none"></td>
                                <td className="text-right font-bold bg-[#E87722] text-white uppercase text-sm">TOTAL TTC</td>
                                <td className="text-right font-bold bg-[#FDE9D9] text-[#E87722] text-sm">{formatDA(totalTTC)}</td>
                            </tr>
                        </tbody>
                    </table>
                </div>

                {/* Bas de page : Imputation & Signatures */}
                <div className="mt-auto grid grid-cols-3 gap-6">
                    <div className="col-span-1 space-y-4">
                        {/* Imputation Budgétaire */}
                        <div className="border border-gray-300 rounded text-sm overflow-hidden text-center">
                            <div className="font-bold bg-[#E87722] text-white py-1">IMPUTATION BUDGÉTAIRE</div>
                            <div className="grid grid-cols-2 divide-x divide-gray-300 border-b border-gray-300 font-semibold bg-gray-50 text-xs">
                                <div className="py-1">Compte Général</div>
                                <div className="py-1">Compte Analytique</div>
                            </div>
                            <div className="grid grid-cols-2 divide-x divide-gray-300 py-2 min-h-[40px] font-mono text-sm items-center">
                                <div>{imputation?.compteGeneral || '---'}</div>
                                <div>{imputation?.compteAnalytique || '---'}</div>
                            </div>
                        </div>

                        {/* Bloc Règlement indicatif */}
                        <div className="border border-gray-300 rounded text-xs text-center">
                            <div className="bg-gray-100 py-1 font-bold border-b border-gray-300">RÈGLEMENT / FACTURATION</div>
                            <div className="text-gray-400 italic py-3">Cadre réservé à la structure financière</div>
                        </div>
                    </div>

                    <div className="col-span-2">
                        <SignatureBlock
                            signataires={[
                                { titre: "Sollicité par :", nom: solliciteur },
                                { titre: "Approuvé par (Direction) :", nom: approbateur }
                            ]}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
});

BonCommande.displayName = 'BonCommande';
