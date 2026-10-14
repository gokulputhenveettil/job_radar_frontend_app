import { useSelector } from "react-redux";
import './App.css'
import Navbar from "./components/Navbar";
import JobMonitorDashboard from "./components/JobMonitorDashboard";

function App() {
  const currentView = useSelector((state) => state.app.currentView);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar />

      <main className="flex-1">
        {currentView === "dashboard" && <JobMonitorDashboard />}
        {currentView === "analytics" && (
          <div className="max-w-6xl mx-auto p-6 text-gray-500">
            Analytics view is under construction.
          </div>
        )}
        {currentView === "settings" && (
          <div className="max-w-6xl mx-auto p-6 text-gray-500">
            User notification and scan frequency settings go here.
          </div>
        )}
      </main>
    </div>
  );
}

export default App
