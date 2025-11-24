import React, { useState, useEffect } from "react";
import { Icon } from "../components/icons";
import IllustrationFrame from "../components/login/IllustrationFrame";
import Logo from "../components/branding/Logo";
import { Button, Field } from "../components/ui";
import apiConfig from "../config/apiConfig";

const baseUrl = apiConfig.baseUrl;

const LoginPage = ({ onLogin }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  const valid = /.+@.+\..+/.test(email) && password.length >= 6;
  const error = touched && !valid ? "Enter a valid email and 6+ char password" : "";

  // Check for existing JWT token on page load
  useEffect(() => {
    checkExistingSession();
  }, []);

  const checkExistingSession = async () => {
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
      try {
        const response = await fetch(`${baseUrl}/api/auth/me`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`
          }
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            // Token is valid, restore user data
            localStorage.setItem('user_data', JSON.stringify(result.user));
            localStorage.setItem('userEmail', result.user.email);
            onLogin();
            return;
          }
        }

        // Clear invalid token
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('userEmail');
      } catch (err) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('userEmail');
      }
    }
  };

  const handleLogin = async (event) => {
    event.preventDefault();
    setTouched(true);

    if (!valid) return;

    setLoading(true);
    setLoginError("");

    try {
      const formData = new FormData();
      formData.append("email", email.trim());
      formData.append("password", password.trim());

      const response = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store JWT token and user data
        localStorage.setItem('access_token', result.access_token);
        localStorage.setItem('user_data', JSON.stringify(result.user));
        localStorage.setItem('userEmail', result.user.email);
        localStorage.setItem('userRole', result.user.role);

        // Call the onLogin callback
        onLogin();
      } else {
        setLoginError(result.detail || result.error || 'Invalid credentials');
      }
    } catch (err) {
      setLoginError('Server connection failed. Please check if the backend is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col text-black">
      <header className="glass flex h-16 items-center justify-between border-b border-black/12 bg-white px-6">
        <Logo />
        <Button variant="secondary" aria-label="Get login help">
          Need help?
        </Button>
      </header>
      <main className="section-pad mx-auto grid w-full max-w-6xl grid-cols-1 gap-10 px-6 md:grid-cols-2 md:items-center">
        <div className="space-y-6">
          <h1 className="text-4xl font-black tracking-tight">Login to Massist Admin Panel</h1>
          <p className="max-w-xl">Monitor shelf data, manage SKUs, and make informed decisions.</p>

          <form className="mt-8 space-y-5" onSubmit={handleLogin}>
            <Field label="Email Address" error={error}>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                onBlur={() => setTouched(true)}
                className="w-full rounded-full border border-black/15 bg-white px-5 py-3 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                required
                disabled={loading}
                aria-invalid={Boolean(error)}
              />
            </Field>

            <Field label="Password" hint="Minimum 6 characters">
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  onBlur={() => setTouched(true)}
                  className="w-full rounded-full border border-black/15 bg-white px-5 py-3 pr-12 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-black"
                  required
                  disabled={loading}
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((current) => !current)}
                  className="absolute inset-y-0 right-3 inline-flex items-center rounded-full bg-black/5 p-2 transition hover:bg-black/10 focus:outline-none focus-visible:outline focus-visible:outline-2 focus-visible:outline-black"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  disabled={loading}
                >
                  <Icon.eye className="h-5 w-5" />
                </button>
              </div>
              <a href="#" className="mt-2 inline-block text-sm font-medium">
                Forgot password?
              </a>
            </Field>

            {loginError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {loginError}
              </div>
            )}

            <Button type="submit" className="w-full justify-center" disabled={!valid || loading}>
              {loading ? "Signing in..." : "Continue"}
            </Button>
          </form>
        </div>
        <div className="hidden justify-center md:flex">
          <IllustrationFrame />
        </div>
      </main>
    </div>
  );
};

export default LoginPage;
