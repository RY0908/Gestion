import React, { forwardRef } from 'react';
import { SonatrachHeader } from '../common/SonatrachHeader';
import { SonatrachFooter } from '../common/SonatrachFooter';
import { SignatureBlock } from '../common/SignatureBlock';
import { formatDate } from '../utils/formatters';

export const FicheIntervention = forwardRef(({ data }, ref) => {
    const {
        numero,
        numeroDemande,
        date,
        heureDebut,
        heureFin,
        technicien,
        materiel,
        typeIntervention,
        descriptionTravaux,
        composants = [],
        resultat,
        observations
    } = data || {};

    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            <SonatrachHeader
                titre="FICHE D'INTERVENTION"
            />

            <div className="flex-grow space-y-5">

                {/* Méta-infos */}
                <div className="flex justify-between border-b pb-2 text-sm font-medium">
                    <div><span className="text-[#E87722]">N° Fiche :</span> {numero || '---'}</div>
                    <div><span className="text-[#E87722]">Liée à DI N° :</span> {numeroDemande || '---'}</div>
                    <div>
                        <span className="text-[#E87722]">Date :</span> {formatDate(date || new Date().toISOString())} &nbsp;|&nbsp;
                        <span className="text-[#E87722]"> Début :</span> {heureDebut || '--:--'} &nbsp;|&nbsp;
                        <span className="text-[#E87722]"> Fin :</span> {heureFin || '--:--'}
                    </div>
                </div>

                {/* Intervenant & Matériel */}
                <div className="grid grid-cols-2 gap-4 text-sm mt-4">
                    <div className="border border-gray-200 p-2 rounded">
                        <span className="font-bold text-[#E87722] block mb-1">TECHNICIEN</span>
                        <div><span className="font-semibold text-gray-600">Nom :</span> {technicien?.nom}</div>
                        <div><span className="font-semibold text-gray-600">Matricule :</span> {technicien?.matricule}</div>
                        <div><span className="font-semibold text-gray-600">Service :</span> {technicien?.service}</div>
                    </div>
                    <div className="border border-gray-200 p-2 rounded">
                        <span className="font-bold text-[#E87722] block mb-1">MATÉRIEL</span>
                        <div><span className="font-semibold text-gray-600">Désignation :</span> {materiel?.designation}</div>
                        <div><span className="font-semibold text-gray-600">N° Série :</span> {materiel?.numSerie}</div>
                        <div><span className="font-semibold text-gray-600">N° Inventaire :</span> {materiel?.numInventaire}</div>
                    </div>
                </div>

                {/* Type d'Intervention */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">Type d'Intervention</h3>
                    <div className="flex gap-6 text-sm pl-2 flex-wrap">
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${typeIntervention === 'réparation' ? 'bg-black' : 'bg-white'}`}></span> Réparation
                        </span>
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${typeIntervention === 'remplacement' ? 'bg-black' : 'bg-white'}`}></span> Remplacement
                        </span>
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${typeIntervention === 'configuration' ? 'bg-black' : 'bg-white'}`}></span> Configuration
                        </span>
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${typeIntervention === 'installation' ? 'bg-black' : 'bg-white'}`}></span> Installation
                        </span>
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${!['réparation', 'remplacement', 'configuration', 'installation'].includes(typeIntervention) && typeIntervention ? 'bg-black' : 'bg-white'}`}></span> Autre : {['réparation', 'remplacement', 'configuration', 'installation'].includes(typeIntervention) ? '___________' : typeIntervention}
                        </span>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">Description des Travaux Effectués</h3>
                    <div className="border border-gray-300 rounded p-3 min-h-[80px] text-sm whitespace-pre-wrap">
                        {descriptionTravaux || ''}
                    </div>
                </div>

                {/* Composants Associés */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">Pièces / Composants Utilisés</h3>
                    <table className="print-table print-table-dense">
                        <thead>
                            <tr>
                                <th className="text-white">Désignation</th>
                                <th className="text-white">Référence</th>
                                <th className="w-16 text-center text-white">Qté</th>
                                <th className="text-white">N° Série Remplacé</th>
                            </tr>
                        </thead>
                        <tbody>
                            {composants.length > 0 ? composants.map((comp, idx) => (
                                <tr key={idx}>
                                    <td>{comp.designation}</td>
                                    <td className="font-mono text-xs">{comp.reference}</td>
                                    <td className="text-center font-semibold">{comp.quantite}</td>
                                    <td className="font-mono text-xs">{comp.numSerieRemplace || 'N/A'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4" className="text-center text-gray-400 py-2 italic font-medium">
                                        Aucune pièce utilisée
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Résultat */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">Résultat de l'intervention</h3>
                    <div className="flex gap-6 text-sm pl-2 flex-wrap mb-4">
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${resultat === 'resolu' ? 'bg-[#E87722]' : 'bg-white'}`}></span> Résolu
                        </span>
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${resultat === 'en_cours' ? 'bg-black' : 'bg-white'}`}></span> En cours
                        </span>
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${resultat === 'reparation_externe' ? 'bg-black' : 'bg-white'}`}></span> Nécessite réparation externe
                        </span>
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${resultat === 'a_reformer' ? 'bg-black' : 'bg-white'}`}></span> Matériel à réformer
                        </span>
                    </div>

                    <div className="text-sm pl-2">
                        <span className="font-semibold text-gray-600 block mb-1">Observations / Recommandations :</span>
                        <div className="border border-gray-300 rounded p-2 min-h-[50px] whitespace-pre-wrap">
                            {observations || ''}
                        </div>
                    </div>
                </div>

                <SignatureBlock
                    signataires={[
                        "Technicien",
                        "Chef Helpdesk",
                        "Demandeur (satisfaction)"
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

FicheIntervention.displayName = 'FicheIntervention';
