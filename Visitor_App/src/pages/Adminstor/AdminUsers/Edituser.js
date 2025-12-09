// import React, { useState, useEffect } from "react";
// import axios from "axios";
// import { Form, Button, Row, Col } from "react-bootstrap";
// import "./Edituser.css";
// import { useLocation, useNavigate } from "react-router-dom";
// import CustomAlert from "../../../CustomAlert"
// import { SERVER_PORT } from '../../../constant';


// export default function Edituser({ setTitle }) {

//   const navigate = useNavigate();
//   const [alerts, setAlerts] = useState([]);
//   const today = new Date().toISOString().split('T')[0];
//   const showAlert = (type, title, message) => {
//     const newAlert = { id: Date.now(), type, title, message };
//     setAlerts([...alerts, newAlert]);

//     setTimeout(() => {
//       setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
//     }, 3000);
//   };

//   const location = useLocation();
//   const userId = location.state?.userId;
//   if (!userId) {
//     console.log("no usser id found in navication state")
//   }

//   const [formData, setFormData] = useState({
//     adm_users_id: "",
//     adm_users_loginid: "",
//     adm_users_password: "",
//     adm_users_email: "",
//     adm_users_title: "",
//     adm_users_firstname: "",
//     adm_users_lastname: "",
//     adm_users_mobile: "",
//     adm_users_profileImage: "",
//     adm_users_address1: "",
//     adm_users_address2: "",
//     adm_users_address3: "",
//     adm_users_dob: "",
//     adm_users_gender: "",
//     adm_users_phoneextn: "",
//     adm_users_deptid: "",
//     adm_users_jobid: "",
//     adm_users_positionid: "",
//     adm_users_islocked: false,
//     adm_users_defaultroleid: "",
//     adm_users_lastactivitydate: "",
//     adm_users_status: false,
//     created_on: "",
//     created_by: "",
//     modified_on: "",
//     modified_by: "Admin",
//   });

//   const titles = ['Mr.', 'Ms.', 'Mrs.'];
//   const gender = ['Male', 'Female', 'Others'];
//   const job = ['Developer', 'Tester', 'Designer'];
//   const position = ['Full-Time', 'Part-Time', 'Contract'];
//   const [departments, setDepartments] = useState([]);
//   const [roles, setRoles] = useState([]);

//   // Fetch departments and roles from DB
//   useEffect(() => {
//     axios.get(`${SERVER_PORT}/department_getalldata`)
//       .then(res => {
//         if (res.data && res.data.data) {
//           setDepartments(res.data.data.filter(dep => dep.status === true));
//         }
//       })
//       .catch(err => console.log('Department fetch error:', err));

//     axios.get(`${SERVER_PORT}/rolesload`)
//       .then(res => {
//         if (Array.isArray(res.data)) {
//           setRoles(res.data.filter(role => role.Roles_Status_Converted === 'Active'));
//         }
//       })
//       .catch(err => console.log('Roles fetch error:', err));
//   }, []);

//   useEffect(() => {
//     setTitle("Edit User Details");
//     if (userId) {
//       axios.get(`${SERVER_PORT}/userlist_getalldatabyid/${userId}`)
//         .then(response => {
//           // Find the role name from the ID and update formData
//           const userRole = roles.find(role => role.Roles_Id === response.data.adm_users_defaultroleid);
//           setFormData({
//             ...response.data,
//             adm_users_deptid: response.data.adm_users_deptid || "",
//             adm_users_defaultroleid: response.data.adm_users_defaultroleid || ""
//           });
//         })
//         .catch(error => console.error("Error fetching user data:", error));
//     }
//   }, [userId, roles, departments]); // Add roles and departments to dependency array


//   const handleDataChange = (e) => {
//     const { name, type, checked, value } = e.target;
//     setFormData({
//       ...formData,
//       [name]: type === "checkbox" ? checked : value
//     });
//   };


//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!userId) {
//       console.error("Error: User ID is missing.");
//       alert("Error: User ID is missing.");
//       return;
//     }

