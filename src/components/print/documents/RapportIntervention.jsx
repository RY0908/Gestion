import React, { forwardRef } from 'react';
import { SonatrachHeader } from '../common/SonatrachHeader';
import { SonatrachFooter } from '../common/SonatrachFooter';
import { SignatureBlock } from '../common/SignatureBlock';
import { formatDate } from '../utils/formatters';

export const RapportIntervention = forwardRef(({ data }, ref) => {
    const {
        numero,
        dateDebut,
        dateFin,
        technicien,
        intervention,
        diagnostic,
        actionsRealisees,
        resultat,
        preconisations,
        estRapportMensuel,
        interventionsMensuelles = []
    } = data || {};

    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            <SonatrachHeader
                titre={estRapportMensuel ? "RAPPORT D'INTERVENTION MENSUEL" : "RAPPORT D'INTERVENTION"}
                numero={numero}
            />

            <div className="flex-grow space-y-6">

                {/* Meta Informations */}
                <div className="flex justify-between items-center bg-gray-50 p-2 border border-gray-200 rounded text-sm">
                    {estRapportMensuel ? (
                        <div><span className="font-bold text-[#E87722]">Période :</span> du {formatDate(dateDebut)} au {formatDate(dateFin)}</div>
                    ) : (
                        <div><span className="font-bold text-[#E87722]">Date Intervention :</span> {intervention?.dateIntervention ? formatDate(intervention.dateIntervention) : '---'}</div>
                    )}
                    <div>
                        <span className="font-bold text-gray-700">Établi par :</span> {technicien?.nom}
                        <span className="text-gray-500 ml-2">(Matricule: {technicien?.matricule})</span>
                    </div>
                </div>

                {!estRapportMensuel && (
                    <>
                        {/* Bloc Résumé Intervention Unique */}
                        <div>
                            <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">1. Contexte & Résumé</h3>
                            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm pl-2">
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">Réf. Demande :</span> {intervention?.refDemande}</div>
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">Déclaration le :</span> {intervention?.dateDeclaration ? formatDate(intervention.dateDeclaration) : '-'}</div>
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">Utilisateur :</span> {intervention?.utilisateur}</div>
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">Direction/Bureau :</span> {intervention?.direction} / {intervention?.bureau}</div>
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">Matériel :</span> {intervention?.materiel}</div>
                                <div><span className="font-semibold text-gray-600 w-32 inline-block">N° Série :</span> <span className="font-mono text-xs">{intervention?.numSerie}</span></div>
                                <div className="col-span-2 pt-2 mt-1 border-t border-dashed border-gray-300">
                                    <span className="font-semibold text-gray-600 w-32 inline-block">Durée intervention :</span> <span className="font-bold text-[#E87722]">{intervention?.duree} heures</span>
                                </div>
                            </div>
                        </div>

                        {/* Bloc Diagnostic */}
                        <div>
                            <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">2. Diagnostic Technique</h3>
                            <div className="pl-2 space-y-3">
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-600 block mb-1">Type de panne identifiée :</span>
                                    <div className="flex gap-4">
                                        {['Matérielle', 'Logicielle', 'Réseau', 'Utilisateur'].map(type => (
                                            <span key={type} className="inline-flex items-center text-sm">
                                                <span className={`w-3 h-3 mr-1 border border-gray-400 ${diagnostic?.typePanne === type ? 'bg-[#E87722]' : 'bg-white'}`}></span> {type}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                                <div className="text-sm">
                                    <span className="font-semibold text-gray-600 block mb-1">Cause première (Root Cause) :</span>
                                    <div className="border border-gray-300 rounded p-2 min-h-[40px] whitespace-pre-wrap">{diagnostic?.cause}</div>
                                </div>
                            </div>
                        </div>

                        {/* Bloc Actions Réalisées */}
                        <div>
                            <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">3. Actions Réalisées</h3>
                            <div className="border border-gray-300 rounded p-3 min-h-[120px] text-sm whitespace-pre-wrap pl-2">
                                {actionsRealisees || "Aucune description des actions."}
                            </div>
                        </div>

                        {/* Bloc Conclusion */}
                        <div>
                            <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">4. Résultat Final & Préconisations</h3>
                            <div className="pl-2 space-y-4">
                                <div className="flex gap-6 text-sm flex-wrap">
                                    <span className="inline-flex items-center">
                                        <span className={`w-3 h-3 mr-1 border border-gray-400 ${resultat === 'Résolu définitivement' ? 'bg-[#E87722]' : 'bg-white'}`}></span> Résolu définitivement
                                    </span>
                                    <span className="inline-flex items-center">
                                        <span className={`w-3 h-3 mr-1 border border-gray-400 ${resultat === 'Solution temporaire' ? 'bg-black' : 'bg-white'}`}></span> Solution temporaire
                                    </span>
                                    <span className="inline-flex items-center">
                                        <span className={`w-3 h-3 mr-1 border border-gray-400 ${resultat === 'Renvoyé fournisseur' ? 'bg-black' : 'bg-white'}`}></span> Renvoyé fournisseur
                                    </span>
                                    <span className="inline-flex items-center">
                                        <span className={`w-3 h-3 mr-1 border border-gray-400 ${resultat === 'Mis en réforme' ? 'bg-black' : 'bg-white'}`}></span> Mis en réforme
                                    </span>
                                </div>

                                <div className="text-sm">
                                    <span className="font-semibold text-gray-600 block mb-1">Préconisations / Suivi :</span>
                                    <div className="border border-gray-300 rounded p-2 min-h-[60px] whitespace-pre-wrap italic">
                                        {preconisations || "Aucune préconisation."}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Tableau récapitulatif pour Rapport Mensuel */}
                {estRapportMensuel && (
                    <div>
                        <h3 className="font-bold text-sm bg-[#E87722] text-white p-2 mb-2">RÉCAPITULATIF DES INTERVENTIONS DU MOIS</h3>
                        <table className="print-table print-table-dense mt-2">
                            <thead>
                                <tr>
                                    <th className="w-8 text-center text-white">N°</th>
                                    <th className="text-white w-20">Date</th>
                                    <th className="text-white">Utilisateur</th>
                                    <th className="text-white">Matériel</th>
                                    <th className="text-white w-24">Type panne</th>
                                    <th className="text-white w-12 text-center">Durée</th>
                                    <th className="text-white">Résultat</th>
                                </tr>
                            </thead>
                            <tbody>
                                {interventionsMensuelles.map((inv, idx) => (
                                    <tr key={idx}>
                                        <td className="text-center">{idx + 1}</td>
                                        <td className="text-[10px]">{formatDate(inv.date)}</td>
                                        <td className="font-semibold">{inv.utilisateur}</td>
                                        <td className="truncate max-w-[150px]">{inv.materiel}</td>
                                        <td className="text-[10px]">{inv.typePanne}</td>
                                        <td className="text-center font-bold text-[#E87722]">{inv.duree}h</td>
                                        <td className="text-[10px] font-medium">{inv.resultat}</td>
                                    </tr>
                                ))}
                                {interventionsMensuelles.length === 0 && (
                                    <tr><td colSpan="7" className="text-center text-gray-400 py-8 italic">Aucune intervention enregistrée sur cette période.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                )}

                <SignatureBlock
                    signataires={[
                        "Le Technicien / Rédacteur",
                        "Chef Département Helpdesk",
                        "Visa Direction ISI"
                    ]}
                />
            </div>

            <SonatrachFooter
                user={technicien?.nom}
                page={1}
                totalPages={1}
            />
        </div>
    );
});

RapportIntervention.displayName = 'RapportIntervention';
