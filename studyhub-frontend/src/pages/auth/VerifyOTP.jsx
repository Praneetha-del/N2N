import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, Shield, Clock, RefreshCw, ArrowLeft, CheckCircle, Users, UserCheck } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';

const VerifyOTP = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resendLoading, setResendLoading] = useState(false);
    const [timer, setTimer] = useState(300);
    const [canResend, setCanResend] = useState(false);
    const [verified, setVerified] = useState(false);
    const [userRole, setUserRole] = useState('');
    const [userName, setUserName] = useState('');
    const [verificationError, setVerificationError] = useState(''); 

    useEffect(() => {
        const storedEmail = sessionStorage.getItem('registrationEmail');
        if (storedEmail) {
            setEmail(storedEmail);
        } else {
            toast.error('Please register first');
            navigate('/register');
        }

        const interval = setInterval(() => {
            setTimer(prev => {
                if (prev <= 1) {
                    setCanResend(true);
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(interval);
    }, [navigate]);

    const handleOtpChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        setVerificationError('');
        
        const newOtp = [...otp];
        newOtp[index] = value.slice(0, 1);
        setOtp(newOtp);

        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        if (/^\d{6}$/.test(pastedData)) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            const lastInput = document.getElementById('otp-5');
            if (lastInput) lastInput.focus();
        }
    };

    const handleVerify = async (e) => {
        e.preventDefault();
        const otpCode = otp.join('');
        
        if (otpCode.length !== 6) {
            toast.error('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setVerificationError('');
        
        try {
            // ✅ FIXED: Use /verify/otp endpoint (not /verify)
            const response = await api.post('/auth/verify/otp', {
                email: email,
                code: otpCode
            });
            
            console.log('✅ Verification response:', response.data);
            
            // Check if verification was successful
            if (response.data && response.data.success) {
                const responseData = response.data.data;
                
                if (responseData && responseData.user) {
                    setUserRole(responseData.user.role);
                    setUserName(responseData.user.firstName);
                }
                
                // ✅ ADMIN gets token immediately
                if (responseData && responseData.accessToken) {
                    const { accessToken, user } = responseData;
                    localStorage.setItem('token', accessToken);
                    api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
                    
                    setVerified(true);
                    toast.success('✅ Admin registration complete!');
                    
                    setTimeout(() => {
                        navigate('/admin/dashboard');
                    }, 2000);
                    return;
                }
                
                // ✅ STUDENT and TEACHER - Pending approval
                setVerified(true);
                toast.success('✅ OTP verified successfully!');
                
                // ✅ Don't redirect to login automatically, show pending page
                
            } else {
                const message = response.data?.message || 'Invalid verification code';
                setVerificationError(message);
                toast.error(message);
                setOtp(['', '', '', '', '', '']);
                document.getElementById('otp-0')?.focus();
            }
            
        } catch (error) {
            console.error('❌ Verification error:', error);
            const message = error.response?.data?.message || 'Invalid verification code';
            setVerificationError(message);
            toast.error(message);
            setOtp(['', '', '', '', '', '']);
            document.getElementById('otp-0')?.focus();
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResendLoading(true);
        try {
            await api.post('/auth/resend-verification', null, {
                params: { email }
            });
            toast.success('📧 New code sent to your email!');
            setTimer(300);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
            setVerificationError('');
            document.getElementById('otp-0')?.focus();
            
            const interval = setInterval(() => {
                setTimer(prev => {
                    if (prev <= 1) {
                        setCanResend(true);
                        clearInterval(interval);
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to resend code');
        } finally {
            setResendLoading(false);
        }
    };

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const goToLogin = () => {
        navigate('/login');
    };

    // ✅ PENDING APPROVAL PAGE
    if (verified && userRole !== 'ROLE_ADMIN') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-yellow-100 rounded-full">
                            <Clock className="text-yellow-600" size={64} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">⏳ Waiting for Admin Approval</h2>
                    <p className="text-gray-600 mb-2">
                        Hello <strong>{userName || 'User'}</strong>! Your account has been created successfully.
                    </p>
                    <p className="text-gray-500 text-sm mb-6">
                        Your account is pending approval from the admin. You will be able to login once approved.
                    </p>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
                        <div className="flex items-start space-x-3">
                            <Users className="text-blue-600 mt-1 flex-shrink-0" size={20} />
                            <div>
                                <p className="text-sm text-blue-800 font-medium">What happens next?</p>
                                <ul className="text-sm text-blue-700 mt-1 space-y-1">
                                    <li>✅ Admin will review your account</li>
                                    <li>📧 You'll receive an email notification</li>
                                    <li>🔑 You can login after approval</li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={goToLogin}
                        className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
                    >
                        Go to Login
                    </button>
                    
                    <p className="text-xs text-gray-400 mt-4">
                        📧 Check your email for status updates
                    </p>
                </motion.div>
            </div>
        );
    }

    // ✅ ADMIN SUCCESS PAGE
    if (verified && userRole === 'ROLE_ADMIN') {
        return (
            <div className="min-h-[80vh] flex items-center justify-center py-12">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center max-w-md"
                >
                    <div className="flex justify-center mb-6">
                        <div className="p-4 bg-green-100 rounded-full">
                            <CheckCircle className="text-green-600" size={64} />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Registration Complete! 🎉</h2>
                    <p className="text-gray-600">Your email has been verified successfully.</p>
                    <p className="text-sm text-gray-500 mt-2">Redirecting to dashboard...</p>
                </motion.div>
            </div>
        );
    }

    // ✅ OTP VERIFICATION PAGE
    return (
        <div className="min-h-[80vh] flex items-center justify-center py-12">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <button
                        onClick={() => {
                            sessionStorage.removeItem('registrationEmail');
                            navigate('/register');
                        }}
                        className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                    >
                        <ArrowLeft size={18} className="mr-1" />
                        Back to Registration
                    </button>

                    <div className="text-center mb-8">
                        <div className="flex items-center justify-center mb-4">
                            <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-2xl">
                                <Shield className="text-blue-600" size={32} />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Verify Your Email</h1>
                        <p className="text-gray-600 mt-1">
                            We've sent a 6-digit code to <br />
                            <strong className="text-blue-600">{email}</strong>
                        </p>
                    </div>

                    <form onSubmit={handleVerify} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-3 text-center">
                                Enter Verification Code
                            </label>
                            <div className="flex justify-center gap-2" onPaste={handlePaste}>
                                {otp.map((digit, index) => (
                                    <input
                                        key={index}
                                        id={`otp-${index}`}
                                        type="text"
                                        value={digit}
                                        onChange={(e) => handleOtpChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className="w-12 h-14 text-center text-2xl font-bold border-2 border-gray-300 rounded-lg focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all"
                                        maxLength={1}
                                        autoFocus={index === 0}
                                        disabled={loading}
                                    />
                                ))}
                            </div>
                            {verificationError && (
                                <p className="mt-2 text-sm text-red-500 text-center">
                                    {verificationError}
                                </p>
                            )}
                            <p className="text-sm text-gray-500 mt-2 text-center">
                                Enter the 6-digit code sent to your email
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.some(d => !d)}
                            className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center">
                                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Verifying...
                                </span>
                            ) : (
                                'Verify & Register'
                            )}
                        </button>
                    </form>

                    <div className="mt-6 flex items-center justify-between">
                        <div className="flex items-center text-sm text-gray-500">
                            <Clock size={16} className="mr-1" />
                            <span>Code expires in: <strong className={timer < 60 ? 'text-red-500' : ''}>{formatTime(timer)}</strong></span>
                        </div>
                        <button
                            onClick={handleResend}
                            disabled={!canResend || resendLoading}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium flex items-center disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw size={16} className={`mr-1 ${resendLoading ? 'animate-spin' : ''}`} />
                            {resendLoading ? 'Sending...' : 'Resend Code'}
                        </button>
                    </div>

                    <div className="mt-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
                        <p className="text-xs text-gray-500 text-center">
                            📧 Didn't receive the code? Check your spam folder or click "Resend Code".
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOTP;