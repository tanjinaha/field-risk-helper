type GroundFormProps = {
    ground: string;
    setGround: (value: string) => void;
    terrain: string;
    setTerrain: (value: string) => void;
    severity: string;
    setSeverity: (value: string) => void;

};


export default function GroundForm({ ground, setGround, terrain, setTerrain, severity, setSeverity }: GroundFormProps) {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
            <h2 className="text-lg font-semibold mb-3">
                Ground Condition
            </h2>

            <select
                className="bg-slate-900 border border-slate-600 p-2 rounded"
                value={ground}
                onChange={(e) => setGround(e.target.value)}
            >
                <option value="normal">Normal / Stable</option>
                <option value="wet">Wet Surface</option>
                <option value="unstable">Unstable / Soft Clay</option>
            </select>

            <div className="mt-4">
                <label className="block mb-2 font-semibold">
                    Terrain Type
                </label>

                <select
                    className="bg-slate-900 border border-slate-600 p-2 rounded"
                    value={terrain}
                    onChange={(e) => setTerrain(e.target.value)}
                >
                    <option value="flat">Flat</option>
                    <option value="hilly">Hilly / Steep</option>
                </select>
            </div>

            <div className="mt-4">
                <label className="block mb-2 font-semibold">
                    Severity (if incident happens)
                </label>

                <select
                    className="bg-slate-900 border border-slate-600 p-2 rounded"
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value)}
                >
                    <option value="low">Low (minor injury / small delay)</option>
                    <option value="medium">Medium (injury / equipment damage)</option>
                    <option value="high">High (serious injury / major incident)</option>
                </select>
            </div>



        </div>
    );
}
