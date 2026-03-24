import React, { forwardRef } from 'react';
import { SonatrachHeader } from '../common/SonatrachHeader';
import { SonatrachFooter } from '../common/SonatrachFooter';
import { SignatureBlock } from '../common/SignatureBlock';
import { formatDate } from '../utils/formatters';

export const DemandeGarantie = forwardRef(({ data }, ref) => {
    const {
        numero,
        date,
        materiel,
        fournisseur,
        descriptionPanne,
        documentsJoints = [],
        technicien,
        chefDepartement
    } = data || {};

    const allDocs = [
        "Copie bon de commande / bon de réception",
        "Facture d'achat",
        "Certificat de garantie original",
        "Fiche technique"
    ];

    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            <SonatrachHeader
                titre="DEMANDE DE RÉPARATION MATÉRIEL SOUS GARANTIE"
                numero={numero}
                date={date ? formatDate(date) : formatDate(new Date().toISOString())}
            />

            <div className="flex-grow space-y-6 mt-2">

                {/* Avertissement Garantie */}
                <div className="bg-gray-50 border border-gray-400 p-3 italic text-center text-sm font-semibold text-gray-600 tracking-wide">
                    Document valant mise en demeure d'intervention au titre de la garantie contractuelle.
                </div>

                <div className="grid grid-cols-2 gap-8 text-sm">
                    {/* Bloc Matériel */}
                    <div>
                        <h3 className="font-bold text-sm bg-[#E87722] text-white p-1 px-2 mb-3">1. INFORMATIONS MATÉRIEL</h3>
                        <div className="grid grid-cols-1 gap-y-2 pl-2">
                            <div><span className="font-semibold text-gray-600 w-36 inline-block">Désignation :</span> <span className="font-bold">{materiel?.designation}</span></div>
                            <div><span className="font-semibold text-gray-600 w-36 inline-block">Marque / Modèle :</span> {materiel?.marque} / {materiel?.modele}</div>
                            <div><span className="font-semibold text-gray-600 w-36 inline-block">N° Série :</span> <span className="font-mono">{materiel?.numSerie}</span></div>
                            <div><span className="font-semibold text-gray-600 w-36 inline-block">N° Inventaire :</span> <span className="font-mono">{materiel?.numInventaire}</span></div>
                            <div className="mt-2 pt-2 border-t border-gray-200">
                                <span className="font-semibold text-gray-600 w-36 inline-block">N° Bon Commande :</span> {materiel?.numBonCommande || '---'}
                            </div>
                            <div><span className="font-semibold text-gray-600 w-36 inline-block">Date Acquisition :</span> {materiel?.dateAcquisition ? formatDate(materiel.dateAcquisition) : '---'}</div>
                            <div><span className="font-semibold text-[#E87722] w-36 inline-block">Fin de Garantie :</span> <span className="font-bold underline">{materiel?.dateFinGarantie ? formatDate(materiel.dateFinGarantie) : '---'}</span></div>
                        </div>
                    </div>

                    {/* Bloc Fournisseur */}
                    <div>
                        <h3 className="font-bold text-sm bg-[#E87722] text-white p-1 px-2 mb-3">2. FOURNISSEUR CONTRACTUEL</h3>
                        <div className="grid grid-cols-1 gap-y-2 pl-2 bg-gray-50 p-3 border border-gray-200 rounded min-h-[140px]">
                            <div><span className="font-semibold text-gray-600 block mb-1">Raison Sociale :</span> <span className="font-bold text-base">{fournisseur?.nom}</span></div>
                            <div className="mt-2 text-xs"><span className="font-semibold text-gray-600 block mb-1">Contacts enregistrés :</span> <span className="whitespace-pre-wrap">{fournisseur?.contact || "Aucune coordonnée renseignée."}</span></div>
                        </div>
                    </div>
                </div>

                {/* Bloc Panne */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">3. CONSTATAION DE LA PANNE / DEFAILLANCE</h3>
                    <div className="border border-gray-300 rounded p-3 min-h-[120px] text-sm whitespace-pre-wrap">
                        {descriptionPanne || "Aucun détail technique n'a été fourni concernant la défaillance couverte par la garantie."}
                    </div>
                </div>

                {/* Pièces jointes & Suivi */}
                <div className="grid grid-cols-2 gap-8 text-sm">
                    <div>
                        <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">4. DOCUMENTS JOINTS</h3>
                        <div className="pl-2 space-y-2">
                            {allDocs.map((doc, i) => {
                                const isChecked = documentsJoints.includes(doc);
                                return (
                                    <div key={i} className="flex items-center">
                                        <span className={`w-4 h-4 mr-2 border border-black ${isChecked ? 'bg-black text-white flex items-center justify-center text-xs' : 'bg-white'}`}>
                                            {isChecked ? 'X' : ''}
                                        </span>
                                        <span className={isChecked ? 'font-semibold' : 'text-gray-600'}>{doc}</span>
                                    </div>
                                )
                            })}
                            <div className="flex items-center mt-2 pt-2 border-t border-gray-200">
                                <span className={`w-4 h-4 mr-2 border border-black bg-white`}></span>
                                <span className="text-gray-600 mr-2">Autre :</span>
                                _______________________
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">5. SUIVI DE L'EXPÉDITION</h3>
                        <div className="border border-gray-300 p-3 rounded space-y-4">
                            <div><span className="font-semibold text-gray-600 inline-block w-48">Date envoi au fournisseur :</span> __________________</div>
                            <div><span className="font-semibold text-gray-600 inline-block w-48">Date retour prévue :</span> __________________</div>
                            <div className="pt-2 border-t border-gray-200">
                                <span className="font-semibold text-gray-600 block mb-2">Matériel de remplacement fourni par le prestataire :</span>
                                <div className="flex gap-8 pl-4">
                                    <span className="inline-flex items-center"><span className="w-4 h-4 mr-2 border border-black"></span> OUI</span>
                                    <span className="inline-flex items-center"><span className="w-4 h-4 mr-2 border border-black"></span> NON</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <SignatureBlock
                    signataires={[
                        { titre: "Demandé par (Technicien) :", nom: technicien },
                        { titre: "Approuvé par (Chef Dpt) :", nom: chefDepartement },
                        { titre: "Fournisseur (Accusé réception) :" }
                    ]}
                />
            </div>

            <SonatrachFooter
                user={technicien || 'Système'}
                page={1}
                totalPages={1}
            />
        </div>
    );
});

DemandeGarantie.displayName = 'DemandeGarantie';
