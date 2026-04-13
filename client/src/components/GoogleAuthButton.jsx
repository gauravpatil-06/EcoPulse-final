import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const GoogleAuthButton = ({ onSuccessAction, isLogin, setError, selectedRole }) => {
  const navigate = useNavigate();
  const { googleLogin } = useAuth(); // Import from context so app state is updated
  const [loading, setLoading] = useState(false);

  const handleSuccess = async (response) => {
    try {
      setLoading(true);
      // Wait for the context to handle backend logic
      const data = await googleLogin(response.credential, selectedRole);
      console.log('Google Login Successful:', data);
      
      if(onSuccessAction) onSuccessAction();
      
      // Navigate to correct dashboard based on the user object's role
      const role = data.user.role || 'citizen';
      navigate(`/${role}/dashboard`, { replace: true });
    } catch (error) {
      console.error('Google Sign In Error:', error.message || 'Server error');
      if (setError) setError('Google authentication failed on server. ' + (error.message || ''));
    } finally {
      setLoading(false);
    }
  };

  const handleError = () => {
    console.error('Google Auth Failed');
    if (setError) setError('Google connection failed. Please try again.');
  };

  return (
    <div className="flex justify-center mt-4 w-full relative z-50">
      {loading ? (
        <div className="py-2.5 flex justify-center text-[14px] text-gray-500 font-bold w-full border border-gray-200 rounded-xl">Processing Google Login...</div>
      ) : (
        <GoogleLogin
            onSuccess={handleSuccess}
            onError={handleError}
            useOneTap
            shape="rectangular"
            theme="outline"
            size="large"
            width="320"
            text={isLogin ? "signin_with" : "signup_with"}
        />
      )}
    </div>
  );
};

export default GoogleAuthButton;
