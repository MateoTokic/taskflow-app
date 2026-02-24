import { useState } from 'react';
import { Link } from "react-router-dom";
import { api } from "../api/axios";
import axios from 'axios';
import "./Login.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await api.post("/auth/login", {
                email,
                password,
            });

            const token = response.data.token;
            localStorage.setItem("token", token);
            window.location.href = "/dashboard";
            alert("Login successful!");
        } catch(err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || "Registration failed");
            } else {
                setError("An unexpected error occured");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
            <h2 className="auth-title">TaskFlow</h2>
            <p className="auth-subtitle">Sign in to your account</p>

            <form className="auth-form" onSubmit={handleSubmit}>
                <label className="auth-label" htmlFor="email">Email</label>
                <input
                    id="email"
                    className="auth-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <label className="auth-label" htmlFor="password">Password</label>
                <input
                    id="password"
                    className="auth-input"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                {error && <div className="auth-error">{error}</div>}

                <button className="auth-btn" type="submit" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
                </button>
            </form>

            <div className="auth-footer">
                Don’t have an account?{" "}
                <Link className="auth-link" to="/register">
                    Create one
                </Link>
            </div>
            </div>
        </div>
    );
};

export default Login;