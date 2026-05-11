import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { useT } from "@/i18n/useT";

const NotFound = () => {
  const navigate = useNavigate();
  const t = useT();

  useEffect(() => {
    console.error("404: Page not found:", window.location.pathname);
  }, []);

  return (
    <div
      className="min-h-screen flex items-center justify-center"
      style={{ background: "#1C1917" }}
    >
      <div className="text-center px-6">
        <p className="text-6xl font-bold mb-4" style={{ color: "#F59E0B" }}>
          404
        </p>
        <p className="text-lg mb-8" style={{ color: "#B8B3AF" }}>
          {t.notFound.desc}
        </p>
        <button
          onClick={() => navigate("/")}
          className="px-6 py-3 rounded-xl font-semibold text-sm"
          style={{ background: "#F59E0B", color: "#1C1917" }}
        >
          {t.notFound.cta}
        </button>
      </div>
    </div>
  );
};

export default NotFound;