//     const updatedData = {
//       ...formData,
//       modified_on: today
//     };

//     try {
//       const response = await axios.put(`${SERVER_PORT}/userlist_editusers/${userId}`, updatedData);

//       console.log("Server Response:", response.data);
//       showAlert("success", "Success!", "User updated sucessfully..");
//     } catch (error) {
//       console.error("Error updating user:", error);

//       if (error.response) {
//         console.error("Server Error Response:", error.response.data);
//         showAlert("error", "Error", `Update failed: ${error.response.data.error || "Server error"}`);
//       } else if (error.request) {
//         console.error("No response received from server.");
//         showAlert("error", "Error", "Check your connection.");
//       } else {
//         console.error("Request setup error:", error.message);
//         showAlert("error", "Error", "Something went wrong.");
//       }
//     }
//   };

//   return (
//     <div className="edit-container">
//       <Form onSubmit={handleSubmit}>
//         <div className="edit-right-section">
//           {/* Common Details Section */}
//           <div className="section common-details">
//             <h4>User Details</h4>
//             <Row>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Username</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_loginid" value={formData.adm_users_loginid} disabled /></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Email</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_email" value={formData.adm_users_email} minLength={4} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Mobile</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_mobile" value={formData.adm_users_mobile} minLength={10} maxLength={10} onChange={handleDataChange} required /></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Title</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_title" value={formData.adm_users_title} onChange={handleDataChange} required><option value="">-- SELECT --</option>
//                 <option value="">-- SELECT --</option>
//                 {titles.map((title) => (
//                   <option key={title} value={title}>{title}</option>
//                 ))}
//               </Form.Control></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">First Name</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_firstname" value={formData.adm_users_firstname} minLength={4} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Last Name</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_lastname" value={formData.adm_users_lastname} minLength={4} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Gender</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_gender" value={formData.adm_users_gender} onChange={handleDataChange} required>
//                 <option value="">-- SELECT --</option>
//                 {gender.map((gen) => (
//                   <option key={gen} value={gen}>{gen}</option>
//                 ))}</Form.Control></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Date of Birth</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="date" name="adm_users_dob" max={today} value={formData.adm_users_dob} onChange={handleDataChange} /></Form.Group></Col>
//               <Col>
//                 <Form.Group className="edit-form-group" style={{ display: 'flex', alignItems: 'center' }}>
//                   <div style={{ flex: 1 }}>
//                     <Form.Label className="edit-form-label">Password</Form.Label><Form.Text className="text-danger">*</Form.Text>
//                     <Form.Control className="edit-form-control" type="password" name="adm_users_password" value={formData.adm_users_password} disabled onChange={handleDataChange} />
//                   </div>
//                   <Button
//                     variant="contained"
//                     className="change-password-btn p-2 m-2 "
//                     style={{ marginLeft: '10px', backgroundColor: '#1976d2', color: 'white', whiteSpace: 'nowrap' }}
//                     type="button"
//                     onClick={() => navigate('/ChangePassword')}
//                   >
//                     Change Password
//                   </Button>
//                 </Form.Group>
//               </Col>
//             </Row>
//           </div>

//           {/* Address Details */}
//           <div className="section address-details">
//             <h4>Address Details</h4>
//             <Row>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 1</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_address1" value={formData.adm_users_address1} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 2</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_address2" value={formData.adm_users_address2} maxLength={25} onChange={handleDataChange} /></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 3</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_address3" value={formData.adm_users_address3} maxLength={25} onChange={handleDataChange} /></Form.Group></Col>
//             </Row>
//           </div>

