import { useState } from "react";
import { supabase } from "../lib/supabase";

function Login({ onLogin }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleLogin = async (e) => {
        e.preventDefault();

        setError("");

        if (!email.trim() || !password) {
            setError("Please enter your email and password.");
            return;
        }

        setLoading(true);

        try {
            // Step 1: Authenticate with Supabase
            const { data, error: loginError } =
                await supabase.auth.signInWithPassword({
                    email: email.trim(),
                    password,
                });

            if (loginError) {
                throw new Error("Invalid email or password.");
            }

            if (!data.user) {
                throw new Error("Unable to authenticate your account.");
            }

            // Step 2: Verify MCC admin authorization
            const { data: isAdmin, error: adminError } =
                await supabase.rpc("is_mcc_admin");

            if (adminError) {
                await supabase.auth.signOut();
                throw new Error(
                    "Unable to verify MCC administrator access."
                );
            }

            if (!isAdmin) {
                await supabase.auth.signOut();
                throw new Error(
                    "You are not authorized to access the MCC Admin Portal."
                );
            }

            // Step 3: Login successful
            onLogin(data.user);

        } catch (err) {
            setError(
                err.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="login-page">

            <div className="login-glow glow-one"></div>
            <div className="login-glow glow-two"></div>

            <section className="login-card">

                <div className="login-brand">

                    <div className="logo-wrapper">
                        <img
                            src="/mcc-logo.jpg"
                            alt="Microsoft Campus Club"
                        />
                    </div>

                    <div>
                        <h1>MCC</h1>
                        <p>MICROSOFT CAMPUS CLUB</p>
                    </div>

                </div>

                <div className="login-heading">
                    <span className="login-label">
                        ADMIN PORTAL
                    </span>

                    <h2>Welcome back.</h2>

                    <p>
                        Sign in to manage the people and moments
                        behind MCC.
                    </p>
                </div>

                <form onSubmit={handleLogin}>

                    <div className="input-group">
                        <label htmlFor="email">
                            ADMIN EMAIL
                        </label>

                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) =>
                                setEmail(e.target.value)
                            }
                            autoComplete="email"
                            disabled={loading}
                        />
                    </div>

                    <div className="input-group">
                        <label htmlFor="password">
                            PASSWORD
                        </label>

                        <div className="password-wrapper">

                            <input
                                id="password"
                                type={
                                    showPassword
                                        ? "text"
                                        : "password"
                                }
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                autoComplete="current-password"
                                disabled={loading}
                            />

                            <button
                                type="button"
                                className="password-toggle"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                                disabled={loading}
                            >
                                {showPassword ? "HIDE" : "SHOW"}
                            </button>

                        </div>
                    </div>

                    {error && (
                        <div className="login-error">
                            <span>!</span>
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-button"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner"></span>
                                AUTHENTICATING...
                            </>
                        ) : (
                            <>
                                SIGN IN
                                <span className="button-arrow">
                                    →
                                </span>
                            </>
                        )}
                    </button>

                </form>

                <div className="login-footer">
                    <span>MICROSOFT CAMPUS CLUB</span>
                    <span>SECURE ADMIN ACCESS</span>
                </div>

            </section>

        </main>
    );
}

export default Login;