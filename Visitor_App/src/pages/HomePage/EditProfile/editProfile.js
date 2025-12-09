import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form, Button, Card, Image } from 'react-bootstrap';
import axios from 'axios';
import profilePic from '../profile.png';
import CustomAlert from '../../../CustomAlert';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { SERVER_PORT } from '../../../constant';

function bufferToBase64(buffer) {
  if (!buffer) return '';
  if (typeof buffer === 'string') return buffer;
  if (buffer.data) {
    return btoa(
      new Uint8Array(buffer.data).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );
  }
  return '';
}

const EditProfile = ({ setTitle }) => {
  const loginid = sessionStorage.getItem('username');
  const today = new Date().toISOString().split('T')[0];
  const gender = ['Male', 'Female', 'Others'];
  const navigate = useNavigate();

  const [alerts, setAlerts] = useState([]);
  const [userData, setUserData] = useState({});

  useEffect(() => {
    setTitle('Edit Profile');
  }, [setTitle]);

  useEffect(() => {
    if (loginid) {
      axios.get(`${SERVER_PORT}/edit_profile/${loginid}`)
        .then(response => {
          const user = response.data;
          setUserData(user);
          sessionStorage.setItem("email", user.adm_users_email);
          if (user.adm_users_profileimage) {
            sessionStorage.setItem("profileimage", user.adm_users_profileimage);
          }
        })
        .catch(error => console.error("Error fetching user data:", error));
    }
  }, [loginid]);

  const handleDataChange = (e) => {
    const { name, type, checked, value } = e.target;
    setUserData({ ...userData, [name]: type === "checkbox" ? checked : value });
  };

  const handleImageChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUserData({ ...userData, adm_users_profileimage: event.target.result });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`${SERVER_PORT}/edit_profile/${loginid}`, userData);
      setAlerts([{ id: Date.now(), type: 'success', title: 'Success', message: 'Profile updated successfully!' }]);
      setTimeout(() => navigate('/Home'), 2000);
    } catch (error) {
      setAlerts([{ id: Date.now(), type: 'error', title: 'Error', message: 'Update failed.' }]);
    }
  };

  const back = () => navigate(-1);

  return (
    <Container fluid className="p-0 m-0">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        style={{
          width: '100%',
          minHeight: '90%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          padding: '0.5px 0',
          fontFamily: "'Poppins', sans-serif"
        }}
      >
        {/* Edit Profile Title */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{
            width: '100%',
            maxWidth: '850px',
            marginBottom: '1rem',
            textAlign: 'center'
          }}
        >
          <h1
            style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#2d3748',
              background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              margin: '0',
              padding: '0.5rem 0'
            }}
          >
            Edit Profile
          </h1>
          <p
            style={{
              fontSize: '0.9rem',
              color: '#718096',
              margin: '0',
              fontStyle: 'italic'
            }}
          >
            Update your personal information and preferences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          style={{ width: '100%', maxWidth: '850px' }}
        >
          <Card className="shadow-lg" style={{
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(10px)',
            border: 'none',
            overflow: 'hidden'
          }}>
            <Card.Body style={{ padding: '1.5rem' }}>
              <div className="mb-3">
                <Row className="align-items-center">
                  <Col xs={12} md={5} className="text-center mb-2 mb-md-0">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.9 }}
                    >
                      <Image
                        src={
                          typeof userData.adm_users_profileimage === "string"
                            ? userData.adm_users_profileimage
                            : userData.adm_users_profileimage
                              ? `data:image/jpeg;base64,${bufferToBase64(userData.adm_users_profileimage)}`
                              : profilePic
                        }
                        roundedCircle
                        alt="User Profile"
                        style={{
                          width: '160px',
                          height: '160px',
                          objectFit: 'cover',
                          border: '3px solid #fff',
                          boxShadow: '0 3px 15px rgba(0,0,0,0.1)'
                        }}
                      />
                    </motion.div>
                  </Col>
                  <Col xs={12} md={7}>
                    <motion.h3
                      className="mb-1"
                      style={{ fontWeight: '700', color: '#2d3748', fontSize: '1.35rem' }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                    >
                      {userData.adm_users_firstname} {userData.adm_users_lastname}
                    </motion.h3>
                    <motion.p
                      className="text-muted mb-1"
                      style={{ fontSize: '0.85rem', fontWeight: '500' }}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      Login ID: {userData.adm_users_loginid}
                    </motion.p>
                    <Form.Control
                      type="file"
                      id="profileImageInput"
                      className="d-none"
                      accept="image/*"
                      onChange={handleImageChange}
                    />
                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      style={{ display: 'inline-block' }}
                    >
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="mt-1"
                        style={{
                          background: 'linear-gradient(135deg, #e0e7ff 0%, #1944f1ff 100%)',
                          color: '#3730a3',
                          fontWeight: 600,
                          border: '1.5px solid #6366f1',
                          padding: '0.25rem 0.75rem',
                          fontSize: '0.8rem'
                        }}
                        onClick={() => document.getElementById('profileImageInput').click()}
                      >
                        Change Profile Photo
                      </Button>
                    </motion.div>
                  </Col>
                </Row>
              </div>

              <Form onSubmit={handleSubmit} style={{ fontSize: '0.55rem' }}>
                <Row className="g-3">
                  <Col md={6}>
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                    >
                      <h5 style={{
                        color: '#2d3748',
                        fontWeight: '600',
                        borderBottom: '2px solid #4299e1',
                        paddingBottom: '0.4rem',
                        marginBottom: '1rem',
                        fontSize: '0.95rem'
                      }}>
                        Personal Details:
                      </h5>
                      <Row className="mb-2">
                        <Col md={6} className="mb-2 mb-md-0">
                          <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>First Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="adm_users_firstname"
                            value={userData.adm_users_firstname || ''}
                            onChange={handleDataChange}
                            style={{
                              borderRadius: '6px',
                              padding: '3px 6px',
                              border: '1.5px solid #e2e8f0',
                              background: '#f8fafc',
                              fontSize: '0.75rem',
                              height: '28px'
                            }}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>Last Name</Form.Label>
                          <Form.Control
                            type="text"
                            name="adm_users_lastname"
                            value={userData.adm_users_lastname || ''}
                            onChange={handleDataChange}
                            style={{
                              borderRadius: '6px',
                              padding: '3px 6px',
                              border: '1.5px solid #e2e8f0',
                              background: '#f8fafc',
                              fontSize: '0.75rem',
                              height: '28px'
                            }}
                          />
                        </Col>
                      </Row>
                      <div className="mb-2">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>Mobile</Form.Label>
                        <Form.Control
                          type="text"
                          name="adm_users_mobile"
                          value={userData.adm_users_mobile || ''}
                          onChange={handleDataChange}
                          style={{
                            borderRadius: '6px',
                            padding: '3px 6px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '0.75rem',
                            height: '28px'
                          }}
                        />
                      </div>
                      <div className="mb-2">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="adm_users_email"
                          value={userData.adm_users_email || ''}
                          onChange={handleDataChange}
                          style={{
                            borderRadius: '6px',
                            padding: '3px 6px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '0.75rem',
                            height: '28px'
                          }}
                        />
                      </div>
                      <div className="mb-2">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>Gender</Form.Label>
                        <Form.Control
                          as="select"
                          name="adm_users_gender"
                          value={userData.adm_users_gender || ''}
                          onChange={handleDataChange}
                          style={{
                            borderRadius: '6px',
                            padding: '3px 6px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '0.75rem',
                            height: '28px'
                          }}
                        >
                          <option value="">Select Gender</option>
                          {gender.map((g) => (<option key={g} value={g}>{g}</option>))}
                        </Form.Control>
                      </div>
                      <div className="mb-2">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>Date of Birth</Form.Label>
                        <Form.Control
                          type="date"
                          name="adm_users_dob"
                          value={userData.adm_users_dob || ''}
                          max={today}
                          onChange={handleDataChange}
                          style={{
                            borderRadius: '6px',
                            padding: '3px 6px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '0.75rem',
                            height: '28px'
                          }}
                        />
                      </div>
                    </motion.div>
                  </Col>

                  <Col md={6}>
                    <motion.div
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.7, duration: 0.5 }}
                    >
                      <h5 style={{
                        color: '#2d3748',
                        fontWeight: '600',
                        borderBottom: '2px solid #4299e1',
                        paddingBottom: '0.4rem',
                        marginBottom: '1rem',
                        fontSize: '0.95rem'
                      }}>
                        Address Details:
                      </h5>
                      <Row className="mb-2">
                        <Col md={6} className="mb-2 mb-md-0">
                          <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>Address Line 1</Form.Label>
                          <Form.Control
                            type="text"
                            name="adm_users_address1"
                            value={userData.adm_users_address1 || ''}
                            onChange={handleDataChange}
                            style={{
                              borderRadius: '6px',
                              padding: '3px 6px',
                              border: '1.5px solid #e2e8f0',
                              background: '#f8fafc',
                              fontSize: '0.75rem',
                              height: '28px'
                            }}
                          />
                        </Col>
                        <Col md={6}>
                          <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>Address Line 2</Form.Label>
                          <Form.Control
                            type="text"
                            name="adm_users_address2"
                            value={userData.adm_users_address2 || ''}
                            onChange={handleDataChange}
                            style={{
                              borderRadius: '6px',
                              padding: '3px 6px',
                              border: '1.5px solid #e2e8f0',
                              background: '#f8fafc',
                              fontSize: '0.75rem',
                              height: '28px'
                            }}
                          />
                        </Col>
                      </Row>
                      <div className="mb-2">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>Address Line 3</Form.Label>
                        <Form.Control
                          type="text"
                          name="adm_users_address3"
                          value={userData.adm_users_address3 || ''}
                          onChange={handleDataChange}
                          style={{
                            borderRadius: '6px',
                            padding: '3px 6px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '0.75rem',
                            height: '28px'
                          }}
                        />
                      </div>
                      <div className="mb-2">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>City</Form.Label>
                        <Form.Control
                          type="text"
                          name="adm_users_city"
                          value={userData.adm_users_city || ''}
                          onChange={handleDataChange}
                          style={{
                            borderRadius: '6px',
                            padding: '3px 6px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '0.75rem',
                            height: '28px'
                          }}
                        />
                      </div>
                      <div className="mb-2">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>State</Form.Label>
                        <Form.Control
                          type="text"
                          name="adm_users_state"
                          value={userData.adm_users_state || ''}
                          onChange={handleDataChange}
                          style={{
                            borderRadius: '6px',
                            padding: '3px 6px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '0.75rem',
                            height: '28px'
                          }}
                        />
                      </div>
                      <div className="mb-2">
                        <Form.Label style={{ fontWeight: '600', color: '#4a5568', fontSize: '0.7rem', marginBottom: '0.05rem' }}>Postal Code</Form.Label>
                        <Form.Control
                          type="text"
                          name="adm_users_postalcode"
                          value={userData.adm_users_postalcode || ''}
                          onChange={handleDataChange}
                          style={{
                            borderRadius: '6px',
                            padding: '3px 6px',
                            border: '1.5px solid #e2e8f0',
                            background: '#f8fafc',
                            fontSize: '0.75rem',
                            height: '28px'
                          }}
                        />
                      </div>
                    </motion.div>
                  </Col>
                </Row>
                <motion.div
                  className="d-flex justify-content-end gap-2 mt-3"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.8, duration: 0.5 }}
                >
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.96 }}
                    className="px-3 py-1"
                    type="submit"
                    style={{
                      borderRadius: '6px',
                      border: 'none',
                      background: 'linear-gradient(135deg, #4299e1 0%, #3182ce 100%)',
                      color: 'white',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}
                  >
                    Save
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03, boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                    whileTap={{ scale: 0.96 }}
                    className="px-3 py-1"
                    onClick={back}
                    style={{
                      borderRadius: '6px',
                      border: '1.5px solid #e53e3e',
                      background: 'transparent',
                      color: '#e53e3e',
                      fontWeight: '600',
                      fontSize: '0.85rem'
                    }}
                  >
                    Cancel
                  </motion.button>
                </motion.div>
              </Form>
            </Card.Body>
          </Card>
        </motion.div>

        <div style={{ padding: "15px" }}>
          {alerts.map((alert) => (
            <CustomAlert
              key={alert.id}
              {...alert}
              onClose={() => setAlerts((prev) => prev.filter((a) => a.id !== alert.id))}
            />
          ))}
        </div>
      </motion.div>
    </Container>
  );
};

export default EditProfile;