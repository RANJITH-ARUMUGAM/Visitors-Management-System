import React, { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home, Shield, Users, FileText, Settings, BarChart3, Clock, CheckCircle } from "lucide-react";

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const getRouteIcon = (routeName) => {
    const iconMap = {
      'dashboard': <BarChart3 size={14} />,
      'gatepass': <FileText size={14} />,
      'gatepasses': <FileText size={14} />,
      'create': <FileText size={14} />,
      'edit': <Settings size={14} />,
      'view': <FileText size={14} />,
      'pending': <Clock size={14} />,
      'approved': <CheckCircle size={14} />,
      'rejected': <Shield size={14} />,
      'visitors': <Users size={14} />,
      'reports': <BarChart3 size={14} />,
      'settings': <Settings size={14} />,
      'profile': <Users size={14} />,
      'security': <Shield size={14} />,
      'admin': <Shield size={14} />
    };
    return iconMap[routeName.toLowerCase()] || <FileText size={14} />;
  };

  const formatRouteName = (name) => {
    const nameMap = {
      'gatepass': 'Gate Pass',
      'gatepasses': 'Gate Passes',
      'create': 'Create New',
      'edit': 'Edit',
      'view': 'View Details',
      'pending': 'Pending Approval',
      'approved': 'Approved',
      'rejected': 'Rejected',
      'visitors': 'Visitors',
      'reports': 'Reports',
      'settings': 'Settings',
      'profile': 'Profile',
      'security': 'Security',
      'admin': 'Administration',
      'dashboard': 'Dashboard'
    };
    return nameMap[name.toLowerCase()] || name.charAt(0).toUpperCase() + name.slice(1);
  };

  return (
    <nav 
      className={`breadcrumb-container ${isVisible ? 'visible' : ''}`}
      aria-label="Vehicle System navigation breadcrumb"
    >
      <div className="breadcrumb-wrapper">
        {/* Home/Dashboard Link */}
        <Link to="/" className="breadcrumb-item home-item">
          <Home className="home-icon" size={16} />
          <span className="breadcrumb-text">Vehicle System</span>
          <div className="item-shine"></div>
        </Link>

        {/* Dynamic Breadcrumb Items */}
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
          const formattedName = formatRouteName(name);
          const isLast = index === pathnames.length - 1;
          const routeIcon = getRouteIcon(name);

          return (
            <React.Fragment key={routeTo}>
              {/* Separator */}
              <div className="separator">
                <ChevronRight size={16} className="separator-icon" />
              </div>

              {/* Breadcrumb Item */}
              <Link 
                to={isLast ? '#' : routeTo} 
                className={`breadcrumb-item ${isLast ? 'current-item' : ''}`}
                aria-current={isLast ? 'page' : undefined}
                onClick={isLast ? (e) => e.preventDefault() : undefined}
              >
                <span className="route-icon">{routeIcon}</span>
                <span className="breadcrumb-text">{formattedName}</span>
                {!isLast && <div className="item-shine"></div>}
                <div className="item-glow"></div>
              </Link>
            </React.Fragment>
          );
        })}
      </div>
    </nav>
  );
};

export default Breadcrumbs;