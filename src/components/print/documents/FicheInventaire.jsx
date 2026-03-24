import React, { forwardRef } from 'react';
import { SonatrachHeader } from '../common/SonatrachHeader';
import { SonatrachFooter } from '../common/SonatrachFooter';
import { formatDate } from '../utils/formatters';

export const FicheInventaire = forwardRef(({ data }, ref) => {
    const {
        type = 'par_bureau', // 'par_bureau' ou 'global'
        direction,
        sousStructure,
        dateInventaire,
        agent,
        bureau,
        responsableBureau,
        categorieDoc,
        activite,
        articles = []
    } = data || {};

    const isGlobal = type === 'global';

    // Rendu pour Variantes B (Globale - Format Paysage)
    if (isGlobal) {
        return (
            <div ref={ref} className="w-full h-full flex flex-col bg-white overflow-hidden text-black page-break-inside-avoid print-landscape">
                <style type="text/css" media="print">
                    {`@page { size: landscape; margin: 10mm; }`}
                </style>

                <div className="flex justify-between items-center mb-6 pb-2 border-b-2 border-[#E87722]">
                    <div className="flex flex-col">
                        <div className="text-[#E87722] font-black text-2xl tracking-widest">SONATRACH</div>
                        <div className="text-sm font-semibold">Activité : {activite}</div>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold uppercase text-center bg-gray-100 px-6 py-2 rounded border border-gray-300">
                            INVENTAIRE MATÉRIEL — {categorieDoc || 'GÉNÉRAL'}
                        </h1>
                    </div>
                    <div className="text-sm text-right">
                        <div>Direction : {direction}</div>
                        <div>Date : {dateInventaire ? formatDate(dateInventaire) : formatDate(new Date().toISOString())}</div>
                    </div>
                </div>

                <div className="flex-grow">
                    <table className="print-table print-table-dense">
                        <thead>
                            <tr>
                                <th className="w-8 text-center text-white">N°</th>
                                <th className="text-white">Désignation</th>
                                <th className="text-white">Marque</th>
                                <th className="text-white">Type/Modèle</th>
                                <th className="w-12 text-center text-white">Qté</th>
                                <th className="text-white">N° Série</th>
                                <th className="text-white">Affectation</th>
                                <th className="w-16 text-center text-white">Bureau</th>
                                <th className="w-16 text-center text-white">État</th>
                                <th className="text-white">Observations</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="text-center">{idx + 1}</td>
                                    <td className="font-semibold">{item.designation}</td>
                                    <td>{item.marque}</td>
                                    <td className="text-[10px]">{item.modele}</td>
                                    <td className="text-center font-bold">{item.quantite || 1}</td>
                                    <td className="font-mono text-[10px]">{item.numSerie}</td>
                                    <td>{item.affectation}</td>
                                    <td className="text-center font-semibold">{item.numBureau}</td>
                                    <td className="text-center text-[10px]">{item.etat}</td>
                                    <td className="text-[10px]">{item.observations}</td>
                                </tr>
                            ))}
                            {articles.length === 0 && (
                                <tr><td colSpan="10" className="text-center text-gray-400 py-4 italic">Aucun article dans cet inventaire</td></tr>
                            )}
                        </tbody>
                    </table>

                    <div className="mt-4 text-sm font-bold bg-gray-100 p-2 inline-block rounded border border-gray-300">
                        Total articles répertoriés : <span className="text-[#E87722] text-base">{articles.length}</span>
                    </div>
                </div>

                <div className="mt-8 pt-4 border-t border-gray-300 grid grid-cols-3 text-sm no-break h-32">
                    <div>
                        <span className="font-semibold text-gray-600 block mb-1">Date d'inventaire :</span>
                        {dateInventaire ? formatDate(dateInventaire) : formatDate(new Date().toISOString())}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600 block mb-8">Établi par (Inventoriste) :</span>
                        {agent?.nom} {agent?.prenom}
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600 block mb-8">Visa Responsable Hiérarchique :</span>
                        _________________________
                    </div>
                </div>
            </div>
        );
    }

    // Grouper les articles par catégorie pour la Variante A
    const articlesGroupes = articles.reduce((acc, current) => {
        const cat = current.categorie || 'AUTRES MATÉRIELS';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(current);
        return acc;
    }, {});

    // Rendu pour Variantes A (Par Bureau - Format Portrait)
    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            <SonatrachHeader titre="FICHE D'INVENTAIRE / DÉCHARGE BUREAU" />

            <div className="flex-grow space-y-6">
                <div className="grid grid-cols-2 gap-4 text-sm bg-[#FDE9D9]/30 p-4 border border-[#E87722]/40 shadow-sm rounded">
                    <div><span className="font-bold text-gray-700 w-32 inline-block">Direction :</span> {direction}</div>
                    <div><span className="font-bold text-gray-700 w-32 inline-block">Sous-structure :</span> {sousStructure}</div>
                    <div><span className="font-bold text-gray-700 w-32 inline-block">Bureau N° :</span> <span className="text-lg text-[#E87722]">{bureau?.numero}</span></div>
                    <div><span className="font-bold text-gray-700 w-32 inline-block">Étage :</span> {bureau?.etage}</div>
                    <div className="col-span-2 pt-2 border-t border-gray-200 mt-2">
                        <span className="font-bold text-gray-700 w-32 inline-block">Responsable :</span> {responsableBureau}
                    </div>
                </div>

                <div className="mt-6">
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th className="text-white w-24">N° Inventaire</th>
                                <th className="text-white">Désignation</th>
                                <th className="w-12 text-center text-white">Qté</th>
                                <th className="text-white">Marque & Modèle</th>
                                <th className="text-white">N° Série</th>
                                <th className="text-white">Date Acq.</th>
                                <th className="w-16 text-center text-white">État</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(articlesGroupes).map(([categorie, items]) => (
                                <React.Fragment key={categorie}>
                                    <tr className="bg-gray-200 border-y-2 border-gray-400">
                                        <td colSpan="7" className="font-bold text-sm py-1.5 uppercase pl-2 tracking-wider text-gray-800">
                                            ■ {categorie}
                                        </td>
                                    </tr>
                                    {items.map((item, idx) => (
                                        <tr key={`${categorie}-${idx}`}>
                                            <td className="font-mono text-xs font-semibold">{item.numInventaire}</td>
                                            <td className="font-medium">{item.designation}</td>
                                            <td className="text-center font-bold">{item.quantite || 1}</td>
                                            <td className="text-xs">{item.marque} <span className="text-[10px] text-gray-500">{item.modele}</span></td>
                                            <td className="font-mono text-[10px]">{item.numSerie}</td>
                                            <td className="text-[10px]">{item.dateAcquisition ? formatDate(item.dateAcquisition) : '-'}</td>
                                            <td className="text-center text-[10px]">{item.etat}</td>
                                        </tr>
                                    ))}
                                </React.Fragment>
                            ))}
                            {articles.length === 0 && (
                                <tr><td colSpan="7" className="text-center text-gray-400 py-6 italic">Aucun matériel inventorié dans ce bureau.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <div className="grid grid-cols-2 gap-12 mt-12 pt-8 border-t border-[#E87722] no-break">
                    <div className="flex flex-col space-y-8">
                        <div>
                            <span className="font-bold underline text-[#E87722] mb-2 block">AGENT INVENTORISTE</span>
                            <div className="text-sm">Nom & Prénom : <span className="font-semibold">{agent?.nom} {agent?.prenom}</span></div>
                            <div className="text-sm mt-1">Date : {dateInventaire ? formatDate(dateInventaire) : formatDate(new Date().toISOString())}</div>
                        </div>
                        <div className="text-sm">Signature :</div>
                    </div>
                    <div className="flex flex-col space-y-8">
                        <div>
                            <span className="font-bold underline text-[#E87722] mb-2 block">RESPONSABLE DU BUREAU</span>
                            <div className="text-xs text-gray-500 italic mb-2">Je soussigné reconnais avoir sous ma responsabilité le matériel listé ci-dessus.</div>
                            <div className="text-sm">Nom & Prénom : <span className="font-semibold">{responsableBureau}</span></div>
                        </div>
                        <div className="text-sm">Date et Signature :</div>
                    </div>
                </div>

            </div>

            <SonatrachFooter
                user={`${agent?.nom || ''} ${agent?.prenom || ''}`.trim() || 'Système'}
                page={1}
                totalPages={1}
            />
        </div>
    );
});

FicheInventaire.displayName = 'FicheInventaire';