//           {/* Employee Details */}
//           <div className="section employee-details">
//             <h4>Job Role Details</h4>
//             <Row>
//               <Col>
//                 <Form.Group className="edit-form-group">
//                   <Form.Label className="edit-form-label">Department</Form.Label><Form.Text className="text-danger">*</Form.Text>
//                   <Form.Control
//                     as="select"
//                     name="adm_users_deptid"
//                     value={formData.adm_users_deptid}
//                     onChange={handleDataChange}
//                     required
//                   >
//                     <option value="">-- SELECT --</option>
//                     {departments.map((dept) => (
//                       <option key={dept.department_id} value={dept.department_name}>
//                         {dept.department_name}
//                       </option>
//                     ))}
//                   </Form.Control>
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group className="edit-form-group">
//                   <Form.Label className="edit-form-label">Role</Form.Label><Form.Text className="text-danger">*</Form.Text>
//                   <Form.Control as="select" name="adm_users_defaultroleid"
//                     value={formData.adm_users_defaultroleid} onChange={handleDataChange} required>
//                     <option value="">-- SELECT --</option>
//                     {roles.map((role) => (
//                       <option key={role.Roles_Id} value={role.Roles_Id}>
//                         {role.Roles_RoleName}
//                       </option>
//                     ))}
//                   </Form.Control>
//                 </Form.Group>
//               </Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Job</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_jobid" value={formData.adm_users_jobid} onChange={handleDataChange} required>
//                 <option value="">-- SELECT --</option>
//                 {job.map((jobid) => (
//                   <option key={jobid} value={jobid}>{jobid}</option>
//                 ))}</Form.Control></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Position</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_positionid" value={formData.adm_users_positionid} onChange={handleDataChange} required>
//                 <option value="">-- SELECT --</option>
//                 {position.map((positionid) => (
//                   <option key={positionid} value={positionid}>{positionid}</option>
//                 ))}</Form.Control></Form.Group></Col>
//               <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Phone Extension</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_phoneextn" value={formData.adm_users_phoneextn} onChange={handleDataChange} required /></Form.Group></Col>
//             </Row>
//           </div>

//           {/* User Activity */}
//           <div className="section user-activity">
//             <h4>Account Status</h4>
//             <Row>
//               <Col>
//                 <Form.Group className="edit-form-group">
//                   <Form.Label className="edit-form-label">Is Locked</Form.Label>
//                   <Form.Check
//                     type="switch"
//                     id="adm_users_islocked"
//                     label={formData.adm_users_islocked ? "Locked" : "Unlocked"}
//                     checked={formData.adm_users_islocked}
//                     onChange={(e) => setFormData({ ...formData, adm_users_islocked: e.target.checked })}
//                   />
//                 </Form.Group>
//               </Col>
//               <Col>
//                 <Form.Group className="edit-form-group">
//                   <Form.Label className="edit-form-label">Status</Form.Label>
//                   <Form.Check
//                     type="switch"
//                     id="adm_users_status"
//                     label={formData.adm_users_status ? "Active" : "Inactive"}
//                     checked={formData.adm_users_status}
//                     onChange={(e) => setFormData({ ...formData, adm_users_status: e.target.checked })}
//                   />
//                 </Form.Group>
//               </Col>

//             </Row>
//           </div>

//         </div>
//         <Col>
//           <Button type="submit" className="mt-1 edit-btn p-1" style={{ backgroundColor: "#3CB371" }}>Save</Button>
//           <Button className="mt-1 edit-btn p-1" style={{ backgroundColor: "#E53935" }} onClick={() => window.history.back()}>Cancel</Button>
//         </Col>
//       </Form>
//       <div style={{ padding: "20px" }}>

//         {/* Render alerts dynamically */}
//         {alerts.map((alert) => (
//           <CustomAlert key={alert.id} {...alert} onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))} />
//         ))}
//       </div>
//     </div>
//   );
// }


import React, { useState, useEffect } from "react";
import axios from "axios";
import { Form, Button, Row, Col } from "react-bootstrap";
import "./Edituser.css";
import { useLocation, useNavigate } from "react-router-dom";
import CustomAlert from "../../../CustomAlert"
import { SERVER_PORT } from '../../../constant';
import { ReactSession } from 'react-client-session';

