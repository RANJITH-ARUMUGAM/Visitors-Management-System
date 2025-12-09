import React from "react";
import { useLocation, Link } from "react-router-dom";
import '../BreadCrumBar/BreadCrum.css'

const Breadcrumbs = () => {
  const location = useLocation();
  const pathnames = location.pathname.split("/").filter((x) => x);

  return (
    <nav className="breadcrumbs mt-0" aria-label="breadcrumb">
      <Link to="/" className="breadcrumb-item mt-0">
        Home
      </Link>
      {/* Render Breadcrumb Items with Proper Separators */}
      {pathnames.map((name, index) => {
        const routeTo = `/${pathnames.slice(0, index + 1).join("/")}`;
        const formattedName = name.charAt(0).toUpperCase() + name.slice(1); // Sentence Case
        return (
          <span key={routeTo} className="breadcrumb-item">
            <span className="separator"></span>          {/* Properly placed separator */}
            <Link to={routeTo}>{formattedName}</Link>
          </span>
        );
      })}

    </nav>
  );
};

export default Breadcrumbs;
