import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { LogOut, Search, User, Settings, ChevronDown, UserCircle } from "lucide-react";

function Header() {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate("/admin/login");
  };

  return (
    <header className="admin-header">
      <div className="header-left">
        <div className="header-search">
          <Search size={20} />
          <input type="text" placeholder="Search..." />
        </div>
      </div>

      <div className="header-right">
        <div className="profile-dropdown" ref={profileRef}>
          <button 
            className="header-user"
            onClick={() => setShowProfileDropdown(!showProfileDropdown)}
          >
            <div className="user-avatar">
              <User size={20} />
            </div>
            <div className="user-info">
              <span className="user-name">{admin?.name || "Admin"}</span>
              <span className="user-role">Administrator</span>
            </div>
            <ChevronDown size={16} className="dropdown-arrow" />
          </button>

          {showProfileDropdown && (
            <div className="dropdown-menu profile-menu">
              <div className="dropdown-item" onClick={() => {
                setShowProfileDropdown(false);
                navigate('/admin/profile');
              }}>
                <UserCircle size={18} />
                <span>My Profile</span>
              </div>
              <div className="dropdown-item" onClick={() => {
                setShowProfileDropdown(false);
                navigate('/admin/settings');
              }}>
                <Settings size={18} />
                <span>Settings</span>
              </div>
              <div className="dropdown-divider"></div>
              <div className="dropdown-item logout" onClick={handleLogout}>
                <LogOut size={18} />
                <span>Logout</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
