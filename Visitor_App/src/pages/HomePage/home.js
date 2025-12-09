import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import '../HomePage/home.css';
import '../HomePage/BreadCrumBar/BreadCrum.css';
import { SERVER_PORT } from '../../constant';
import axios from 'axios';

///////////////////////////////////////////////////////////////////////////
import TopNavbar from '../HomePage/TopNavBar/Topnavbar.js';
import EditProfile from '../HomePage/EditProfile/editProfile.js';
import ChangePassword from '../HomePage/ChangePassword/changePassword.js';
import Breadcrumbs from './BreadCrumBar/BreadCrum.js';
import Card from './Card/Card.js';
import Meta from "../MetaData/MetaForm.js";
import AddGateEntry from "../Transaction/VisitorsDetails/AddGateEntry.js";
import GenerateVisitorIDCard from "../Transaction/VisitorsDetails/GenerateVisitorIDCard.js";
import VisitorsDetails from '../Transaction/VisitorsDetails/VisitorsDetails.js';
import ViewVisitor from '../Transaction/VisitorsDetails/ViewVisitor.js';
import EditVisitor from '../Transaction/VisitorsDetails/EditVisitor.js';
import Appointment from '../Transaction/Appointment/Appointment.js';
import EditAppointment from '../Transaction/Appointment/EditAppointment.js';
import ViewAppointment from '../Transaction/Appointment/ViewAppointment.js';
import Departments from '../Transaction/Departments/Departments.js';
import Departmentsadd from '../Transaction/Departments/Departmentsadd.js';
import Departmentedit from '../Transaction/Departments/Departmentedit.js';
import DesignationsList from '../Transaction/Designations/DesignationsList.js';
import DesignationForm from '../Transaction/Designations/DesignationForm.js';
import Employees from '../Transaction/Emplayoee/Emplayoee.js';
import EmployeeAdd from '../Transaction/Emplayoee/Emplayoeeadd.js';
import EmployeeEdit from '../Transaction/Emplayoee/Emplayoeeedit.js';
import ViewEmplayoee from '../Transaction/Emplayoee/Emplayoeeview';
import AttendanceAdmin from '../Transaction/AttendanceAdmin/AttendanceAdmin.js';
import AttendanceEmployee from '../Transaction/AttendanceEmployee/AttendanceEmployee.js';
import AdminAttendanceEdit from '../Transaction/AttendanceAdmin/AdminAttendanceEdit.js';
import MaterialMovementModule from '../Transaction/MaterialMovement/MaterialMovementModule.js';
import AddNewMaterialMovement from '../Transaction/MaterialMovement/AddNewMaterialMovement.js';
import EditMaterialMovement from '../Transaction/MaterialMovement/EditMaterialMovement.js';
import LogVehicleEntryModul from '../Transaction/LogVeihicleEntery/LogVehicleEntryModul.js';
import AddLogVehicleEntry from '../Transaction/LogVeihicleEntery/AddLogVehicleEntry.js';
import EditLogVehicleEntry from '../Transaction/LogVeihicleEntery/EditLogVehicleEntry.js';
import Module from "../Adminstor/Module/Module";
import AddModuleModel from "../Adminstor/Module/AddModuleModel";
import EditModuleModel from "../Adminstor/Module/EditModuleModel";
import Program from "../Adminstor/Program/Program";
import AddProgramModel from "../Adminstor/Program/AddProgramModel";
import EditProgramModel from "../Adminstor/Program/EditProgramModel";
import Roles from "../Adminstor/Roles/Roles";
import AddRolesModel from "../Adminstor/Roles/AddRolesModel";
import EditRolesModel from "../Adminstor/Roles/EditRolesModel";
import RoleProgram from "../Adminstor/RoleProgram/RoleProgram";
import UserRole from "../Adminstor/UserRole/UserRole";
import UserRoleView from "../Adminstor/UserRoleView/UserRoleView";
import AdminUser from "../Adminstor/AdminUsers/UserList.js";
import AdminAdduser from "../Adminstor/AdminUsers/AddUsers.js";
import AdminEdituser from "../Adminstor/AdminUsers/Edituser.js";
///////////////////////////////////////////////////////////////////////////////////

