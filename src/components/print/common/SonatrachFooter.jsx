import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SonatrachFooter({ user, page, totalPages }) {
    const generationDate = format(new Date(), 'dd/MM/yyyy HH:mm', { locale: fr });

    return (
        <div className="w-full mt-8 text-[10px] text-gray-600 no-break">
            <div className="w-full h-[1px] bg-[#E87722] mb-2" />
            <div className="flex justify-between items-center">
                <div>
                    Document généré le {generationDate} par {user || 'Système'}
                </div>
                <div className="font-semibold text-center hidden sm:block">
                    DC-ISI — Département Support Informatique (Helpdesk)
                </div>
                <div>
                    {(page && totalPages) ? `Page ${page} / ${totalPages}` : ''}
                </div>
            </div>
        </div>
    );
}
