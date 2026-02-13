function App() {
  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">

      <h1 className="text-3xl font-bold text-blue-400 mb-6">
        Field Safety & Weather Risk Helper
      </h1>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Location</h2>
        <p>Stavanger Field Site</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg mb-6">
        <h2 className="text-xl font-semibold mb-4">Ground Condition</h2>
        <p>Wetland / Soft Clay</p>
      </div>

      <div className="bg-slate-800 p-6 rounded-lg shadow-lg">
        <h2 className="text-xl font-semibold mb-4">Risk Assessment</h2>
        <p className="text-yellow-400 font-bold">Status: Caution</p>
      </div>

    </div>
  );
}

export default App;
