import React, { forwardRef } from 'react';
import { SonatrachHeader } from '../common/SonatrachHeader';
import { SonatrachFooter } from '../common/SonatrachFooter';
import { SignatureBlock } from '../common/SignatureBlock';
import { formatDate } from '../utils/formatters';

export const DemandeIntervention = forwardRef(({ data }, ref) => {
    const {
        numero,
        date,
        heure,
        demandeur,
        materiel,
        descriptionPanne,
        urgence,
        historique
    } = data || {};

    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            <SonatrachHeader
                titre="DEMANDE D'INTERVENTION"
                numero={numero}
                date={date ? formatDate(date) + (heure ? ` à ${heure}` : '') : formatDate(new Date().toISOString())}
            />

            <div className="flex-grow space-y-6">

                {/* Bloc Demandeur */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">1. Demandeur</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm pl-2">
                        <div><span className="font-semibold text-gray-600 w-24 inline-block">Nom :</span> {demandeur?.nom}</div>
                        <div><span className="font-semibold text-gray-600 w-24 inline-block">Matricule :</span> {demandeur?.matricule}</div>
                        <div><span className="font-semibold text-gray-600 w-24 inline-block">Direction :</span> {demandeur?.direction}</div>
                        <div><span className="font-semibold text-gray-600 w-24 inline-block">Bureau N° :</span> {demandeur?.bureau}</div>
                        <div><span className="font-semibold text-gray-600 w-24 inline-block">Téléphone :</span> {demandeur?.telephone}</div>
                    </div>
                </div>

                {/* Bloc Matériel */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">2. Matériel Concerné</h3>
                    <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm pl-2">
                        <div><span className="font-semibold text-gray-600 w-32 inline-block">Désignation :</span> {materiel?.designation}</div>
                        <div><span className="font-semibold text-gray-600 w-32 inline-block">Marque :</span> {materiel?.marque}</div>
                        <div><span className="font-semibold text-gray-600 w-32 inline-block">N° Série :</span> {materiel?.numSerie}</div>
                        <div><span className="font-semibold text-gray-600 w-32 inline-block">N° Inventaire :</span> {materiel?.numInventaire}</div>
                        <div className="col-span-2"><span className="font-semibold text-gray-600 w-32 inline-block">Localisation :</span> {materiel?.localisation}</div>
                    </div>
                </div>

                {/* Bloc Panne */}
                <div>
                    <h3 className="font-bold text-sm bg-gray-100 p-1 mb-2 border-l-4 border-[#E87722]">3. Description de la Panne / Incident</h3>
                    <div className="border border-gray-300 rounded p-3 min-h-[120px] text-sm whitespace-pre-wrap">
                        {descriptionPanne || "Aucune description fournie."}
                    </div>
                </div>

                {/* Bloc Détails */}
                <div className="flex gap-12 text-sm pl-2">
                    <div>
                        <span className="font-semibold text-gray-600 mr-4">Degré d'urgence :</span>
                        <span className="inline-flex items-center mr-3">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${urgence === 'critique' ? 'bg-[#E87722]' : 'bg-white'}`}></span> Critique
                        </span>
                        <span className="inline-flex items-center mr-3">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${urgence === 'urgent' ? 'bg-[#E87722]' : 'bg-white'}`}></span> Urgent
                        </span>
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${(!urgence || urgence === 'normal') ? 'bg-black' : 'bg-white'}`}></span> Normal
                        </span>
                    </div>
                    <div>
                        <span className="font-semibold text-gray-600 mr-4">Pannes antérieures ?</span>
                        <span className="inline-flex items-center mr-3">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${historique === true ? 'bg-black' : 'bg-white'}`}></span> Oui
                        </span>
                        <span className="inline-flex items-center">
                            <span className={`w-3 h-3 mr-1 border border-gray-400 ${historique === false ? 'bg-black' : 'bg-white'}`}></span> Non
                        </span>
                    </div>
                </div>

                <SignatureBlock
                    signataires={[
                        "Demandeur",
                        "Visa Chef de structure",
                        "Reçu par technicien"
                    ]}
                />
            </div>

            <SonatrachFooter
                user={demandeur?.nom}
                page={1}
                totalPages={1}
            />
        </div>
    );
});

DemandeIntervention.displayName = 'DemandeIntervention';
