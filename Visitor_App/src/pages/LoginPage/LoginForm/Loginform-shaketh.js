// LoginPage.jsx
import React from 'react';

const LoginPage = () => {
  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      fontFamily: 'Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Left Section - 60% Width */}
      <div style={{
        flex: '0 0 70%',
        position: 'relative',
        backgroundColor: '#fff',
        minHeight: '100vh',
        overflow: 'hidden'
      }}>
        {/* Illustration Area */}
        <div style={{
          position: 'relative',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 2
        }}>
          <div style={{
            textAlign: 'center',
            maxWidth: '500px',
            padding: '20px'
          }}>
          </div>
        </div>
      </div>

      {/* Curved Separator Line */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: '72%',
        transform: 'translateX(-100%)',
        width: '200px',
        height: '100%',
        overflow: 'visible',
        zIndex: 5
      }}>

        <svg
          viewBox="-200 0 400 1000"
          preserveAspectRatio="none"
          style={{ width: "100%", height: "100%" }}
        >
          <path
            d="
      M -200,0
      C 200,200 100,400 -50,600
      C -300,800 200,900 -200,1000
      L 200,1000
      L 200,0
      Z
    "
            fill="#006400"
          />
          <path
            d="
      M -200,0
      C 200,200 100,400 -50,600
      C -300,800 200,900 -200,1000
    "
            fill="none"
            stroke="#004d00"
            strokeWidth="3"
          />
        </svg>

      </div>

      {/* Right Section - 40% Width */}
      <div style={{
        flex: '0 0 30%',
        backgroundColor: '#006400',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '40px 30px',
        position: 'relative',
        zIndex: 4
      }}>
        {/* Login Form */}
        <div style={{
          width: '100%',
          maxWidth: '300px',
          color: 'white'
        }}>
          <h1 style={{
            fontSize: '36px',
            fontWeight: 'bold',
            marginBottom: '30px',
            textAlign: 'center'
          }}>Login</h1>

          {/* Username Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>Username</label>
            <input
              type="text"
              placeholder="Enter your username"
              style={{
                width: '100%',
                padding: '12px 15px',
                backgroundColor: '#004d00',
                border: '1px solid #008000',
                borderRadius: '4px',
                color: '#ccc',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Password Field */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontWeight: 'bold'
            }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              style={{
                width: '100%',
                padding: '12px 15px',
                backgroundColor: '#004d00',
                border: '1px solid #008000',
                borderRadius: '4px',
                color: '#ccc',
                fontSize: '16px'
              }}
            />
          </div>

          {/* Forgot Password Link */}
          <div style={{
            textAlign: 'right',
            marginBottom: '25px'
          }}>
            <a href="#" style={{
              color: '#90EE90',
              textDecoration: 'none',
              fontSize: '14px'
            }}>Forgot Password?</a>
          </div>

          {/* Login Button */}
          <button style={{
            width: '90px',
            padding: '7px',
            backgroundColor: '#32CD32',
            border: 'none',
            borderRadius: '4px',
            color: 'white',
            fontSize: '16px',
            fontWeight: 'bold',
            cursor: 'pointer',
            marginBottom: '25px'
          }}>
            Login
          </button>

          {/* Register Link */}
          <div style={{
            textAlign: 'center',
            marginBottom: '40px'
          }}>
            <span style={{ color: 'white' }}>Don't have an account? </span>
            <a href="#" style={{
              color: '#90EE90',
              textDecoration: 'none'
            }}>Register Now</a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;