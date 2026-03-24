export const FormSection = ({ title, children }) => (
    <div className="border-l-[3px] border-[#E87722] pl-5 space-y-4">
        <h3 className="text-sm font-bold text-[#E87722] uppercase tracking-wider">{title}</h3>
        {children}
    </div>
)
