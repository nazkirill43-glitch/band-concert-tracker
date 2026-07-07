import { useEffect, useState, useCallback } from "react";
import api from "../../api";
import BandsPanel from "./BandsPanel";
import ConcertsPanel from "./ConcertsPanel";
import UserBrowser from "./UserBrowser";

const AdminView = ({ onError }) => {
  const [bands, setBands] = useState([]);
  const [concerts, setConcerts] = useState([]);

  const loadBands = useCallback(async () => {
    try {
      const { data } = await api.get("/bands");
      setBands(data);
    } catch (err) {
      onError(err);
    }
  }, [onError]);

  const loadConcerts = useCallback(async () => {
    try {
      const { data } = await api.get("/concerts");
      setConcerts(data);
    } catch (err) {
      onError(err);
    }
  }, [onError]);

  useEffect(() => {
    loadBands();
    loadConcerts();
  }, [loadBands, loadConcerts]);

  const reloadBands = async () => {
    await loadBands();
    await loadConcerts();
  };

  return (
    <div className="grid">
      <BandsPanel bands={bands} reload={reloadBands} onError={onError} />
      <ConcertsPanel
        bands={bands}
        concerts={concerts}
        reload={loadConcerts}
        onError={onError}
      />
    </div>
  );
};

const Dashboard = () => {
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const handleError = useCallback((err) => {
    if (err.response && err.response.status === 401) {
      localStorage.removeItem("token");
      window.location = "/login";
      return;
    }
    setError(err.response?.data?.message || "An error occurred");
  }, []);

  useEffect(() => {
    const loadMe = async () => {
      try {
        const { data } = await api.get("/users/me");
        setRole(data.role);
      } catch (err) {
        if (err.response && err.response.status === 401) {
          localStorage.removeItem("token");
          window.location = "/login";
          return;
        }
        setError("An error occurred while fetching user data");
      } finally {
        setLoading(false);
      }
    };
    loadMe();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location = "/login";
  };

  return (
    <div>
      <nav className="navbar">
        <h1 className="brand">Band &amp; Concert Tracker</h1>
        <div className="nav-right">
          {role && (
            <span
              className={`badge ${
                role === "admin" ? "badge-admin" : "badge-user"
              }`}
            >
              {role === "admin" ? "Administrator" : "User"}
            </span>
          )}
          <button className="btn btn-outline btn-sm" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </nav>

      <div className="container">
        {error && <div className="error-msg">{error}</div>}
        {loading ? (
          <p className="muted">Loading...</p>
        ) : role === "admin" ? (
          <AdminView onError={handleError} />
        ) : (
          <UserBrowser onError={handleError} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
