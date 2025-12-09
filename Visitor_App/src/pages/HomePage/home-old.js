import React, { useState, useEffect } from 'react';
import { Routes, Route, NavLink, Navigate } from 'react-router-dom';
import '../HomePage/home.css';
import '../HomePage/BreadCrumBar/BreadCrum.css';
import { SERVER_PORT } from '../../constant.js';
import axios from 'axios'


//HomePages
import TopNavbar from './TopNavBar/Topnavbar.js';
import EditProfile from './EditProfile/editProfile.js';
import ChangePassword from './ChangePassword/changePassword.js';
import Breadcrumbs from './BreadCrumBar/BreadCrum.js';
import Card from './Card/Card.js';


//MetaData  
import Meta from "../MetaData/MetaForm.js";


//Transactions
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
import ViewEmplayoee from '../Transaction/Emplayoee/Emplayoeeview.js';


import AttendanceAdmin from '../Transaction/AttendanceAdmin/AttendanceAdmin.js';
import AttendanceEmployee from '../Transaction/AttendanceEmployee/AttendanceEmployee.js';
import AdminAttendanceEdit from '../Transaction/AttendanceAdmin/AdminAttendanceEdit.js';

import MaterialMovementModule from '../Transaction/MaterialMovement/MaterialMovementModule.js';
import AddNewMaterialMovement from '../Transaction/MaterialMovement/AddNewMaterialMovement.js';
import EditMaterialMovement from '../Transaction/MaterialMovement/EditMaterialMovement.js';

import LogVehicleEntryModul from '../Transaction/LogVeihicleEntery/LogVehicleEntryModul.js';
import AddLogVehicleEntry from '../Transaction/LogVeihicleEntery/AddLogVehicleEntry.js';
import EditLogVehicleEntry from '../Transaction/LogVeihicleEntery/EditLogVehicleEntry.js';

//------Adminstration----//
import Module from "../Adminstor/Module/Module.js"
import AddModuleModel from "../Adminstor/Module/AddModuleModel.js";
import EditModuleModel from "../Adminstor/Module/EditModuleModel.js";
import Program from "../Adminstor/Program/Program.js";
import AddProgramModel from "../Adminstor/Program/AddProgramModel.js";
import EditProgramModel from "../Adminstor/Program/EditProgramModel.js";
import Roles from "../Adminstor/Roles/Roles.js"
import AddRolesModel from "../Adminstor/Roles/AddRolesModel.js";
import EditRolesModel from "../Adminstor/Roles/EditRolesModel.js";
import RoleProgram from "../Adminstor/RoleProgram/RoleProgram.js";
import UserRole from "../Adminstor/UserRole/UserRole.js";
import UserRoleView from "../Adminstor/UserRoleView/UserRoleView.js"
import AdminUser from "../Adminstor/AdminUsers/UserList.js";
import AdminAdduser from "../Adminstor/AdminUsers/AddUsers.js";
import AdminEdituser from "../Adminstor/AdminUsers/Edituser.js";



