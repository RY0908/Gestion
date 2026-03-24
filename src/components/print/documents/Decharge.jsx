import React, { forwardRef } from 'react';
import { SonatrachFooter } from '../common/SonatrachFooter';
import { formatDate } from '../utils/formatters';

export const Decharge = forwardRef(({ data }, ref) => {
    const {
        activite,
        structure,
        dateRemise,
        cedant,
        recevant,
        articles = [],
        numero
    } = data || {};

    return (
        <div ref={ref} className="w-full h-full flex flex-col bg-white">
            {/* En-tête spécifique Décharge */}
            <div className="w-full mb-8">
                <div className="text-[#E87722] font-bold text-3xl tracking-wider mb-4">
                    SONATRACH
                </div>
                <div className="flex justify-between items-start text-sm">
                    <div className="flex flex-col space-y-1 font-semibold text-[#2C2C2C]">
                        <div>Activité : {activite || '_________________'}</div>
                        <div>Structure : {structure || '_________________'}</div>
                    </div>
                    {numero && (
                        <div className="font-mono text-gray-500 text-xs">Réf : {numero}</div>
                    )}
                </div>

                <div className="flex justify-center mt-12 mb-10">
                    <h1 className="text-2xl font-bold uppercase underline decoration-2 underline-offset-4 text-center text-[#2C2C2C]">
                        DÉCHARGE MATÉRIEL
                    </h1>
                </div>
            </div>

            <div className="flex-grow flex flex-col space-y-8">

                {/* Texte Introductif */}
                <div className="text-base leading-relaxed pl-4 border-l-4 border-[#E87722]">
                    <p>
                        Je Soussigné(e) M/Mme : <span className="font-bold">{recevant?.nom} {recevant?.prenom}</span>
                    </p>
                    <p className="mt-2">
                        Reconnais avoir reçu le : <span className="font-bold">{dateRemise ? formatDate(dateRemise) : '___________'}</span>
                    </p>
                    <p className="mt-2">
                        Le matériel informatique indiqué ci-dessous :
                    </p>
                </div>

                {/* Tableau du Matériel */}
                <div className="mt-8 mb-12">
                    <table className="print-table">
                        <thead>
                            <tr>
                                <th className="text-white">DÉSIGNATION</th>
                                <th className="text-white text-center">MARQUE</th>
                                <th className="text-white text-center">MODÈLE</th>
                                <th className="text-white text-center">N° SÉRIE</th>
                                <th className="text-white">OBSERVATION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {articles.map((item, idx) => (
                                <tr key={idx}>
                                    <td className="font-medium p-3">{item.designation}</td>
                                    <td className="text-center p-3">{item.marque}</td>
                                    <td className="text-center p-3 text-xs">{item.modele}</td>
                                    <td className="text-center font-mono text-xs p-3">{item.numSerie}</td>
                                    <td className="text-xs p-3">{item.observation}</td>
                                </tr>
                            ))}
                            {/* Lignes vides (Minimum 5 lignes) */}
                            {Array.from({ length: Math.max(0, 5 - articles.length) }).map((_, idx) => (
                                <tr key={`empty-${idx}`}>
                                    <td className="p-4"></td>
                                    <td className="p-4"></td>
                                    <td className="p-4"></td>
                                    <td className="p-4"></td>
                                    <td className="p-4"></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Signatures 2 Colonnes */}
                <div className="grid grid-cols-2 gap-12 mt-auto pt-16">
                    <div className="flex flex-col space-y-4">
                        <div className="font-bold text-center underline mb-4 text-[#E87722]">PARTIE CÉDANTE</div>
                        <div className="text-sm"><span className="font-semibold w-24 inline-block text-gray-600">NOM :</span> {cedant?.nom}</div>
                        <div className="text-sm"><span className="font-semibold w-24 inline-block text-gray-600">PRÉNOM :</span> {cedant?.prenom}</div>
                        <div className="text-sm"><span className="font-semibold w-24 inline-block text-gray-600">STRUCTURE :</span> {cedant?.structure}</div>
                        <div className="text-sm flex flex-col mt-4">
                            <span className="font-semibold mb-8 text-gray-600">DATE ET SIGNATURE :</span>
                            <div className="h-[80px]"></div>
                        </div>
                    </div>

                    <div className="flex flex-col space-y-4">
                        <div className="font-bold text-center underline mb-4 text-[#E87722]">PARTIE RECEVANTE</div>
                        <div className="text-sm"><span className="font-semibold w-24 inline-block text-gray-600">NOM :</span> {recevant?.nom}</div>
                        <div className="text-sm"><span className="font-semibold w-24 inline-block text-gray-600">PRÉNOM :</span> {recevant?.prenom}</div>
                        <div className="text-sm"><span className="font-semibold w-24 inline-block text-gray-600">STRUCTURE :</span> {recevant?.structure}</div>
                        <div className="text-sm flex flex-col mt-4">
                            <span className="font-semibold mb-8 text-gray-600">DATE ET SIGNATURE :</span>
                            <div className="h-[80px]"></div>
                        </div>
                    </div>
                </div>

            </div>

            <SonatrachFooter
                user={`${cedant?.nom || ''} ${cedant?.prenom || ''}`.trim() || 'Système'}
                page={1}
                totalPages={1}
            />
        </div>
    );
});

Decharge.displayName = 'Decharge';
