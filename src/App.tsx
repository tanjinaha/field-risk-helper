import { useEffect, useMemo, useState } from "react";
import WeatherPanel from "./components/WeatherPanel";
import GroundForm from "./components/GroundForm";
import ResultCard from "./components/ResultCard";
import MapView from "./components/MapView";
import geologyBg from "./assets/geology.jpg";

type Coords = { lat: number; lon: number };
type GeologyLayer = "bedrock" | "quaternary";
type RiskLevel = "SAFE" | "CAUTION" | "NOT RECOMMENDED";

/**
 * App goals (UI/UX):
 * - Professional "glass" container on a cinematic geology background
 * - Consistent max width + grid layout (map + context panel)
 * - Strong contrast + clear typography hierarchy
 * - Buttons: consistent size, hover, focus, selected state
 */
function App() {
  // Weather + location
  const [weather, setWeather] = useState<any>(null);
  const [elevation, setElevation] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>("");

  const [city, setCity] = useState<string>("Stavanger");
  const [coords, setCoords] = useState<Coords | null>({ lat: 58.97, lon: 5.73 });

  // User inputs
  const [ground, setGround] = useState<string>("normal");
  const [terrain, setTerrain] = useState<string>("flat");
  const [severity, setSeverity] = useState<string>("low");

  // Derived weather hazards
  const [loading, setLoading] = useState<boolean>(false);
  const [rainMm, setRainMm] = useState<number | null>(null);
  const [snowCm, setSnowCm] = useState<number | null>(null);

  // Map overlays
  const [showGeology, setShowGeology] = useState<boolean>(false);
  const [showOilGas, setShowOilGas] = useState<boolean>(false);
  const [geologyLayer, setGeologyLayer] = useState<GeologyLayer>("bedrock");

  // Risk output
  const [risk, setRisk] = useState<RiskLevel>("SAFE");
  const [riskScore, setRiskScore] = useState<number>(0);
  const [riskReasons, setRiskReasons] = useState<string[]>([]);

  const [error, setError] = useState<string>("");

  // --- Helpers ---------------------------------------------------------------

  const basinName = useMemo(() => {
    if (!coords) return "N/A";
    if (coords.lat < 60) return "North Sea Basin";
    if (coords.lat < 70) return "Norwegian Sea Basin";
    return "Barents Sea Basin";
  }, [coords]);

  const bannerImageUrl = useMemo(() => {
    // Keep these simple + stable (no need for many options)
    if (!coords) return "https://images.unsplash.com/photo-1501785888041-af3ef285b470";
    if (coords.lat < 60) return "https://images.unsplash.com/photo-1501785888041-af3ef285b470";
    if (coords.lat < 70) return "https://images.unsplash.com/photo-1441974231531-c6227db76b6e";
    return "https://images.unsplash.com/photo-1519681393784-d120267933ba";
  }, [coords]);

  const glassCard =
    "rounded-2xl border border-white/10 bg-slate-900/55 backdrop-blur-md shadow-2xl";
  const surface =
    "rounded-2xl border border-white/10 bg-slate-900/45 backdrop-blur-md shadow-xl";
  const softBorder = "border border-white/10";

  const buttonBase =
    "h-10 px-4 rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-cyan-300/40";
  const buttonNeutral =
    `${buttonBase} bg-slate-900/60 ${softBorder} hover:bg-slate-900/80`;
  const buttonPrimary =
    `${buttonBase} bg-cyan-500/15 text-cyan-200 border border-cyan-300/25 hover:bg-cyan-500/20`;
  const buttonDanger =
    `${buttonBase} bg-rose-500/15 text-rose-200 border border-rose-300/25 hover:bg-rose-500/20`;

  const badgeBase =
    "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold border";

  // --- Actions ---------------------------------------------------------------

  const searchCity = async () => {
    try {
      setError("");

      // Basic validation keeps UI clean
      const q = city.trim();
      if (!q) {
        setError("Please type a city name.");
        return;
      }

      const response = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
          q
        )}&country=NO&count=5`
      );

      const data = await response.json();

      if (!data.results || data.results.length === 0) {
        setError("City not found");
        return;
      }

      const firstResult = data.results[0];
      setCoords({ lat: firstResult.latitude, lon: firstResult.longitude });
    } catch {
      setError("Something went wrong while searching the city.");
    }
  };

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

      // Snow: max snowfall in next 6 hours (cm)
      const snowArr: unknown = data?.hourly?.snowfall;
      if (Array.isArray(snowArr)) {
        const next6Snow = snowArr
          .slice(0, 6)
          .filter((v) => typeof v === "number") as number[];
        setSnowCm(next6Snow.length ? Math.max(...next6Snow) : 0);
      } else {
        setSnowCm(null);
      }

      setWeather(data.current_weather);
      setElevation(data.elevation ?? null);
      setLastUpdated(new Date().toLocaleString());
    } catch {
      setError("Weather fetch failed. Click Refresh to try again.");
    } finally {
      setLoading(false);
    }
  };

  // --- Effects ---------------------------------------------------------------

  useEffect(() => {
    fetchWeather();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coords]);

  useEffect(() => {
    if (!weather) return;

    let score = 0;
    const reasons: string[] = [];

    // Wind
    if (weather.windspeed > 40) {
      score += 2;
      reasons.push("High wind (> 40 km/h)");
    }

    // Rain
    if (rainMm && rainMm >= 2) {
      score += 2;
      reasons.push("Moderate/Heavy precipitation (reduced traction/visibility)");
    }

    // Temperature hazards
    if (weather.temperature <= 1 && rainMm && rainMm > 0) {
      score += 3;
      reasons.push("Freeze–thaw hazard (precipitation near 0°C)");
    } else if (weather.temperature <= 0) {
      score += 2;
      reasons.push("Freezing temperature (ice risk)");
    }

    // Snow
    if (snowCm && snowCm > 1) {
      score += 2;
      reasons.push("Snow accumulation (> 1 cm)");
    }
    if (snowCm && snowCm > 5) {
      score += 3;
      reasons.push("Heavy snowfall (> 5 cm)");
    }

    // User inputs
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

    if (severity === "medium") score += 1;
    if (severity === "high") score += 2;

    setRiskScore(score);

    if (score >= 4) setRisk("NOT RECOMMENDED");
    else if (score >= 2) setRisk("CAUTION");
    else setRisk("SAFE");

    setRiskReasons(reasons);
  }, [weather, rainMm, snowCm, ground, terrain, severity]);

  // --- UI helpers ------------------------------------------------------------

  const riskBadge = useMemo(() => {
    if (risk === "SAFE") {
      return (
        <span className={`${badgeBase} bg-emerald-500/10 text-emerald-200 border-emerald-300/25`}>
          SAFE
        </span>
      );
    }
    if (risk === "CAUTION") {
      return (
        <span className={`${badgeBase} bg-amber-500/10 text-amber-200 border-amber-300/25`}>
          CAUTION
        </span>
      );
    }
    return (
      <span className={`${badgeBase} bg-rose-500/10 text-rose-200 border-rose-300/25`}>
        NOT RECOMMENDED
      </span>
    );
  }, [risk, badgeBase]);

  // --- Render ----------------------------------------------------------------

  return (
    <div className="min-h-screen text-slate-100 relative">
      {/* Cinematic background */}
      <div className="absolute inset-0">
        <img
          src={geologyBg}
          alt="Geology wallpaper background"
          className="w-full h-full object-cover"
        />
        {/* Dark gradient overlay for contrast */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/60 to-slate-950/85" />
        {/* Tiny noise-like layer (optional feel) */}
        <div className="absolute inset-0 opacity-[0.08] bg-[radial-gradient(circle_at_1px_1px,white_1px,transparent_0)] [background-size:18px_18px]" />
      </div>

      {/* Page content */}
      <div className="relative">
        <div className="mx-auto max-w-6xl px-4 py-6">
          {/* Top banner */}
          <div className={`${glassCard} overflow-hidden`}>
            <div className="relative h-44 md:h-52">
              <img
                src={bannerImageUrl}
                alt="Field landscape"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-slate-950/55" />

              <div className="absolute inset-0 p-5 md:p-6 flex flex-col justify-end">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs uppercase tracking-wider text-cyan-200/90">
                    Field planning • Norway
                  </span>
                  <span className="text-slate-400/80 text-xs">•</span>
                  <span className="text-xs text-slate-300/90">Basin: {basinName}</span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <h1 className="text-xl md:text-2xl font-semibold text-slate-50">
                    Petroleum Systems Simplified
                  </h1>
                  <span className="text-slate-400/80">—</span>
                  <p className="text-sm text-slate-200/90">
                    Field risk screening + map overlays + simplified basin context
                  </p>
                </div>

                <p className="mt-2 text-xs text-slate-300/80 max-w-3xl">
                  Educational tool: screening support only — always follow local HSE procedures and site-specific assessments.
                </p>
              </div>
            </div>

            {/* Header controls row */}
            <div className="p-4 md:p-6 border-t border-white/10">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-semibold text-slate-50">
                      Field Risk Screening
                    </h2>
                    {riskBadge}
                    <span className="text-xs text-slate-400">
                      Score: <span className="text-slate-200 font-semibold">{riskScore}</span>
                    </span>
                  </div>
                  <p className="text-sm text-slate-400 mt-1">
                    Weather-based screening + user ground/terrain inputs + geology/oil & gas learning overlays.
                  </p>
                </div>

                {/* Search + actions */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                  <div className="flex items-center gap-2">
                    <input
                      className="h-10 w-full sm:w-64 px-3 rounded-xl bg-slate-950/40 border border-white/10 text-sm placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Type a city (e.g. Oslo)"
                    />
                    <button onClick={searchCity} className={buttonPrimary}>
                      Search
                    </button>
                  </div>

                  <button
                    onClick={fetchWeather}
                    disabled={loading}
                    className={`${buttonNeutral} disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {loading ? "Loading..." : "Refresh"}
                  </button>
                </div>
              </div>

              {error && <p className="mt-3 text-sm text-rose-300">{error}</p>}
            </div>
          </div>

          {/* Main content grid */}
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left column */}
            <div className="lg:col-span-8 space-y-6">
              {/* Weather card */}
              <div className={surface}>
                <div className="p-4 md:p-6">
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-sm font-semibold text-slate-50">
                      Current Weather
                    </h3>
                    <div className="text-xs text-slate-400">
                      {lastUpdated ? `Last updated: ${lastUpdated}` : ""}
                    </div>
                  </div>

                  <div className="mt-4">
                    <WeatherPanel
                      weather={weather}
                      city={city}
                      elevation={elevation}
                      lastUpdated={lastUpdated}
                      loading={loading}
                      rainMm={rainMm}
                      snowCm={snowCm}
                    />
                  </div>
                </div>
              </div>

              {/* Map + overlays */}
              <div className={surface}>
                <div className="p-4 md:p-6">
                  <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-50">
                        Map & Learning Overlays
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Geological data source: NGU (map overlay). Use overlays for learning and pre-field planning.
                      </p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        onClick={() => setShowGeology((prev) => !prev)}
                        className={showGeology ? buttonPrimary : buttonNeutral}
                      >
                        {showGeology ? "Hide Geology (NGU)" : "Show Geology (NGU)"}
                      </button>

                      <button
                        onClick={() => setShowOilGas((prev) => !prev)}
                        className={showOilGas ? buttonPrimary : buttonNeutral}
                      >
                        {showOilGas ? "Hide Oil & Gas" : "Show Oil & Gas"}
                      </button>

                      {showGeology && (
                        <select
                          value={geologyLayer}
                          onChange={(e) =>
                            setGeologyLayer(e.target.value as GeologyLayer)
                          }
                          className="h-10 px-3 rounded-xl bg-slate-950/40 border border-white/10 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-cyan-300/40"
                        >
                          <option value="bedrock">Bedrock (Berggrunn)</option>
                          <option value="quaternary">Loose deposits (Løsmasser)</option>
                        </select>
                      )}
                    </div>
                  </div>

                  <div className="mt-4">
                    {coords && (
                      <MapView
                        key={`${coords.lat}-${coords.lon}`}
                        lat={coords.lat}
                        lon={coords.lon}
                        city={city}
                        showGeology={showGeology}
                        geologyLayer={geologyLayer}
                        showOilGas={showOilGas}
                      />
                    )}
                  </div>
                </div>
              </div>

              {/* Ground/terrain inputs */}
              <div className={surface}>
                <div className="p-4 md:p-6">
                  <h3 className="text-sm font-semibold text-slate-50">
                    Ground & Terrain (User Input)
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Select what you expect on site. These inputs affect the screening score.
                  </p>

                  <div className="mt-4">
                    <GroundForm
                      ground={ground}
                      setGround={setGround}
                      terrain={terrain}
                      setTerrain={setTerrain}
                      severity={severity}
                      setSeverity={setSeverity}
                    />
                  </div>
                </div>
              </div>

              {/* Results */}
              <div className={surface}>
                <div className="p-4 md:p-6">
                  <h3 className="text-sm font-semibold text-slate-50">
                    Screening Result
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    This is an indicator only. Always follow local HSE procedures and supervisor approval.
                  </p>

                  <div className="mt-4">
                    <ResultCard risk={risk} riskReasons={riskReasons} riskScore={riskScore} />
                  </div>

                  <div className="mt-4 flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() => {
                        const report = [
                          "Field Risk Report",
                          `Location: ${city}`,
                          `Temperature: ${weather?.temperature ?? "N/A"} °C`,
                          `Wind: ${weather?.windspeed ?? "N/A"} km/h`,
                          `Rain (max next 6h): ${rainMm ?? "N/A"} mm`,
                          `Snow (max next 6h): ${snowCm ?? "N/A"} cm`,
                          `Elevation: ${elevation ?? "N/A"} m`,
                          `Coordinates: ${coords ? `${coords.lat}, ${coords.lon}` : "N/A"}`,
                          `Basin (simplified): ${basinName}`,
                          "Geological context: Interpret map panel for structural and deposit-related field considerations.",
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
                      className={buttonNeutral}
                    >
                      Generate Field Report (Copy)
                    </button>

                    <button
                      onClick={() => {
                        // A quick “reset inputs” that users love
                        setGround("normal");
                        setTerrain("flat");
                        setSeverity("low");
                      }}
                      className={buttonDanger}
                    >
                      Reset Inputs
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right column: Professional context panel */}
            <div className="lg:col-span-4 space-y-6">
              <div className={surface}>
                <div className="p-4 md:p-6">
                  <h3 className="text-sm font-semibold text-slate-50">
                    How to use (3 steps)
                  </h3>
                  <ol className="mt-3 list-decimal ml-5 space-y-2 text-sm text-slate-200/90">
                    <li>Search a location and refresh weather.</li>
                    <li>Select ground + terrain conditions (expected on site).</li>
                    <li>Read the result, then use overlays for learning context.</li>
                  </ol>
                  <p className="mt-3 text-xs text-slate-400">
                    Educational tool: screening support only — always follow local HSE procedures.
                  </p>
                </div>
              </div>

              <div className={surface}>
                <div className="p-4 md:p-6">
                  <h3 className="text-sm font-semibold text-slate-50">
                    About this tool
                  </h3>
                  <p className="mt-3 text-sm text-slate-200/90">
                    This app provides a pre-field screening indicator using weather data, user-selected
                    ground and terrain conditions, and simplified geological context. It is designed for
                    educational planning support and does not replace official HSE procedures.
                  </p>

                  <div className="mt-4 rounded-xl bg-slate-950/35 border border-white/10 p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-400">
                      Current context
                    </div>
                    <div className="mt-2 text-sm text-slate-200">
                      <div className="flex justify-between gap-3">
                        <span className="text-slate-400">Basin</span>
                        <span className="font-semibold">{basinName}</span>
                      </div>
                      <div className="flex justify-between gap-3 mt-1">
                        <span className="text-slate-400">Geology overlay</span>
                        <span className="font-semibold">
                          {showGeology ? (geologyLayer === "bedrock" ? "Bedrock" : "Loose deposits") : "Off"}
                        </span>
                      </div>
                      <div className="flex justify-between gap-3 mt-1">
                        <span className="text-slate-400">Oil & gas context</span>
                        <span className="font-semibold">{showOilGas ? "On" : "Off"}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={surface}>
                <div className="p-4 md:p-6">
                  <h3 className="text-sm font-semibold text-slate-50">
                    Assumptions & limitations
                  </h3>
                  <ul className="mt-3 list-disc list-inside text-sm text-slate-200/90 space-y-2">
                    <li>This tool is a screening indicator only — it does not predict incidents.</li>
                    <li>Weather data is taken from Open-Meteo for the selected coordinates.</li>
                    <li>Ground and terrain inputs are user-selected and not measured on site.</li>
                    <li>Always follow local HSE procedures, permits, and supervisor approval.</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center text-xs text-slate-400">
            Petroleum Systems Simplified • Educational demo • Norway focus
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
