import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import './App.css'
import Navbar from "./components/Navbar";
import JobMonitorDashboard from "./components/JobMonitorDashboard";

function App() {
  const [currentView, setCurrentView] = useState("dashboard");
  const [user, setUser] = useState(null);

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans">
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        setUser={setUser}
      />

      <main className="flex-1">
        {currentView === "dashboard" && <JobMonitorDashboard user={user} />}
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
