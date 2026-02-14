type WeatherPanelProps = {
  weather: any;
  city: string;
};

export default function WeatherPanel({ weather, city }: WeatherPanelProps) {
  return (
    <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-6">
      <h2 className="text-lg font-semibold mb-3">
        Current Weather – {city}
      </h2>

      {weather ? (
        <div>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Wind Speed: {weather.windspeed} km/h</p>
        </div>
      ) : (
        <p>Loading weather data...</p>
      )}
    </div>
  );
}
