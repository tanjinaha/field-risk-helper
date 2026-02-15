import { useEffect, useState } from "react";
import WeatherPanel from "./components/WeatherPanel";
import GroundForm from "./components/GroundForm";
import ResultCard from "./components/ResultCard";
import MapView from "./components/MapView";


function App() {
  const [weather, setWeather] = useState<any>(null);
  const [elevation, setElevation] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");


  const [ground, setGround] = useState<string>("normal");
  const [terrain, setTerrain] = useState<string>("flat");
  const [severity, setSeverity] = useState<string>("low");
  const [loading, setLoading] = useState<boolean>(false);
  const [rainMm, setRainMm] = useState<number | null>(null);





  const [risk, setRisk] = useState<string>("");
  const [riskScore, setRiskScore] = useState<number>(0);

  const [riskReasons, setRiskReasons] = useState<string[]>([]);
  const [city, setCity] = useState<string>("Stavanger");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>({
    lat: 58.97,
    lon: 5.73,
  });
  const [error, setError] = useState<string>("");

  const searchCity = async () => {
    try {
      setError("");

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}&country=NO&count=5`
      );

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setError("City not found");
        return;
      }

      const firstResult = data.results[0];

      setCoords({
        lat: firstResult.latitude,
        lon: firstResult.longitude,
      });
    } catch (err) {
      setError("Something went wrong");
    }
  };




  // 1) Fetch weather
  const fetchWeather = async () => {
    if (!coords) return;

    try {
      setLoading(true);
      setError("");

      const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current_weather=true&hourly=precipitation,snowfall&timezone=auto`
      );

      const data = await response.json();

      // Rain: max precipitation in next 6 hours (mm)
      const rainArr: unknown = data?.hourly?.precipitation;
      if (Array.isArray(rainArr)) {
        const next6 = rainArr
          .slice(0, 6)
          .filter((v) => typeof v === "number") as number[];
        setRainMm(next6.length ? Math.max(...next6) : 0);
      } else {
        setRainMm(null);
      }

      setWeather(data.current_weather);
      setElevation(data.elevation ?? null);
      setLastUpdated(new Date().toLocaleString());
    } catch (e) {
      setError("Weather fetch failed. Click Refresh to try again.");
    } finally {
      setLoading(false);
    }
  };




  useEffect(() => {
    fetchWeather();
  }, [coords]);


  // 2) Calculate risk (whenever weather or ground changes)
  useEffect(() => {
    if (!weather) return;

    let score = 0;


    const reasons: string[] = [];

    if (weather.windspeed > 40) {
      score += 2;
      reasons.push("High wind (> 40 km/h)");
    }

    // Rain hazard (heavy precipitation)
    if (rainMm && rainMm >= 2) {
      score += 2;
      reasons.push("Moderate/Heavy precipitation (reduced traction/visibility)");
    }


    // Freeze–thaw hazard
    if (weather.temperature <= 1 && rainMm && rainMm > 0) {
      score += 3;
      reasons.push("Freeze–thaw hazard (precipitation near 0°C)");
    } else if (weather.temperature <= 0) {
      score += 2;
      reasons.push("Freezing temperature (ice risk)");
    }


    if (ground === "wet") {
      score += 2;
      reasons.push("Wet surface (slip risk)");
    }

    if (ground === "unstable") {
      score += 3;
      reasons.push("Unstable / soft ground (access risk)");
    }

    if (terrain === "hilly") {
      score += 2;
      reasons.push("Hilly terrain (slip / access difficulty)");
    }

    // Severity impact
    if (severity === "medium") {
      score += 1;
    }

    if (severity === "high") {
      score += 2;
    }
    setRiskScore(score);



    if (score >= 4) {
      setRisk("NOT RECOMMENDED");
    } else if (score >= 2) {
      setRisk("CAUTION");
    } else {
      setRisk("SAFE");
    }

    setRiskReasons(reasons);
  }, [weather, rainMm, ground, terrain, severity]);


  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-emerald-400 mb-6">
          Pre-Field Risk Screening Tool
        </h1>


        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">

          <input
            className="flex-1 px-3 py-2 rounded bg-slate-900 border border-slate-700"

            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Type a city (e.g. Oslo)"
          />

          <button
            onClick={searchCity}
            className="px-4 py-2 rounded bg-emerald-600 text-black font-semibold hover:bg-emerald-500 whitespace-nowrap"

          >
            Search
          </button>

          <button
            onClick={fetchWeather}
            disabled={loading}
            className="px-4 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700 whitespace-nowrap disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>

        </div>

        {error && (
          <p className="mb-6 text-red-400">
            {error}
          </p>
        )}



        <WeatherPanel
          weather={weather}
          city={city}
          elevation={elevation}
          lastUpdated={lastUpdated}
          loading={loading}
          rainMm={rainMm}
        />

        {coords && (
          <MapView
            key={`${coords.lat}-${coords.lon}`}
            lat={coords.lat}
            lon={coords.lon}
            city={city}
          />
        )}




        <GroundForm
          ground={ground}
          setGround={setGround}
          terrain={terrain}
          setTerrain={setTerrain}
          severity={severity}
          setSeverity={setSeverity}
        />


        <ResultCard risk={risk} riskReasons={riskReasons} riskScore={riskScore} />
        <div className="mt-6 bg-slate-800 p-6 rounded-xl border border-slate-700">
          <h2 className="text-lg font-semibold mb-3">Assumptions & Limitations</h2>

          <ul className="list-disc list-inside text-sm text-slate-300 space-y-2">
            <li>This tool is a screening indicator only — it does not predict incidents.</li>
            <li>Weather data is taken from Open-Meteo for the selected city coordinates.</li>
            <li>Ground and terrain inputs are user-selected and not measured on site.</li>
            <li>Always follow local HSE procedures, permits, and supervisor approval.</li>
          </ul>
        </div>

        <button
          onClick={() => {
            const report = [
              `Field Risk Report`,
              `Location: ${city}`,
              `Temperature: ${weather?.temperature ?? "N/A"} °C`,
              `Wind: ${weather?.windspeed ?? "N/A"} km/h`,
              `Ground: ${ground}`,
              `Terrain: ${terrain}`,
              `Severity: ${severity}`,
              `Risk: ${risk}`,
              `Risk Score: ${riskScore}`,
              `Reasons: ${riskReasons.length ? riskReasons.join(", ") : "None"}`,
            ].join("\n");

            navigator.clipboard.writeText(report);
            alert("Report copied to clipboard ✅");
          }}
          className="mt-6 px-4 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
        >
          Generate Field Report (Copy)
        </button>

      </div>
    </div>
  );
}

export default App;

