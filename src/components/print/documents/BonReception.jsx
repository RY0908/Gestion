import React, { forwardRef } from 'react';
import { formatDate } from '../utils/formatters';

export const BonReception = forwardRef(({ data }, ref) => {
    const {
        numero,
        numCommande,
        numLivraison,
        dateLivraison,
        fournisseur,
        articles = [],
        totaux,
        signataires
    } = data || {};

    return (
        <div ref={ref} className="w-full h-[190mm] flex flex-col bg-white overflow-hidden text-black page-break-inside-avoid print-landscape">
            {/* Format PAYSAGE strict */}
            <style type="text/css" media="print">
                {`@page { size: landscape; margin: 10mm; }`}
            </style>

            {/* En-tête M-103 */}
            <div className="flex justify-between items-start mb-2 border-b-2 border-black pb-2">
                <div className="flex flex-col w-1/3">
                    <div className="text-[#E87722] font-black text-3xl tracking-widest leading-none mb-1">
                        SONATRACH
                    </div>
                </div>

                <div className="w-1/3 flex justify-center items-center">
                    <div className="text-2xl font-black uppercase text-center border-4 border-[#2C2C2C] px-6 py-2 bg-gray-50 tracking-wide rounded-sm">
                        BON DE RÉCEPTION
                    </div>
                </div>

                <div className="w-1/3 flex flex-col text-[10px] items-end">
                    <table className="border-collapse w-full max-w-[250px]">
                        <tbody>
                            <tr><td className="font-bold text-right pr-2">N° BON DE RÉCEPTION:</td><td className="border border-black px-2 py-1 font-mono">{numero || 'BR-____-____'}</td></tr>
                            <tr><td className="font-bold text-right pr-2">N° DE COMMANDE:</td><td className="border border-black px-2 py-1 font-mono">{numCommande || '__________'}</td></tr>
                            <tr><td className="font-bold text-right pr-2">N° BON DE LIVRAISON:</td><td className="border border-black px-2 py-1 font-mono">{numLivraison || '__________'}</td></tr>
                            <tr><td className="font-bold text-right pr-2">DATE DE LIVRAISON:</td><td className="border border-black px-2 py-1">{dateLivraison ? formatDate(dateLivraison) : '__/__/____'}</td></tr>
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Informations Fournisseur */}
            <div className="mb-2">
                <table className="w-full text-xs border border-black border-collapse">
                    <tbody>
                        <tr>
                            <td className="border border-black p-1 bg-gray-100 font-bold w-32 uppercase text-center">Fournisseur</td>
                            <td className="border border-black p-1 pl-2 w-1/3"><span className="font-bold">{fournisseur?.nom}</span></td>
                            <td className="border border-black p-1 bg-gray-100 font-bold w-16 text-center">Code</td>
                            <td className="border border-black p-1 text-center font-mono w-32">{fournisseur?.code || '_____'}</td>
                            <td className="border border-black p-1 bg-gray-100 font-bold w-24 text-center">Adresse</td>
                            <td className="border border-black p-1 pl-2 text-[10px]">{fournisseur?.adresse || '_________________________________'}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* Tableau principal articles (Dense) */}
            <div className="flex-grow overflow-hidden">
                <table className="w-full text-[9px] border-collapse border border-black print-table-dense">
                    <thead>
                        <tr className="bg-[#2C2C2C] text-white">
                            <td className="border border-gray-400 p-1 font-bold text-center w-6">N°</td>
                            <td className="border border-gray-400 p-1 font-bold text-center w-16">CODE</td>
                            <td className="border border-gray-400 p-1 font-bold">DÉSIGNATION</td>
                            <td className="border border-gray-400 p-1 font-bold text-center w-10">U.M</td>
                            <td className="border border-gray-400 p-1 font-bold text-center w-12 leading-tight">Qté Cde</td>
                            <td className="border border-gray-400 p-1 font-bold text-center w-12 leading-tight">Solde Liv</td>
                            <td className="border border-gray-400 p-1 font-bold text-center w-12 bg-[#E87722] leading-tight">Qté Récép</td>
                            <td className="border border-gray-400 p-1 font-bold text-center w-16">Prix Unit.</td>
                            <td className="border border-gray-400 p-1 font-bold text-center w-20">Valeur</td>
                            <td className="border border-gray-400 p-1 font-bold text-center w-24">N° Série</td>
                            <td className="border border-gray-400 p-1 font-bold text-center bg-gray-600 text-[8px] leading-tight w-16">N° Casier</td>
                        </tr>
                    </thead>
                    <tbody>
                        {articles.map((item, idx) => (
                            <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                <td className="border border-black p-[2px] text-center">{idx + 1}</td>
                                <td className="border border-black p-[2px] text-center font-mono">{item.code}</td>
                                <td className="border border-black p-[2px] font-bold truncate max-w-[150px]">{item.designation}</td>
                                <td className="border border-black p-[2px] text-center">{item.unite || 'U'}</td>
                                <td className="border border-black p-[2px] text-center">{item.qteCommandee}</td>
                                <td className="border border-black p-[2px] text-center">{item.soldeALivrer}</td>
                                <td className="border border-black p-[2px] text-center font-bold">{item.qteReceptionnee}</td>
                                <td className="border border-black p-[2px] text-right">{item.prixUnitaire}</td>
                                <td className="border border-black p-[2px] text-right font-semibold">{item.valeur}</td>
                                <td className="border border-black p-[2px] text-center font-mono text-[8px]">{item.numSerie}</td>
                                <td className="border border-black p-[2px] text-center">{item.numCasier}</td>
                            </tr>
                        ))}
                        {/* Lignes vides max 10 */}
                        {Array.from({ length: Math.max(0, 10 - articles.length) }).map((_, idx) => (
                            <tr key={`empty-${idx}`}>
                                <td className="border border-black p-[2px] text-transparent">-</td>
                                <td className="border border-black p-[2px]"></td>
                                <td className="border border-black p-[2px]"></td>
                                <td className="border border-black p-[2px]"></td>
                                <td className="border border-black p-[2px]"></td>
                                <td className="border border-black p-[2px]"></td>
                                <td className="border border-black p-[2px] bg-gray-50"></td>
                                <td className="border border-black p-[2px]"></td>
                                <td className="border border-black p-[2px]"></td>
                                <td className="border border-black p-[2px]"></td>
                                <td className="border border-black p-[2px]"></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Pied M-103 : Valorisation & Signatures */}
            <div className="flex mt-2 mb-1 pt-1 border-t-2 border-black max-h-[70px]">
                {/* Bloc Signatures */}
                <div className="flex-grow grid grid-cols-4 gap-2 pr-4 text-[9px]">
                    <div className="border border-gray-400 p-1 flex flex-col">
                        <span className="font-bold underline text-center mb-1">RÉCEPTIONNAIRE</span>
                        <div className="flex-grow">Nom: <span className="font-bold">{signataires?.receptionnaire}</span></div>
                        <div className="flex justify-between items-end mt-4">
                            <span>Date: __/__/____</span>
                            <span>Sign:</span>
                        </div>
                    </div>
                    <div className="border border-gray-400 p-1 flex flex-col">
                        <span className="font-bold underline text-center mb-1">VALORISÉ PAR</span>
                        <div className="flex-grow">Nom: <span className="font-bold">{signataires?.valorisePar}</span></div>
                        <div className="flex justify-between items-end mt-4">
                            <span>Date: __/__/____</span>
                            <span>Sign:</span>
                        </div>
                    </div>
                    <div className="border border-gray-400 p-1 flex flex-col">
                        <span className="font-bold underline text-center mb-1">FICHISTE MAG.</span>
                        <div className="flex-grow">Nom: <span className="font-bold">{signataires?.fichiste}</span></div>
                        <div className="flex justify-between items-end mt-4">
                            <span>Date: __/__/____</span>
                            <span>Sign:</span>
                        </div>
                    </div>
                    <div className="border border-gray-400 p-1 flex flex-col">
                        <span className="font-bold underline text-center mb-1">COMPTABILITÉ MAT.</span>
                        <div className="flex-grow">Nom: <span className="font-bold">{signataires?.comptabilite}</span></div>
                        <div className="flex justify-between items-end mt-4">
                            <span>Date: __/__/____</span>
                            <span>Sign:</span>
                        </div>
                    </div>
                </div>

                {/* Bloc Recap Financier */}
                <div className="w-[200px] text-[8px] flex flex-col justify-end">
                    <table className="w-full border-collapse border border-black mb-1">
                        <tbody>
                            <tr><td className="border border-black px-1 font-bold">Articles Stockables</td><td className="border border-black px-1 text-right">{totaux?.stockables || '0.00'}</td></tr>
                            <tr><td className="border border-black px-1 font-bold">Droit de douane</td><td className="border border-black px-1 text-right">{totaux?.droit_douane || '0.00'}</td></tr>
                            <tr><td className="border border-black px-1 font-bold">Fret / Assurance</td><td className="border border-black px-1 text-right">{totaux?.fret || '0.00'}</td></tr>
                            <tr className="bg-gray-100"><td className="border border-black px-1 font-bold text-center">TOTAL VALEUR DA</td><td className="border border-black px-1 text-right font-black">{totaux?.total_valeur || '0.00'}</td></tr>
                        </tbody>
                    </table>
                    <div className="text-right text-[7px] text-gray-500 font-mono mt-auto">Réf Formulaire M-103/SNT/DC-ISI</div>
                </div>
            </div>
        </div>
    );
});

BonReception.displayName = 'BonReception';
