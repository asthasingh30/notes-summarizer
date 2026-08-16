import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="brand">
          <span className="brand-mark">Marginalia</span>
        </NavLink>

        {user && (
          <nav className="nav-links">
            <NavLink
              to="/"
              end
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              Summarise
            </NavLink>
            <NavLink
              to="/my-summaries"
              className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}
            >
              My Summaries
            </NavLink>
            <span className="nav-user">{user.email}</span>
            <button className="btn-link" onClick={handleLogout}>
              Log out
            </button>
          </nav>
        )}
      </div>
    </header>
  );
}
