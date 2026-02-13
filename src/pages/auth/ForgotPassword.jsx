import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Mail, ArrowLeft, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email) {
            toast.error('Please enter your email');
            return;
        }

        setLoading(true);
        try {
            await authService.requestPasswordReset(email);
            setSent(true);
            toast.success('Password reset link sent to your email');
        } catch (error) {
            console.error('Password reset request error:', error);
            toast.error(error.response?.data?.message || 'Failed to send reset link');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md"
            >
                <div className="bg-white shadow-xl p-8">
                    {/* Header */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Mail className="h-8 w-8 text-blue-700" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Forgot Password?</h1>
                        <p className="text-gray-600 mt-2">
                            {sent
                                ? 'Check your email for reset instructions'
                                : 'Enter your email to receive a password reset link'}
                        </p>
                    </div>

                    {!sent ? (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Email Input */}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                                    Email Address
                                </label>
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    className="w-full px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
                                    disabled={loading}
                                />
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-blue-700 text-white py-3 px-4 hover:bg-blue-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                        Sending...
                                    </>
                                ) : (
                                    'Send Reset Link'
                                )}
                            </button>
                        </form>
                    ) : (
                        <div className="text-center space-y-4">
                            <div className="bg-green-50 border border-green-200 p-4">
                                <p className="text-green-800 text-sm">
                                    We've sent a password reset link to <strong>{email}</strong>
                                </p>
                                <p className="text-green-700 text-xs mt-2">
                                    The link will expire in 1 hour
                                </p>
                            </div>
                            <button
                                onClick={() => {
                                    setSent(false);
                                    setEmail('');
                                }}
                                className="text-blue-700 hover:text-blue-800 text-sm font-medium"
                            >
                                Send to a different email
                            </button>
                        </div>
                    )}

                    {/* Back to Login */}
                    <div className="mt-6 text-center">
                        <Link
                            to="/login"
                            className="inline-flex items-center gap-2 text-blue-700 hover:text-blue-800 text-sm font-medium"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Back to Login
                        </Link>
                    </div>
                </div>

                {/* Help Text */}
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>
                        Didn't receive the email? Check your spam folder or{' '}
                        <button
                            onClick={() => setSent(false)}
                            className="text-blue-700 hover:text-blue-800 font-medium"
                        >
                            try again
                        </button>
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ForgotPassword;
