
import axios from "axios";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

const Register = () => {
  const navigate = useNavigate();

  // Store all registration form values.
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  // Manage loading and error states.
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Update the form state whenever the user types.
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Validate the form and register the user.
  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    // Check whether both passwords match.
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      await axios.post(
        "http://localhost:3000/api/auth/register",
        {
          email: formData.email,
          fullName: {
            firstName: formData.firstName,
            lastName: formData.lastName,
          },
          password: formData.password,
        },
        {
          withCredentials: true,
        }
      );

      // Redirect to login after successful registration.
      navigate("/login");
    } catch (err) {
      // Display the error message returned by the backend.
      setError(
        err.response?.data?.message ||
          "Unable to create your account. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#212121] px-4 py-10 text-white">

      {/* Registration card */}
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#2b2b2b] p-6 shadow-xl sm:p-8">

        {/* Application branding */}
        <div className="mb-7 text-center">
          <div className="mx-auto mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-white text-xl font-bold text-[#212121]">
            AI
          </div>

          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Create your account
          </h1>

          <p className="mt-2 text-sm text-gray-400">
            Get started and enjoy your AI conversations.
          </p>
        </div>

        {/* Registration form */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* First name and last name */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

            {/* First name */}
            <div>
              <label
                htmlFor="firstName"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                First name
              </label>

              <input
                id="firstName"
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="First name"
                autoComplete="given-name"
                required
                className="w-full rounded-xl border border-white/10 bg-[#353535] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/40 focus:ring-2 focus:ring-white/5"
              />
            </div>

            {/* Last name */}
            <div>
              <label
                htmlFor="lastName"
                className="mb-2 block text-sm font-medium text-gray-200"
              >
                Last name
              </label>

              <input
                id="lastName"
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Last name"
                autoComplete="family-name"
                required
                className="w-full rounded-xl border border-white/10 bg-[#353535] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/40 focus:ring-2 focus:ring-white/5"
              />
            </div>
          </div>

          {/* Email field */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Email address
            </label>

            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              autoComplete="email"
              required
              className="w-full rounded-xl border border-white/10 bg-[#353535] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/40 focus:ring-2 focus:ring-white/5"
            />
          </div>

          {/* Password field */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Create a password"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-white/10 bg-[#353535] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/40 focus:ring-2 focus:ring-white/5"
            />
          </div>

          {/* Confirm password field */}
          <div>
            <label
              htmlFor="confirmPassword"
              className="mb-2 block text-sm font-medium text-gray-200"
            >
              Confirm password
            </label>

            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your password"
              autoComplete="new-password"
              minLength={8}
              required
              className="w-full rounded-xl border border-white/10 bg-[#353535] px-4 py-3 text-sm text-white outline-none transition placeholder:text-gray-500 focus:border-white/40 focus:ring-2 focus:ring-white/5"
            />
          </div>

          {/* Display registration errors */}
          {error && (
            <p
              role="alert"
              className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400"
            >
              {error}
            </p>
          )}

          {/* Submit button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-white py-3 text-sm font-semibold text-[#212121] transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create account"}
          </button>
        </form>

        {/* Link to login page */}
        <p className="mt-6 text-center text-sm text-gray-400">
          Already have an account?{" "}
          <Link
            to="/login"
            className="font-medium text-white underline-offset-4 transition hover:underline"
          >
            Sign in
          </Link>
        </p>

      </div>
    </div>
  );
};

export default Register;
