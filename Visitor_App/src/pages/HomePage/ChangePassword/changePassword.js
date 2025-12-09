import React, { useState, useEffect, useCallback } from 'react';
import { Eye, EyeOff, CheckCircle, AlertCircle, X, User } from 'lucide-react';
import { Form } from 'react-bootstrap';
import axios from 'axios';
import { SERVER_PORT } from '../../../constant';

// Function to convert buffer to Base64 string
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


const ChangePassword = ({ setTitle }) => {
  const mail = sessionStorage.getItem('email');
  const userPhoto = sessionStorage.getItem('profileimage');

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordCriteria, setPasswordCriteria] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
    noCommonWords: false,
    noPersonalInfo: false
  });
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [photoUrl, setPhotoUrl] = useState('');

  useEffect(() => {
    setTitle('Change Password');
  }, [setTitle]);

  useEffect(() => {
    if (userPhoto) {
      const base64Image = bufferToBase64(userPhoto);
      setPhotoUrl(`data:image/jpeg;base64,${base64Image}`);
    }
  }, [userPhoto]);

  const commonPasswords = [
    'password', '123456', '123456789', 'qwerty', 'abc123', 'password123',
    'admin', 'letmein', 'welcome', 'monkey', '1234567890', 'dragon'
  ];

  const validatePassword = useCallback((password) => {
    const criteria = {
      length: password.length >= 12,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /\d/.test(password),
      specialChar: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password),
      noCommonWords: !commonPasswords.some(common =>
        password.toLowerCase().includes(common.toLowerCase())
      ),
      noPersonalInfo: mail ? !password.toLowerCase().includes(mail.split('@')[0].toLowerCase()) : true
    };
    setPasswordCriteria(criteria);
    const score = Object.values(criteria).filter(Boolean).length;
    setPasswordStrength(score);
    return {
      isValid: Object.values(criteria).every(Boolean),
      score,
    };
  }, [mail]);

  const getPasswordStrengthInfo = () => {
    if (passwordStrength <= 2) return { level: 'Weak', color: 'bg-red-500', textColor: 'text-red-600', width: '25%' };
    if (passwordStrength <= 4) return { level: 'Fair', color: 'bg-orange-500', textColor: 'text-orange-600', width: '50%' };
    if (passwordStrength <= 6) return { level: 'Good', color: 'bg-blue-500', textColor: 'text-blue-600', width: '75%' };
    return { level: 'Strong', color: 'bg-green-500', textColor: 'text-green-600', width: '100%' };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsLoading(true);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All fields are required');
      setIsLoading(false);
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      setIsLoading(false);
      return;
    }

    const validation = validatePassword(newPassword);
    if (!validation.isValid) {
      setError('Password must be at least 12 characters and meet all criteria.');
      setIsLoading(false);
      return;
    }

    try {
      // Step 1: Validate current password on the server
      const checkResponse = await axios.post(`${SERVER_PORT}/validate_password`, {
        email: mail,
        password: currentPassword
      });

      if (!checkResponse.data.isValid) {
        setError('Current password is incorrect');
        setIsLoading(false);
        return;
      }
      
      // Step 2: If validation passes, proceed to change the password
      const changeResponse = await axios.put(`${SERVER_PORT}/change_password/${mail}`, { newPassword });
      
      if (changeResponse.data.success) {
        setSuccess("Password changed successfully!");
        setTimeout(() => {
          setCurrentPassword('');
          setNewPassword('');
          setConfirmPassword('');
          setPasswordStrength(0);
          window.location.href = '/Home'; // Redirect on success
        }, 2000);
      } else {
        setError(changeResponse.data.error || "Password change failed.");
      }

    } catch (err) {
      console.error("Request failed:", err);
      // Handle different error responses
      if (err.response && err.response.data && err.response.data.message) {
        setError(err.response.data.message);
      } else {
        setError("Server error. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const strengthInfo = getPasswordStrengthInfo();

  const CriteriaItem = ({ met, children }) => (
    <div className={`flex items-center gap-2 text-sm ${met ? 'text-green-600' : 'text-gray-500'}`}>
      {met ? <CheckCircle size={16} /> : <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
      <span>{children}</span>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row bg-gradient-to-br from-indigo-50 to-blue-100 shadow-xl rounded-3xl overflow-hidden max-w-5xl mx-auto my-2">
      <div className="md:w-1/3 p-4 border-r border-indigo-100 flex flex-col items-center justify-center bg-gradient-to-br from-indigo-100 to-indigo-200">
        <div className="text-center mb-2">
          <h1 className="text-xl font-bold text-indigo-700 mb-1">Change Password</h1>
          <p className="text-xs text-gray-500">Keep your account secure with a strong password</p>
        </div>
        {photoUrl ? (
          <img src={photoUrl} alt="Profile" className="w-196 h-196 rounded-full object-cover ring-4 ring-indigo-200 shadow-lg mb-1" />
        ) : (
          <div className="w-166 h-166 rounded-full bg-gradient-to-br from-blue-400 to-indigo-400 flex items-center justify-center ring-4 ring-indigo-200 shadow-lg mb-1">
            <User className="w-16 h-16 text-white" />
          </div>
        )}
      </div>

      <Form onSubmit={handleSubmit} className="md:w-2/3 p-4 flex flex-col justify-center gap-3 bg-white">
        <div>
          <label className="text-xs font-semibold text-indigo-700">Current Password</label>
          <div className="relative mt-1">
            <input type={showCurrentPassword ? "text" : "password"} value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full pl-3 pr-10 py-1.5 border border-indigo-200 rounded-lg bg-indigo-50 focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm" placeholder="Enter current password" required />
            <button type="button" onClick={() => setShowCurrentPassword(!showCurrentPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-600" tabIndex={-1}>
              {showCurrentPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-indigo-700">New Password</label>
          <div className="relative mt-1">
            <input type={showNewPassword ? "text" : "password"} value={newPassword} onChange={(e) => { setNewPassword(e.target.value); validatePassword(e.target.value); }} className="w-full pl-3 pr-10 py-1.5 border border-indigo-200 rounded-lg bg-indigo-50 focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm" placeholder="Create a strong password" required />
            <button type="button" onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-600" tabIndex={-1}>
              {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-indigo-700">Confirm New Password</label>
          <div className="relative mt-1">
            <input type={showConfirmPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-3 pr-10 py-1.5 border border-indigo-200 rounded-lg bg-indigo-50 focus:ring-2 focus:ring-indigo-400 outline-none transition text-sm" placeholder="Confirm your new password" required />
            <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)} className="absolute right-2 top-1/2 transform -translate-y-1/2 text-indigo-400 hover:text-indigo-600" tabIndex={-1}>
              {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
          {confirmPassword && newPassword !== confirmPassword && (
            <p className="text-red-600 text-xs mt-1 flex items-center gap-1">
              <X size={14} /> Passwords don't match
            </p>
          )}
        </div>

        {newPassword && (
          <div>
            <div className="flex justify-between text-xs mb-1">
              <span className="text-gray-500">Password Strength</span>
              <span className={`font-semibold ${strengthInfo.textColor}`}>{strengthInfo.level}</span>
            </div>
            <div className="w-full bg-indigo-100 rounded-full h-1">
              <div className={`h-1 rounded-full ${strengthInfo.color}`} style={{ width: strengthInfo.width }} />
            </div>
          </div>
        )}
        
        {newPassword && (
          <div className="grid grid-cols-2 gap-1 bg-indigo-50 p-2 rounded-lg border border-indigo-100 mt-1">
            <CriteriaItem met={passwordCriteria.length}>12+ characters</CriteriaItem>
            <CriteriaItem met={passwordCriteria.uppercase}>Uppercase letter</CriteriaItem>
            <CriteriaItem met={passwordCriteria.lowercase}>Lowercase letter</CriteriaItem>
            <CriteriaItem met={passwordCriteria.number}>At least one number</CriteriaItem>
            <CriteriaItem met={passwordCriteria.specialChar}>Special character</CriteriaItem>
            <CriteriaItem met={passwordCriteria.noCommonWords}>No common passwords</CriteriaItem>
            <CriteriaItem met={passwordCriteria.noPersonalInfo}>No personal info</CriteriaItem>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 text-red-700 text-xs flex gap-2 mt-1">
            <AlertCircle size={14} /> {error}
          </div>
        )}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-2 text-green-700 text-xs flex gap-2 mt-1">
            <CheckCircle size={14} /> {success}
          </div>
        )}

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-2 rounded-lg font-semibold shadow mt-2 transition text-sm" disabled={isLoading}>
          {isLoading ? "Updating..." : "Update Password"}
        </button>

        <div className="mt-2 pt-2 border-t text-xs text-gray-500 space-y-1">
          <h4 className="font-medium text-xs text-indigo-700">💡 Security Tips</h4>
          <ul className="list-disc list-inside space-y-1">
            <li>Use a unique password for each account</li>
            <li>Consider using a password manager</li>
            <li>Enable two-factor authentication</li>
          </ul>
        </div>
      </Form>
    </div>
  );
};

export default ChangePassword;
