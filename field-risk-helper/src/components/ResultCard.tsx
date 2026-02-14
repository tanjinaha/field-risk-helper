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

            <div className={`inline-block px-4 py-2 rounded-full font-semibold ${riskStyle}`}>
                {risk}
            </div>

            <p className="mt-3 text-slate-300 text-sm">
                Risk Score: <span className="font-semibold">{riskScore}</span>
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