export default function Edituser({ setTitle }) {

  const UserRole = ReactSession.get('UserRole')?.trim(); 
  const [alerts, setAlerts] = useState([]);
  const today = new Date().toISOString().split('T')[0];
  const [newPassword, setNewPassword] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);

  const showAlert = (type, title, message) => {
    const newAlert = { id: Date.now(), type, title, message };
    setAlerts([...alerts, newAlert]);

    setTimeout(() => {
      setAlerts((prevAlerts) => prevAlerts.filter((alert) => alert.id !== newAlert.id));
    }, 3000);
  };

  const location = useLocation();
  const userId = location.state?.userId;
  if (!userId) {
    console.log("no usser id found in navication state")
  }

  const [formData, setFormData] = useState({
    adm_users_id: "",
    adm_users_loginid: "",
    adm_users_password: "",
    adm_users_email: "",
    adm_users_title: "",
    adm_users_firstname: "",
    adm_users_lastname: "",
    adm_users_mobile: "",
    adm_users_profileImage: "",
    adm_users_address1: "",
    adm_users_address2: "",
    adm_users_address3: "",
    adm_users_dob: "",
    adm_users_gender: "",
    adm_users_phoneextn: "",
    adm_users_deptid: "",
    adm_users_jobid: "",
    adm_users_positionid: "",
    adm_users_islocked: false,
    adm_users_defaultroleid: "",
    adm_users_lastactivitydate: "",
    adm_users_status: false,
    created_on: "",
    created_by: "",
    modified_on: "",
    modified_by: "Admin",
  });

  const titles = ['Mr.', 'Ms.', 'Mrs.'];
  const gender = ['Male', 'Female', 'Others'];
  const job = ['Developer', 'Tester', 'Designer'];
  const position = ['Full-Time', 'Part-Time', 'Contract'];
  const [departments, setDepartments] = useState([]);
  const [roles, setRoles] = useState([]);

  // Fetch departments and roles from DB
  useEffect(() => {
    axios.get(`${SERVER_PORT}/department_getalldata`)
      .then(res => {
        if (res.data && res.data.data) {
          setDepartments(res.data.data.filter(dep => dep.status === true));
        }
      })
      .catch(err => console.log('Department fetch error:', err));

    axios.get(`${SERVER_PORT}/rolesload`)
      .then(res => {
        if (Array.isArray(res.data)) {
          setRoles(res.data.filter(role => role.Roles_Status_Converted === 'Active'));
        }
      })
      .catch(err => console.log('Roles fetch error:', err));
  }, []);

  useEffect(() => {
    setTitle("Edit User Details");
    if (userId) {
      axios.get(`${SERVER_PORT}/userlist_getalldatabyid/${userId}`)
        .then(response => {
          setFormData({
            ...response.data,
            adm_users_deptid: response.data.adm_users_deptid || "",
            adm_users_defaultroleid: response.data.adm_users_defaultroleid || ""
          });
        })
        .catch(error => console.error("Error fetching user data:", error));
    }
  }, [userId, roles, departments]);


  const handleDataChange = (e) => {
    const { name, type, checked, value } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value
    });
  };

  const handlePasswordChange = async () => {
    if (!newPassword) {
      showAlert("error", "Error", "Password field cannot be empty.");
      return;
    }

    try {
      // The backend will handle the authorization check, so we only need to send the new password.
      const response = await axios.put(`${SERVER_PORT}/userlist_changepassword/${userId}`, { newPassword, currentUserRole: UserRole });
      showAlert("success", "Success!", "Password updated successfully.");
      setNewPassword(""); // Clear the password field on success
      setShowPasswordFields(false); // Hide the password fields
    } catch (error) {
      console.error("Error updating password:", error);
      if (error.response && error.response.status === 403) {
        showAlert("error", "Access Denied", "You do not have permission to change this password.");
      } else {
        showAlert("error", "Error", "Failed to update password.");
      }
    }
  };


  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!userId) {
      console.error("Error: User ID is missing.");
      alert("Error: User ID is missing.");
      return;
    }

    const updatedData = {
      ...formData,
      modified_on: today
    };

    // Remove password field from the main update as it's handled separately
    delete updatedData.adm_users_password;

    try {
      const response = await axios.put(`${SERVER_PORT}/userlist_editusers/${userId}`, updatedData);

      console.log("Server Response:", response.data);
      showAlert("success", "Success!", "User updated successfully.");
    } catch (error) {
      console.error("Error updating user:", error);

      if (error.response) {
        console.error("Server Error Response:", error.response.data);
        showAlert("error", "Error", `Update failed: ${error.response.data.error || "Server error"}`);
      } else if (error.request) {
        console.error("No response received from server.");
        showAlert("error", "Error", "Check your connection.");
      } else {
        console.error("Request setup error:", error.message);
        showAlert("error", "Error", "Something went wrong.");
      }
    }
  };

  return (
    <div className="edit-container">
      <Form onSubmit={handleSubmit}>
        <div className="edit-right-section">
          {/* Common Details Section */}
          <div className="section common-details">
            <h4>User Details</h4>
            <Row>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Username</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_loginid" value={formData.adm_users_loginid} disabled /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Email</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_email" value={formData.adm_users_email} minLength={4} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Mobile</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_mobile" value={formData.adm_users_mobile} minLength={10} maxLength={10} onChange={handleDataChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Title</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_title" value={formData.adm_users_title} onChange={handleDataChange} required><option value="">-- SELECT --</option>
                <option value="">-- SELECT --</option>
                {titles.map((title) => (
                  <option key={title} value={title}>{title}</option>
                ))}
              </Form.Control></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">First Name</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_firstname" value={formData.adm_users_firstname} minLength={4} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Last Name</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_lastname" value={formData.adm_users_lastname} minLength={4} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Gender</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_gender" value={formData.adm_users_gender} onChange={handleDataChange} required>
                <option value="">-- SELECT --</option>
                {gender.map((gen) => (
                  <option key={gen} value={gen}>{gen}</option>
                ))}</Form.Control></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Date of Birth</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="date" name="adm_users_dob" max={today} value={formData.adm_users_dob} onChange={handleDataChange} /></Form.Group></Col>
              <Col>
                <Form.Group className="edit-form-group" style={{ display: 'flex', alignItems: 'center' }}>
                  <div style={{ flex: 1 }}>
                    <Form.Label className="edit-form-label">Password</Form.Label><Form.Text className="text-danger">*</Form.Text>
                    <Form.Control className="edit-form-control" type="password" name="adm_users_password" value={formData.adm_users_password} onChange={handleDataChange} disabled />
                  </div>
                  {/* Conditionally render the button based on the role */}
                  {UserRole === 'Administrator' && (
                    <Button
                      variant="contained"
                      className="change-password-btn p-2 m-2 "
                      style={{ marginLeft: '10px', backgroundColor: '#1976d2', color: 'white', whiteSpace: 'nowrap' }}
                      type="button"
                      onClick={() => setShowPasswordFields(!showPasswordFields)}
                    >
                      Change Password
                    </Button>
                  )}
                </Form.Group>
              </Col>
            </Row>
            {/* New Password fields shown conditionally */}
            {showPasswordFields && UserRole === 'Administrator' && (
              <Row>
                <Col>
                  <Form.Group className="edit-form-group">
                    <Form.Label className="edit-form-label">New Password</Form.Label>
                    <Form.Control
                      className="edit-form-control"
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col>
                  <Button
                    variant="contained"
                    className="mt-4 p-2"
                    style={{ backgroundColor: '#4caf50', color: 'white' }}
                    onClick={handlePasswordChange}
                  >
                    Save New Password
                  </Button>
                </Col>
              </Row>
            )}
          </div>

          {/* Address Details */}
          <div className="section address-details">
            <h4>Address Details</h4>
            <Row>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 1</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_address1" value={formData.adm_users_address1} maxLength={25} onChange={handleDataChange} required /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 2</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_address2" value={formData.adm_users_address2} maxLength={25} onChange={handleDataChange} /></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Address 3</Form.Label><Form.Control className="edit-form-control" type="text" name="adm_users_address3" value={formData.adm_users_address3} maxLength={25} onChange={handleDataChange} /></Form.Group></Col>
            </Row>
          </div>

          {/* Employee Details */}
          <div className="section employee-details">
            <h4>Job Role Details</h4>
            <Row>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Department</Form.Label><Form.Text className="text-danger">*</Form.Text>
                  <Form.Control
                    as="select"
                    name="adm_users_deptid"
                    value={formData.adm_users_deptid}
                    onChange={handleDataChange}
                    required
                  >
                    <option value="">-- SELECT --</option>
                    {departments.map((dept) => (
                      <option key={dept.department_id} value={dept.department_name}>
                        {dept.department_name}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Role</Form.Label><Form.Text className="text-danger">*</Form.Text>
                  <Form.Control as="select" name="adm_users_defaultroleid"
                    value={formData.adm_users_defaultroleid} onChange={handleDataChange} required>
                    <option value="">-- SELECT --</option>
                    {roles.map((role) => (
                      <option key={role.Roles_Id} value={role.Roles_Id}>
                        {role.Roles_RoleName}
                      </option>
                    ))}
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Job</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_jobid" value={formData.adm_users_jobid} onChange={handleDataChange} required>
                <option value="">-- SELECT --</option>
                {job.map((jobid) => (
                  <option key={jobid} value={jobid}>{jobid}</option>
                ))}</Form.Control></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Position</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" as="select" name="adm_users_positionid" value={formData.adm_users_positionid} onChange={handleDataChange} required>
                <option value="">-- SELECT --</option>
                {position.map((positionid) => (
                  <option key={positionid} value={positionid}>{positionid}</option>
                ))}</Form.Control></Form.Group></Col>
              <Col><Form.Group className="edit-form-group"><Form.Label className="edit-form-label">Phone Extension</Form.Label><Form.Text className="text-danger">*</Form.Text><Form.Control className="edit-form-control" type="text" name="adm_users_phoneextn" value={formData.adm_users_phoneextn} onChange={handleDataChange} required /></Form.Group></Col>
            </Row>
          </div>

          {/* User Activity */}
          <div className="section user-activity">
            <h4>Account Status</h4>
            <Row>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Is Locked</Form.Label>
                  <Form.Check
                    type="switch"
                    id="adm_users_islocked"
                    label={formData.adm_users_islocked ? "Locked" : "Unlocked"}
                    checked={formData.adm_users_islocked}
                    onChange={(e) => setFormData({ ...formData, adm_users_islocked: e.target.checked })}
                  />
                </Form.Group>
              </Col>
              <Col>
                <Form.Group className="edit-form-group">
                  <Form.Label className="edit-form-label">Status</Form.Label>
                  <Form.Check
                    type="switch"
                    id="adm_users_status"
                    label={formData.adm_users_status ? "Active" : "Inactive"}
                    checked={formData.adm_users_status}
                    onChange={(e) => setFormData({ ...formData, adm_users_status: e.target.checked })}
                  />
                </Form.Group>
              </Col>

            </Row>
          </div>

        </div>
        <Col>
          <Button type="submit" className="mt-1 edit-btn p-1" style={{ backgroundColor: "#3CB371" }}>Save</Button>
          <Button className="mt-1 edit-btn p-1" style={{ backgroundColor: "#E53935" }} onClick={() => window.history.back()}>Cancel</Button>
        </Col>
      </Form>
      <div style={{ padding: "20px" }}>

        {/* Render alerts dynamically */}
        {alerts.map((alert) => (
          <CustomAlert key={alert.id} {...alert} onClose={() => setAlerts(alerts.filter((a) => a.id !== alert.id))} />
        ))}
      </div>
    </div>
  );
}