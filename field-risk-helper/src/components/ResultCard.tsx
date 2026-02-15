type ResultCardProps = {
    risk: string;
    riskReasons: string[];
    riskScore: number;
};

export default function ResultCard({ risk, riskReasons, riskScore }: ResultCardProps) {
    const riskStyle =
        risk === "SAFE"
            ? "bg-green-500 text-black"
            : risk === "CAUTION"
                ? "bg-yellow-400 text-black"
                : "bg-red-600 text-white";

    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
            <h2 className="text-lg font-semibold mb-3">
                Risk Assessment
            </h2>

            <div className={`inline-flex items-center px-6 py-3 rounded-full font-bold text-lg tracking-wide ${riskStyle}`}>

                <span className="mr-3 text-xl">●</span>

                {risk === "NOT RECOMMENDED" ? "⚠ NOT RECOMMENDED – FIELD ENTRY RISK" : risk}

            </div>


            <p className="mt-3 text-slate-300 text-sm">
                Risk Score:
                <span className="ml-2 px-2 py-1 rounded bg-slate-900 border border-slate-700 font-semibold">
                    {riskScore}
                </span>
            </p>



            <ul className="mt-3 list-disc list-inside text-sm text-slate-300">
                {riskReasons.length > 0 ? (
                    riskReasons.map((r, i) => <li key={i}>{r}</li>)
                ) : (
                    <li>No risk factors detected</li>
                )}
            </ul>
        </div>
    );
}
