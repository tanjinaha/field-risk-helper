type WeatherPanelProps = {
    weather: any;
    city: string;
    elevation: number | null;
    lastUpdated: string;
    loading: boolean;
    rainMm: number | null;
    snowCm: number | null;

};

export default function WeatherPanel({ weather, city, elevation, lastUpdated, loading, rainMm, snowCm }: WeatherPanelProps) {
    return (
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6 shadow-lg">
            <h2 className="text-lg font-semibold mb-3">
                Current Weather – {city}
            </h2>

            {loading ? (
                <p className="text-slate-400">Fetching updated weather...</p>
            ) : weather ? (
                <div>
                    <p>Temperature: {weather.temperature}°C</p>
                    <p>Wind Speed: {weather.windspeed} km/h</p>
                    <p>Rain (hourly): {rainMm ?? "N/A"} mm</p>
                    <p>Snow (hourly): {snowCm ?? "N/A"} cm</p>


                    {elevation !== null && (
                        <p>Elevation: {elevation} m a.s.l.</p>
                    )}
                    {lastUpdated && (
                        <p className="text-xs text-slate-400 mt-2">
                            Last updated: {lastUpdated}
                        </p>
                    )}
                </div>
            ) : (
                <p>Loading weather data...</p>
            )}

        </div>
    );
}
