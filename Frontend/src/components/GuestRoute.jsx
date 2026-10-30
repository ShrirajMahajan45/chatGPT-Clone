
import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";

const GuestRoute = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const checkAuth = async () => {
      try {
        await axios.get("http://localhost:3000/api/auth/me", {
          withCredentials: true,
        });

        if (isMounted) {
          setIsAuthenticated(true);
        }
      } catch (err) {
        if (!isMounted) return;

        if (err.response?.status === 401) {
          setIsAuthenticated(false);
        } else {
          setError("Unable to verify your login. Please try again.");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    checkAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#212121] text-white">
        <p className="text-sm text-gray-400">Checking your session...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#212121] px-4 text-white">
        <p className="text-center text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="rounded-lg bg-violet-600 px-5 py-2 hover:bg-violet-500"
        >
          Try again
        </button>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default GuestRoute;
