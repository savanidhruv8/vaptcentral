import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

const Login = ({ onLoginSuccess }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotPasswordData, setForgotPasswordData] = useState({
    email: '',
    otp: '',
    newPassword: '',
    confirmPassword: '',
    resetToken: '',
  });
  const [forgotPasswordStep, setForgotPasswordStep] = useState(1); // 1: email, 2: otp, 3: new password
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const { login } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const handleForgotPasswordInputChange = (e) => {
    const { name, value } = e.target;
    setForgotPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    setForgotPasswordError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const result = await login(formData.email, formData.password);
      if (result.success) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error);
      }
    } catch (error) {
      setError('An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPasswordSubmit = async (e) => {
    e.preventDefault();
    setForgotPasswordError('');
    setForgotPasswordSuccess('');

    try {
      if (forgotPasswordStep === 1) {
        // Request password reset
        await api.post('/auth/password-reset/', { email: forgotPasswordData.email });
        setForgotPasswordSuccess('OTP sent to your email');
        setForgotPasswordStep(2);
      } else if (forgotPasswordStep === 2) {
        // Verify OTP
        const response = await api.post('/auth/verify-otp/', {
          email: forgotPasswordData.email,
          otp: forgotPasswordData.otp
        });
        setForgotPasswordData(prev => ({ ...prev, resetToken: response.data.reset_token }));
        setForgotPasswordSuccess('OTP verified successfully');
        setForgotPasswordStep(3);
      } else if (forgotPasswordStep === 3) {
        // Reset password
        await api.post('/auth/reset-password/', {
          reset_token: forgotPasswordData.resetToken,
          new_password: forgotPasswordData.newPassword,
          confirm_password: forgotPasswordData.confirmPassword
        });
        setForgotPasswordSuccess('Password reset successfully');
        setShowForgotPassword(false);
        setForgotPasswordStep(1);
        setForgotPasswordData({
          email: '',
          otp: '',
          newPassword: '',
          confirmPassword: '',
          resetToken: '',
        });
      }
    } catch (error) {
      setForgotPasswordError(error.response?.data?.error || 'An error occurred');
    }
  };

  if (showForgotPassword) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-lg w-full space-y-10">
          <div>
            <h2 className="text-center text-4xl font-extrabold text-white">
              Reset Password
            </h2>
            <p className="mt-4 text-center text-lg text-gray-300">
              {forgotPasswordStep === 1 && 'Enter your email to receive an OTP'}
              {forgotPasswordStep === 2 && 'Enter the OTP sent to your email'}
              {forgotPasswordStep === 3 && 'Enter your new password'}
            </p>
          </div>
          <form className="mt-10 space-y-8" onSubmit={handleForgotPasswordSubmit}>
            <div className="rounded-md shadow-sm space-y-4">
              {forgotPasswordStep === 1 && (
                <div>
                  <label htmlFor="email" className="sr-only">Email address</label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    className="appearance-none relative block w-full px-4 py-4 border border-gray-600 placeholder-gray-400 text-white bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
                    placeholder="Email address"
                    value={forgotPasswordData.email}
                    onChange={handleForgotPasswordInputChange}
                  />
                </div>
              )}
              
              {forgotPasswordStep === 2 && (
                <div>
                  <label htmlFor="otp" className="sr-only">OTP</label>
                  <input
                    id="otp"
                    name="otp"
                    type="text"
                    required
                    maxLength="6"
                    className="appearance-none relative block w-full px-4 py-4 border border-gray-600 placeholder-gray-400 text-white bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
                    placeholder="Enter 6-digit OTP"
                    value={forgotPasswordData.otp}
                    onChange={handleForgotPasswordInputChange}
                  />
                </div>
              )}
              
              {forgotPasswordStep === 3 && (
                <>
                  <div>
                    <label htmlFor="newPassword" className="sr-only">New Password</label>
                    <input
                      id="newPassword"
                      name="newPassword"
                      type="password"
                      required
                      className="appearance-none relative block w-full px-4 py-4 border border-gray-600 placeholder-gray-400 text-white bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
                      placeholder="New Password"
                      value={forgotPasswordData.newPassword}
                      onChange={handleForgotPasswordInputChange}
                    />
                  </div>
                  <div>
                    <label htmlFor="confirmPassword" className="sr-only">Confirm Password</label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      required
                      className="appearance-none relative block w-full px-4 py-4 border border-gray-600 placeholder-gray-400 text-white bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
                      placeholder="Confirm Password"
                      value={forgotPasswordData.confirmPassword}
                      onChange={handleForgotPasswordInputChange}
                    />
                  </div>
                </>
              )}
            </div>

            {forgotPasswordError && (
              <div className="text-red-600 text-sm text-center">{forgotPasswordError}</div>
            )}
            
            {forgotPasswordSuccess && (
              <div className="text-green-600 text-sm text-center">{forgotPasswordSuccess}</div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
              >
                {forgotPasswordStep === 1 && 'Send OTP'}
                {forgotPasswordStep === 2 && 'Verify OTP'}
                {forgotPasswordStep === 3 && 'Reset Password'}
              </button>
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={() => {
                  setShowForgotPassword(false);
                  setForgotPasswordStep(1);
                  setForgotPasswordData({
                    email: '',
                    otp: '',
                    newPassword: '',
                    confirmPassword: '',
                    resetToken: '',
                  });
                }}
                className="text-indigo-400 hover:text-indigo-300 text-base font-medium transition-colors duration-200"
              >
                Back to Login
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-lg w-full space-y-10">
        <div>
          <h2 className="text-center text-4xl font-extrabold text-white">
            Sign in to your account
          </h2>
          <p className="mt-4 text-center text-lg text-gray-300">
            VAPT Dashboard
          </p>
        </div>
        <form className="mt-10 space-y-8" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm space-y-4">
            <div>
              <label htmlFor="email" className="sr-only">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className="appearance-none relative block w-full px-4 py-4 border border-gray-600 placeholder-gray-400 text-white bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
                placeholder="Email address"
                value={formData.email}
                onChange={handleInputChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                className="appearance-none relative block w-full px-4 py-4 border border-gray-600 placeholder-gray-400 text-white bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 text-base"
                placeholder="Password"
                value={formData.password}
                onChange={handleInputChange}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-600 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-4 px-6 border border-transparent text-lg font-medium rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={() => setShowForgotPassword(true)}
              className="text-indigo-400 hover:text-indigo-300 text-base font-medium transition-colors duration-200"
            >
              Forgot your password?
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Login;
