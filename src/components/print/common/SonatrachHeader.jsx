import React from 'react';

export function SonatrachHeader({ titre, numero, date }) {
    return (
        <div className="w-full mb-6">
            <div className="flex justify-between items-start mb-4">
                <div className="flex flex-col">
                    <div className="text-[#E87722] font-bold text-2xl tracking-wider mb-1">
                        SONATRACH
                    </div>
                    <div className="text-sm text-[#2C2C2C] font-semibold">
                        Direction Centrale ISI
                    </div>
                </div>
                <div className="flex flex-col items-end text-sm text-[#2C2C2C]">
                    {numero && <div className="font-semibold mb-1">N° : {numero}</div>}
                    {date && <div>Date : {date}</div>}
                </div>
            </div>

            <div className="flex justify-center mb-4 mt-2">
                <h1 className="text-xl font-bold uppercase underline decoration-2 underline-offset-4 text-center text-[#2C2C2C]">
                    {titre}
                </h1>
            </div>

            <div className="w-full h-[2px] bg-[#E87722] mb-4" />
        </div>
    );
}
