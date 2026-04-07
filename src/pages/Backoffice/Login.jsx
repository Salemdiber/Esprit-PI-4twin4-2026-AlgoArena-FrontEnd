import React, { useState, useRef } from 'react';
import ReCAPTCHA from 'react-google-recaptcha';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../Frontoffice/auth/context/AuthContext';
import Logo from '../../assets/logo_algoarena.png';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [recaptchaToken, setRecaptchaToken] = useState(null);
    const [errorMsg, setErrorMsg] = useState('');
    const recaptchaRef = useRef(null);
    const navigate = useNavigate();
    const location = useLocation();
    const { login } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg('');
        if (!recaptchaToken) {
            setErrorMsg('Please complete reCAPTCHA to sign in.');
            return;
        }
        setIsLoading(true);

        try {
            // Re-route the 'email' input as the 'username' field for the NestJS native requirement 
            await login(email, password, recaptchaToken);
            localStorage.setItem('isAuthenticated', 'true');
            const from = location.state?.from?.pathname || '/admin';
            navigate(from, { replace: true });
        } catch (error) {
            console.error("Backoffice real login failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center login-bg-pattern relative overflow-hidden">
            {/* Floating Particles */}
            <div className="particle" style={{ top: '10%', left: '15%', animationDelay: '0s' }} />
            <div className="particle" style={{ top: '60%', left: '80%', animationDelay: '2s' }} />
            <div className="particle" style={{ top: '30%', left: '70%', animationDelay: '4s' }} />
            <div className="particle" style={{ top: '80%', left: '20%', animationDelay: '6s' }} />
            <div className="particle" style={{ top: '50%', left: '40%', animationDelay: '3s' }} />

            {/* Decorative Shapes */}
            <div className="absolute top-20 left-20 w-32 h-32 border-2 border-cyan-400/20 rounded-2xl rotate-45 animate-float" />
            <div className="absolute bottom-20 right-20 w-40 h-40 border-2 border-cyan-400/10 rounded-full animate-rotate-slow" />
            <div className="absolute top-1/2 right-1/4 w-24 h-24 border-2 border-cyan-400/15 rounded-lg animate-float" style={{ animationDelay: '2s' }} />

            {/* Main Content */}
            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo Section */}
                <div className="text-center mb-8 animate-fade-in-up">
                    <div className="flex justify-center mb-4">
                        <img src={Logo} alt="AlgoArena" className="h-12 w-auto drop-shadow-[0_0_15px_rgba(34,211,238,0.5)]" />
                    </div>
                    <p style={{ color: 'var(--color-text-muted)' }} className="">Admin Dashboard</p>
                </div>

                {/* Login Card */}
                <div className="glass-panel rounded-2xl p-8 shadow-custom-hover animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                    <h2 style={{ color: 'var(--color-text-heading)' }} className="font-heading text-2xl font-bold  mb-6">Welcome Back</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Email Address</label>
                            <div className="relative">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="admin@algoarena.com"
                                    required
                                    className="form-input w-full pl-12"
                                />
                                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label style={{ color: 'var(--color-text-secondary)' }} className="block text-sm font-medium  mb-2">Password</label>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    required
                                    className="form-input w-full pl-12 pr-12"
                                />
                                <svg className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    style={{ color: 'var(--color-text-secondary)' }} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover: transition-colors focus:outline-none"
                                >
                                    {showPassword ? (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                                        </svg>
                                    ) : (
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between">
                            <label className="flex items-center gap-2 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        checked={rememberMe}
                                        onChange={(e) => setRememberMe(e.target.checked)}
                                        className="checkbox-custom"
                                    />
                                    <div className={`w-5 h-5 rounded border-2 transition-all duration-200 flex items-center justify-center ${rememberMe
                                        ? 'bg-gradient-to-br from-cyan-400 to-cyan-600 border-cyan-400'
                                        : 'border-(--color-border) bg-(--color-bg-input) group-hover:border-cyan-400/50'
                                        }`}>
                                        {rememberMe && (
                                            <svg style={{ color: 'var(--color-text-heading)' }} className="w-3 h-3 " fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                                            </svg>
                                        )}
                                    </div>
                                </div>
                                <span style={{ color: 'var(--color-text-muted)' }} style={{ color: 'var(--color-text-secondary)' }} className="text-sm  group-hover: transition-colors">Remember me</span>
                            </label>
                            <a href="#" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">Forgot password?</a>
                        </div>

                        {/* reCAPTCHA Widget */}
                        <div className="flex flex-col items-center my-4">
                            <ReCAPTCHA
                                ref={recaptchaRef}
                                sitekey="6LdKIHMsAAAAACo6AkNg2KChjBhGcVCj2Rwj-rey"
                                onChange={(token) => { setRecaptchaToken(token); setErrorMsg(''); }}
                                theme="dark"
                            />
                            {errorMsg && <span className="text-xs text-red-500 mt-2">{errorMsg}</span>}
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="btn-primary w-full py-3 relative overflow-hidden"
                        >
                            {isLoading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    Signing in...
                                </span>
                            ) : (
                                'Sign In'
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-6">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t " />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span style={{ color: 'var(--color-text-muted)' }} className="px-4 bg-(--color-bg-secondary) ">Or continue with</span>
                        </div>
                    </div>

                    {/* Social Buttons */}
                    <div className="grid grid-cols-2 gap-4">
                        <button className="btn-secondary py-3 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z" />
                            </svg>
                            <span className="text-sm font-medium">Google</span>
                        </button>
                        <button className="btn-secondary py-3 flex items-center justify-center gap-2">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                            </svg>
                            <span className="text-sm font-medium">GitHub</span>
                        </button>
                    </div>
                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t  text-center">
                        <p className="text-sm text-gray-500">
                            Secure admin access powered by <span className="text-cyan-400 font-medium">AlgoArena</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
