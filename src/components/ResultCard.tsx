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
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">
                Risk Assessment
            </h2>

            <div className={`inline-flex items-center px-8 py-4 rounded-full font-bold text-2xl tracking-wide shadow-lg ${riskStyle}`}>

                <span className="mr-3 text-xl">●</span>

                {risk === "NOT RECOMMENDED" ? "⚠ NOT RECOMMENDED – FIELD ENTRY RISK" : risk}

            </div>


            <p className="mt-4 text-slate-300 text-sm flex items-center gap-2">
                <span>📊</span>
                <span>Risk Score:</span>

                <span className="ml-2 px-2 py-1 rounded bg-slate-900 border border-slate-700 font-semibold">
                    {riskScore}
                </span>
            </p>
            <p className="mt-2 text-xs text-slate-400 flex items-center gap-2">
                <span>🗺️</span>
                <span>
                    Geological context is available in the map panel for interpretation.
                </span>
            </p>


            <p className="mt-3 text-sm text-slate-300 flex items-start gap-2">
                <span>🧠</span>
                <span>
                    Summary:{" "}
                    {riskReasons.length > 0
                        ? riskReasons.slice(0, 2).join(" + ")
                        : "No major hazards detected from the inputs."}
                </span>
            </p>




            <ul className="mt-3 list-disc list-inside text-sm text-slate-300">
                {riskReasons.length > 0 ? (
                    riskReasons.map((r, i) => <li key={i}>{r}</li>)
                ) : (
                    <li>No risk factors detected</li>
                )}
            </ul>

            {risk !== "SAFE" && (
                <div className="mt-3 p-2 rounded bg-yellow-900/30 border border-yellow-700 text-yellow-300 text-xs">
                    Geological conditions shown in the map may further influence field safety.
                </div>
            )}

        </div>
    );
}