export default function Home() {
  const [title, setTitle] = useState('DashBoard');
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [displayValues, setDisplayValues] = useState({});

  // State for menudata
  const [menuData, setMenuData] = useState({
    adm: [],
    ope: [],
    visi: [],
    lve: [],
    mmm: [],
    att: [],
    setp: []
  });

  const [openMenus, setOpenMenus] = useState({
    adm: false,
    ope: false,
    visi: false,
    lve: false,
    mmm: false,
    att: false,
    setp: false
  });

  const [disabledMenus, setDisabledMenus] = useState({
    adm: true,
    ope: true,
    visi: true,
    lve: true,
    mmm: true,
    att: true,
    setp: true
  });

  // Helper function to fetch menu data and extract program information
  const fetchMenuData = async (menuType) => {
    try {
      const response = await axios.get(`${SERVER_PORT}/programnav${menuType}/${sessionStorage.getItem("userrole")}`);
      return response.data;
    } catch (error) {
      console.log(`Error fetching ${menuType}:`, error);
      return [];
    }
  }; 


  // Extract program information from the nested response
  const extractProgramsFromResponse = (data) => {
    if (!Array.isArray(data)) return [];

    return data.map(item => ({
      Program_Name: item.Program_Name || '',
      Program_Nav_Name: item.Program_Nav_Name || ''
    }));
  };

  // Initialize menu data
  const initializeMenuData = async () => {
    const username = sessionStorage.getItem("username");
    const userrole = sessionStorage.getItem("userrole");
    setDisplayValues({ username, userrole });

    // Define all menu types to fetch
    const menuTypes = ['adm', 'ope', 'visi', 'lve', 'mmm', 'att', 'setp'];

    // Fetch data for each menu type
    for (const menuType of menuTypes) {
      try {
        const data = await fetchMenuData(menuType);
        const programs = extractProgramsFromResponse(data);

        // Update menu data
        setMenuData(prev => ({ ...prev, [menuType]: programs }));
        // Update disabled state
        setDisabledMenus(prev => ({ ...prev, [menuType]: programs.length === 0 }));
      } catch (error) {
        console.log(`Error processing ${menuType}:`, error);
      }
    }
  };

  // Menu change handlers
  const handleMenuChange = async (menuType) => {
    try {
      const data = await fetchMenuData(menuType);
      const programs = extractProgramsFromResponse(data);

      setMenuData(prev => ({ ...prev, [menuType]: programs }));
      setDisabledMenus(prev => ({ ...prev, [menuType]: programs.length === 0 }));
    } catch (error) {
      console.log(`Error updating ${menuType}:`, error);
    }
  };

  // Toggle menu open/close in React state and fetch menu data
  const toggleMenu = async (menuType) => {
    setOpenMenus(prev => ({ ...prev, [menuType]: !prev[menuType] }));
    // Fetch latest menu data when opening
    if (!openMenus[menuType]) {
      await handleMenuChange(menuType);
    }
  };

  useEffect(() => {
    initializeMenuData();
  }, [isSidenavOpen]);

  const handleToggle = () => {
    const screenWidth = window.innerWidth;
    if (screenWidth >= 100 && screenWidth <= 700) return;
    setIsSidenavOpen(!isSidenavOpen);
  };

  return (
    <div className={`layout-unique ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
      <aside id="sidebar-unique" className={`sidebar-unique ${isSidenavOpen ? 'open-unique' : ''}`}>
        <div className="d-flex">
          <button className="toggle-btn" onClick={handleToggle} type="button">
            <i className="lni lni-grid-alt"></i>
          </button>
          <div className="sidebar-logo">
            <a>{sessionStorage.getItem("userrole")}</a>
          </div>
        </div>

        <ul className="nav-list-unique" id="nav-list-unique">
          {/* Home Link */}
          <li className="sidebar-item">
            <NavLink to="/Dashbord" className="sidebar-link">
              <i className="lni lni-home"></i>
              <span>Home</span>
            </NavLink>
          </li>



          {/* Visitors Details */}
          <li className="sidebar-item">
            {!disabledMenus.visi && (
              <a
                href="#"
                className="sidebar-link has-dropdown"
                aria-controls="visiMenu"
                aria-expanded={openMenus.visi}
                onClick={(e) => { e.preventDefault(); toggleMenu('visi'); }}
              >
                <i className="bi bi-person-lines-fill" ></i>
                <span>Visitors Details</span>
                <span className="dropdown-arrow"></span>
              </a>
            )}

            <ul
              id="visiMenu"
              className={`sidebar-dropdown list-unstyled collapse ${openMenus.visi ? 'show' : ''}`}
            >
              {menuData.visi.map((pro, index) => (
                <li className="sidebar-item" key={`visi-${index}`}>
                  <NavLink className="sidebar-link" to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>

          {/* Administration Menu */}
          <li className="sidebar-item">
            {!disabledMenus.adm && (
              <a
                href="#"
                className="sidebar-link has-dropdown"
                aria-controls="admMenu"
                aria-expanded={openMenus.adm}
                onClick={(e) => { e.preventDefault(); toggleMenu('adm'); }}
              >
                <i className="lni lni-consulting"></i>
                <span>Administration</span>
                <span className="dropdown-arrow"></span>
              </a>
            )}

            <ul
              id="admMenu"
              className={`sidebar-dropdown list-unstyled collapse ${openMenus.adm ? 'show' : ''}`}
            >
              {menuData.adm.map((pro, index) => (
                <li className="sidebar-item" key={`adm-${index}`}>
                  <NavLink className="sidebar-link" to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>

        </ul>


      </aside>



      <div className={`top-navbar ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
        <TopNavbar isSidenavOpen={isSidenavOpen} setIsSidenavOpen={setIsSidenavOpen} />
      </div>

      <div className={`main-content-unique ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
        <Routes>
          {/* All your Route components remain exactly the same */}
          <Route path="/" element={<Card setTitle={setTitle} />} />

          <Route path="/adminUser" element={<AdminUser setTitle={setTitle} />} />
          <Route path="/adminUser/AdminAdduser" element={<AdminAdduser setTitle={setTitle} />} />
          <Route path="/adminUser/AdminEdituser" element={<AdminEdituser setTitle={setTitle} />} />

          <Route path="/editprofile" element={<EditProfile setTitle={setTitle} />} />
          <Route path="/ChangePassword" element={<ChangePassword setTitle={setTitle} />} />

          <Route path="/visitorsdetails/AddGateEntry" element={<AddGateEntry setTitle={setTitle} />} />
          <Route path="/GenerateVisitorIDCard" element={<GenerateVisitorIDCard setTitle={setTitle} />} />
          <Route path='/visitorsdetails' element={<VisitorsDetails setTitle={setTitle} />} />
          <Route path="/visitorsdetails/editvisitor/:id" element={<EditVisitor setTitle={setTitle} />} />
          <Route path="/visitorsdetails/viewvisitor/:id" element={<ViewVisitor setTitle={setTitle} />} />

          <Route path="/appointment" element={<Appointment setTitle={setTitle} />} />
          <Route path="/appointment/editappointment/:id" element={<EditAppointment setTitle={setTitle} />} />
          <Route path="/appointment/viewappointment/:id" element={<ViewAppointment setTitle={setTitle} />} />

          <Route path="/LogVehicleEntryModul" element={<LogVehicleEntryModul setTitle={setTitle} />} />
          <Route path="/AddLogVehicleEntry" element={<AddLogVehicleEntry setTitle={setTitle} />} />
          <Route path="/EditLogVehicleEntry/:id" element={<EditLogVehicleEntry setTitle={setTitle} />} />

          <Route path="/MaterialMovementModule" element={<MaterialMovementModule setTitle={setTitle} />} />
          <Route path="/AddNewMaterialMovement" element={<AddNewMaterialMovement setTitle={setTitle} />} />
          <Route path="/EditMaterialMovement/:id" element={<EditMaterialMovement setTitle={setTitle} />} />

          <Route path="/departments" element={<Departments setTitle={setTitle} />} />
          <Route path="/departmentsadd" element={<Departmentsadd setTitle={setTitle} />} />
          <Route path="/departmentedit" element={<Departmentedit setTitle={setTitle} />} />

          <Route path="/designationslist" element={<DesignationsList setTitle={setTitle} />} />
          <Route path="/designationsfrom" element={<DesignationForm setTitle={setTitle} />} />
          <Route path="/designationsfrom/edit/:id" element={<DesignationForm setTitle={setTitle} />} />

          <Route path="/employees" element={<Employees setTitle={setTitle} />} />
          <Route path="/viewemplayoee/:id" element={<ViewEmplayoee setTitle={setTitle} />} />
          <Route path="/employeeadd" element={<EmployeeAdd setTitle={setTitle} />} />
          <Route path="/employeeedit" element={<EmployeeEdit setTitle={setTitle} />} />

          <Route path="/metadata" element={<Meta setTitle={setTitle} />} />

          <Route path="/attendanceadmin" element={<AttendanceAdmin setTitle={setTitle} />} />
          <Route path="/attendanceemployee" element={<AttendanceEmployee setTitle={setTitle} />} />
          <Route path="/adminattendanceedit/:id" element={<AdminAttendanceEdit setTitle={setTitle} />} />

          <Route path="/module" element={<Module setTitle={setTitle} />} />
          <Route path="/addmodule" element={<AddModuleModel setTitle={setTitle} />} />
          <Route path="/editmodule/:id" element={<EditModuleModel setTitle={setTitle} />} />
          <Route path="/program" element={<Program setTitle={setTitle} />} />
          <Route path="/addprogram" element={<AddProgramModel setTitle={setTitle} />} />
          <Route path="/editprogram/:id" element={<EditProgramModel setTitle={setTitle} />} />
          <Route path="/roles" element={<Roles setTitle={setTitle} />} />
          <Route path="/addroles" element={<AddRolesModel setTitle={setTitle} />} />
          <Route path="/editroles/:id" element={<EditRolesModel setTitle={setTitle} />} />
          <Route path="/roleprogram" element={<RoleProgram setTitle={setTitle} />} />

          <Route path="/userrole" element={<UserRole setTitle={setTitle} />} />
          <Route path="/UserRoleView" element={<UserRoleView setTitle={setTitle} />} />

          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </div>
    </div>
  );
}