export default function Home() {
  const [title, setTitle] = useState('DashBoard');
  const [isSidenavOpen, setIsSidenavOpen] = useState(false);
  const [DisplayValues, setDisplayValues] = useState();
  const [Data, setData] = useState([]);
  const [DataTrn, setDataTrn] = useState([]);
  const [DataVws, setDataVws] = useState([]);
  const [DataAdm, setDataAdm] = useState([]);
  const [DataWfo, setDataWfo] = useState([]);
  const [DataExp, setDataExp] = useState([]);
  const [DataImp, setDataImp] = useState([]);


  const [DataOpe, setDataOpe] = useState([]);
  const [DataVisi, setDataVisi] = useState([]);
  const [DataLVE, setDataLVE] = useState([]);
  const [DataMMM, setDataMMM] = useState([]);
  const [DataAtt, setDataAtt] = useState([]);
  const [DataSetp, setDataSetp] = useState([]);


  const [DissabledAdm, setDissabledAdm] = useState([]);
  const [DissabledMaster, setDissabledMaster] = useState([]);
  const [DissabledTran, setDissabledTran] = useState([]);
  const [DissabledVws, setDissabledVws] = useState([]);
  const [DissabledWfo, setDissabledWfo] = useState([]);
  const [DissabledExp, setDissabledExp] = useState([]);
  const [DissabledImp, setDissabledImp] = useState([]);

  const [DissabledOpe, setDissabledOpe] = useState([]);
  const [DissabledVisiDeta, setDissabledVisiDeta] = useState([]);
  const [DissabledLVE, setDissabledLVE] = useState([]);
  const [DissabledMMM, setDissabledMMM] = useState([]);
  const [DissabledAtt, setDissabledAtt] = useState([]);
  const [DissabledSetp, setDissabledSetp] = useState([]);



  useEffect(() => {

    const username = sessionStorage.getItem("username");
    const userrole = sessionStorage.getItem("userrole");

    setDisplayValues({ username, userrole });

    console.log(username, userrole)

    /* /////////////////////////////////////////////////////// */



    /* ////////////////////////////////////////////////////////////////// */
    axios.get(`${SERVER_PORT}/programnavmas/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data)
        setData(res.data)

        if (res.data.length === 0) {

          setDissabledMaster(true)
        } else {
          setDissabledMaster(false)
        }
      })
      .catch(err => console.log(err));

    axios.get(`${SERVER_PORT}/programnavtrn/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data)
        setDataTrn(res.data)
        if (res.data.length === 0) {

          setDissabledTran(true)
        } else {
          setDissabledTran(false)
        }

      })
      .catch(err => console.log(err));

    axios.get(`${SERVER_PORT}/programnavvws/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  vws ");
        setDataVws(res.data);
        if (res.data.length === 0) {
          setDissabledVws(true);
        } else {
          setDissabledVws(false);
        }
      })
      .catch(err => console.log(err));

    axios.get(`${SERVER_PORT}/programnavwfo/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  wfo ");
        setDataWfo(res.data);
        if (res.data.length === 0) {
          setDissabledWfo(true);
        } else {
          setDissabledWfo(false);
        }
      })
      .catch(err => console.log(err));



    axios.get(`${SERVER_PORT}/programnavexp/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  Exp ");
        setDataExp(res.data);
        if (res.data.length === 0) {
          setDissabledExp(true);
        } else {
          setDissabledExp(false);
        }
      })
      .catch(err => console.log(err));

    axios.get(`${SERVER_PORT}/programnavimp/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data[0] + "  Imp ");
        setDataImp(res.data);
        if (res.data.length === 0) {
          setDissabledImp(true);
        } else {
          setDissabledImp(false);
        }
      })
      .catch(err => console.log(err));
    ///////////////////////////////////////////////////////////////

    axios.get(`${SERVER_PORT}/programnavadm/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  vws ");
        setDataAdm(res.data);
        if (res.data.length === 0) {
          setDissabledAdm(true);
        } else {
          setDissabledAdm(false);
        }
      })
      .catch(err => console.log(err));

    // Operations
    axios.get(`${SERVER_PORT}/programnavope/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  Ope ");
        setDataOpe(res.data);
        setDissabledOpe(res.data.length === 0);
      })
      .catch(err => console.log(err));

    // Visitor Details
    axios.get(`${SERVER_PORT}/programnavvisi/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  Visi ");
        setDissabledVisiDeta(res.data.length === 0);
      })
      .catch(err => console.log(err));

    axios.get(`${SERVER_PORT}/programnavlve/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  LVE ");
        setDissabledLVE(res.data.length === 0);
      })
      .catch(err => console.log(err));

    axios.get(`${SERVER_PORT}/programnavmmm/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  MMM ");
        setDissabledMMM(res.data.length === 0);
      })
      .catch(err => console.log(err));


    // Attendance
    axios.get(`${SERVER_PORT}/programnavatt/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  Att ");
        setDissabledAtt(res.data.length === 0);
      })
      .catch(err => console.log(err));

    // Setup
    axios.get(`${SERVER_PORT}/programnavsetp/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  Setup ");
        setDissabledSetp(res.data.length === 0);
      })
      .catch(err => console.log(err));


  }, [isSidenavOpen]);


  function changesidenavmas() {
    axios.get(`${SERVER_PORT}/programnavmas/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log("Master Data:", res.data);
        setData(res.data);

        if (res.data.length === 0) {
          setDissabledMaster(true);
        } else {
          setDissabledMaster(false);
        }
      })
      .catch(err => console.log(err));
  }

  function changesidenavtrn(pro) {
    axios.get(`${SERVER_PORT}/programnavtrn/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data);
        setDataTrn(res.data);
        if (res.data.length === 0) {
          setDissabledTran(true);
        } else {
          setDissabledTran(false);

        }
      })
      .catch(err => console.log(err));
  }

  function changesidenavvws() {
    axios.get(`${SERVER_PORT}/programnavvws/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  vws ");
        setDataVws(res.data);
        if (res.data.length === 0) {
          setDissabledVws(true);
        } else {
          setDissabledVws(false);
        }
      })
      .catch(err => console.log(err));
  }


  function changesidenavadm(e) {
    axios.get(`${SERVER_PORT}/programnavadm/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log("Admin Data:", res.data);
        setDataAdm(res.data);
        if (res.data.length === 0) {
          setDissabledAdm(true);
        } else {
          setDissabledAdm(false);
        }
      })
      .catch(err => console.log(err));
  }


  function changesidenavexp(e) {
    axios.get(`${SERVER_PORT}/programnavexp/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  Exp ");
        setDataExp(res.data);
        if (res.data.length === 0) {
          setDissabledExp(true);
        } else {
          setDissabledExp(false);
        }
      })
      .catch(err => console.log(err));
  }


  function changesidenavimppayment(e) {
    axios.get(`${SERVER_PORT}/programnavimp/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data[0] + "  Imp ");
        setDataImp(res.data);
        if (res.data.length === 0) {
          setDissabledImp(true);
        } else {
          setDissabledImp(false);
        }
      })
      .catch(err => console.log(err));
  }

  ////////////////////////////////////////////////////////  //////////////////////////////////////////////  

  function changesidenavOperation() {
    axios.get(`${SERVER_PORT}/programnavope/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log(res.data + "  Ope ");
        setDataOpe(res.data);
        setDissabledOpe(res.data.length === 0);
      })
      .catch(err => console.log(err));
  }

  function changesidenavVisitorDetails() {
    axios.get(`${SERVER_PORT}/programnavvisi/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log("Visi Data:", res.data);
        setDataVisi(res.data);
        setDissabledVisiDeta(res.data.length === 0);
      })
      .catch(err => console.log(err));
  }

  function changesidenavLVE() {
    axios.get(`${SERVER_PORT}/programnavlve/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log("LVE Data:", res.data);
        setDataLVE(res.data);
        setDissabledLVE(res.data.length === 0);
      })
      .catch(err => console.log(err));
  }

  function changesidenavmmm() {
    axios.get(`${SERVER_PORT}/programnavmmm/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log("MMM Data:", res.data);
        setDataMMM(res.data);
        setDissabledMMM(res.data.length === 0);
      })
      .catch(err => console.log(err));
  }

  function changesidenavAttendance() {
    axios.get(`${SERVER_PORT}/programnavatt/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log("Attenden Data:", res.data);
        setDataAtt(res.data);
        setDissabledAtt(res.data.length === 0);
      })
      .catch(err => console.log(err));
  }

  function changesidenavSetup() {
    axios.get(`${SERVER_PORT}/programnavsetp/${sessionStorage.getItem("userrole")}`)
      .then(res => {
        console.log("Setup Data:", res.data);
        setDataSetp(res.data);
        setDissabledSetp(res.data.length === 0);
      })
      .catch(err => console.log(err));
  }


  //////////////////////////////////////////////////////////////


  const handleToggle = () => {
    const screenWidth = window.innerWidth;

    if (screenWidth >= 100 && screenWidth <= 700) {
      return;
    }
    setIsSidenavOpen(!isSidenavOpen);

  };


  return (
    <div className={`layout-unique ${isSidenavOpen ? 'shift-right-unique' : ''}`}>

      <aside id="sidebar-unique" className={`sidebar-unique ${isSidenavOpen ? 'open-unique' : ''}`}>
        <div className="d-flex">
          <button className="toggle-btn" onClick={handleToggle} type="button">
            <i className="lni lni-grid-alt"></i>
          </button>
          <div className="sidebar-logo text-white">
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

          {/* Master Menu */}
          <li className="sidebar-item">
            {!DissabledMaster && (
              <a href="#" className="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse" data-bs-target="#auth" aria-expanded="false" aria-controls="auth">
                <i className="lni lni-layers" onClick={changesidenavmas}></i>
                <span>Master</span>
              </a>
            )}
            <ul id="auth" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#nav-list-unique">
              {Array.isArray(Data) && Data.map(pro => (
                <li className="sidebar-item" key={pro.Program_Name}>
                  <NavLink className="sidebar-link" to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                </li>
              ))}
            </ul>
          </li>

          {/* Transaction Menu */}
          <li className="sidebar-item">
            {!DissabledTran && (
              <a href="#" className="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse" data-bs-target="#transactionMenu" aria-expanded="false" aria-controls="transactionMenu">
                <i className="lni lni-arrows-horizontal" onClick={changesidenavtrn}></i>
                <span>Transaction</span>
              </a>
            )}
            <ul id="transactionMenu" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataTrn.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>

          {/* View Menu */}
          <li className="sidebar-item">
            {!DissabledVws && (
              <a href="#" className="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse" data-bs-target="#viewMenu" aria-expanded="false" aria-controls="viewMenu">
                <i className="lni lni-eye" onClick={changesidenavvws}></i>
                <span>View</span>
              </a>
            )}
            <ul id="viewMenu" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataVws.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>

          {/* Export Menu */}
          <li className="sidebar-item">
            {!DissabledExp && (
              <a href="#" className="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse" data-bs-target="#exportMenu" aria-expanded="false" aria-controls="exportMenu">
                <i className="bi bi-box-arrow-right" onClick={changesidenavexp}></i>
                <span>Export</span>
              </a>
            )}
            <ul id="exportMenu" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataExp.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>

          {/* Import Menu */}
          <li className="sidebar-item">
            {!DissabledImp && (
              <a href="#" className="sidebar-link collapsed has-dropdown" data-bs-toggle="collapse" data-bs-target="#importMenu" aria-expanded="false" aria-controls="importMenu">
                <i className="bi bi-box-arrow-down" onClick={changesidenavimppayment}></i>
                <span>Import</span>
              </a>
            )}
            <ul id="importMenu" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataImp.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>

          {/* Operations Menu */}
          <li className="sidebar-item">
            {!DissabledOpe && (
              <a href="#" className="sidebar-link collapsed has-dropdown" onClick={changesidenavOperation} data-bs-toggle="collapse" data-bs-target="#operationsMenu" aria-expanded="false" aria-controls="operationsMenu">
                <i className="bi bi-gear-fill" ></i>
                <span>Operations</span>
              </a>
            )}
            <ul id="operationsMenu" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataOpe.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>

          {/* Visitor Details Menu */}
          <li className="sidebar-item">
            {!DissabledVisiDeta && (
              <a href="#" className="sidebar-link collapsed has-dropdown" onClick={changesidenavVisitorDetails} data-bs-toggle="collapse" data-bs-target="#visitorMenu" aria-expanded="false" aria-controls="visitorMenu">
                <i className="bi bi-person-lines-fill" ></i>
                <span>Visitor Details</span>
              </a>
            )}
            <ul id="visitorMenu" className="sidebar-dropdown list-unstyled" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataVisi.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>


          {/* Log Veihicle Entry Menu */}
          <li className="sidebar-item">
            {!DissabledLVE && (
              <a href="#" className="sidebar-link collapsed has-dropdown" onClick={changesidenavLVE} data-bs-toggle="collapse" data-bs-target="#logVehicle" aria-expanded="false" aria-controls="logVehicle">
                <i className="bi bi-truck-front-fill"></i>
                <span>Vehicle Log</span>
              </a>
            )}
            <ul id="logVehicle" className="sidebar-dropdown list-unstyled" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataLVE.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>

          {/* Material movement Module */}
          <li className="sidebar-item">
            {!DissabledMMM && (
              <a href="#" className="sidebar-link collapsed has-dropdown" onClick={changesidenavmmm} data-bs-toggle="collapse" data-bs-target="#materialmm" aria-expanded="false" aria-controls="materialmm">
                <i className="bi bi-box-seam-fill"></i>
                <span>Material Log</span>
              </a>
            )}
            <ul id="materialmm" className="sidebar-dropdown list-unstyled collapsed" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataMMM.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>


          {/* Attendance Menu */}
          <li className="sidebar-item">
            {!DissabledAtt && (
              <a href="#" className="sidebar-link collapsed has-dropdown" onClick={changesidenavAttendance} data-bs-toggle="collapse" data-bs-target="#attendanceMenu" aria-expanded="false" aria-controls="attendanceMenu">
                <i className="bi bi-calendar-check" ></i>
                <span>Attendance</span>
              </a>
            )}
            <ul id="attendanceMenu" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataAtt.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>

          {/* Setup Menu */}
          <li className="sidebar-item">
            {!DissabledSetp && (
              <a href="#" className="sidebar-link collapsed has-dropdown" onClick={changesidenavSetup} data-bs-toggle="collapse" data-bs-target="#setupMenu" aria-expanded="false" aria-controls="setupMenu">
                <i className="bi bi-tools" ></i>
                <span>Setup</span>
              </a>
            )}
            <ul id="setupMenu" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataSetp.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>

          {/* Administration Menu */}
          <li className="sidebar-item">
            {!DissabledAdm && (
              <a href="#" className="sidebar-link collapsed has-dropdown" onClick={changesidenavadm} data-bs-toggle="collapse" data-bs-target="#adminMenu" aria-expanded="false" aria-controls="adminMenu">
                <i className="lni lni-consulting" ></i>
                <span>Administration</span>
              </a>
            )}
            <ul id="adminMenu" className="sidebar-dropdown list-unstyled collapse" data-bs-parent="#nav-list-unique">
              <li className="sidebar-item">
                {DataAdm.map(pro => (
                  <NavLink className="sidebar-link" key={pro.Program_Name} to={'/' + pro.Program_Name}>
                    {pro.Program_Nav_Name}
                  </NavLink>
                ))}
              </li>
            </ul>
          </li>
        </ul>
      </aside>


      <div className={`top-navbar ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
        <TopNavbar isSidenavOpen={isSidenavOpen} setIsSidenavOpen={setIsSidenavOpen} />
      </div>

      <div className={`main-content-unique ${isSidenavOpen ? 'shift-right-unique' : ''}`}>
        {/* <h2 className="text-xl font-semibold mt-0 mb-1 text-gray-800 rounded-xl shadow">{title}</h2> */}
        {/* <Breadcrumbs /> */}
        <Routes>
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
