import { useEffect, useState } from "react";
import WeatherPanel from "./components/WeatherPanel";
import GroundForm from "./components/GroundForm";
import ResultCard from "./components/ResultCard";

function App() {
  const [weather, setWeather] = useState<any>(null);
  const [ground, setGround] = useState<string>("normal");
  const [terrain, setTerrain] = useState<string>("flat");
  const [severity, setSeverity] = useState<string>("low");



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
        `https://geocoding-api.open-meteo.com/v1/search?name=${city}`
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
    const response = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${coords?.lat}&longitude=${coords?.lon}&current_weather=true`

    );
    const data = await response.json();
    setWeather(data.current_weather);
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

    if (weather.temperature <= 0) {
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
  }, [weather, ground]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-emerald-400 mb-6">
          Pre-Field Risk Screening Tool
        </h1>


        <div className="mb-6 flex gap-3">
          <input
            className="w-full max-w-sm px-3 py-2 rounded bg-slate-900 border border-slate-700"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="Type a city (e.g. Oslo)"
          />

          <button
            onClick={searchCity}
            className="px-4 py-2 rounded bg-emerald-600 text-black font-semibold hover:bg-emerald-500"
          >
            Search
          </button>

          <button
            onClick={fetchWeather}
            className="px-4 py-2 rounded bg-slate-800 border border-slate-700 hover:bg-slate-700"
          >
            Refresh
          </button>
        </div>

        {error && (
          <p className="mb-6 text-red-400">
            {error}
          </p>
        )}



        <WeatherPanel weather={weather} city={city} />

        <GroundForm
          ground={ground}
          setGround={setGround}
          terrain={terrain}
          setTerrain={setTerrain}
          severity={severity}
          setSeverity={setSeverity}
        />


        <ResultCard risk={risk} riskReasons={riskReasons} riskScore={riskScore} />
      </div>
    </div>
  );
}

export default App;

