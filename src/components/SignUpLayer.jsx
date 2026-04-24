import { Icon } from "@iconify/react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { signupFunction } from "../features/auth/authService";

const SignUpLayer = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading } = useSelector((state) => state.auth);

  const toggleVisibility = () => setShowPassword(!showPassword);

  const validate = () => {
    let newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Full Name is required";
    if (!formData.email.trim()) {
        newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
    }
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    } else if (formData.phone.length < 10) {
      newErrors.phone = "Phone number must be 10 digits";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 6) {
      newErrors.password = "Minimum 6 characters required";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      if (/^\d*$/.test(value) && value.length <= 10) {
        setFormData({ ...formData, [name]: value });
      }
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    // Using the signupFunction we created earlier
    signupFunction(dispatch, navigate, { ...formData, role: 'staff' });
  };

  const ErrorMsg = ({ field }) => {
    return errors[field] ? (
      <div className="text-danger mt-1 fw-medium" style={{ fontSize: "11px" }}>
        {errors[field]}
      </div>
    ) : null;
  };

  return (
    <section className="auth bg-base d-flex align-items-center justify-content-center flex-wrap">
      <div className="py-32 px-24 d-flex flex-column justify-content-center">
        <div className="max-w-464-px mx-auto w-100">
          <div className="d-flex flex-column align-items-center justify-content-around">
            <Link to="/" className="mb-40 max-w-290-px">
              <img src="/assets/images/logo.png" alt="Logo" />
            </Link>
            <h4 className="mb-12">Create your Account</h4>
            <p className="mb-32 text-secondary-light text-lg text-center">
              Join the platform! please enter your details
            </p>
          </div>

          <form onSubmit={handleSignUp}>
            {/* Full Name */}
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="solar:user-linear" />
              </span>
              <input
                name="name"
                type="text"
                value={formData.name}
                onChange={handleInputChange}
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Full Name"
              />
              <ErrorMsg field="name" />
            </div>

            {/* Email */}
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:email" />
              </span>
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Email Address"
              />
              <ErrorMsg field="email" />
            </div>

            {/* Phone */}
            <div className="icon-field mb-16">
              <span className="icon top-50 translate-middle-y">
                <Icon icon="mage:phone" />
              </span>
              <input
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleInputChange}
                className="form-control h-56-px bg-neutral-50 radius-12"
                placeholder="Phone Number"
              />
              <ErrorMsg field="phone" />
            </div>

            {/* Password */}
            <div className="position-relative mb-20">
              <div className="icon-field">
                <span className="icon top-50 translate-middle-y">
                  <Icon icon="solar:lock-password-outline" />
                </span>
                <input
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleInputChange}
                  className="form-control h-56-px bg-neutral-50 radius-12"
                  placeholder="Password"
                />
              </div>
              <span
                onClick={toggleVisibility}
                className={`toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light ${
                  showPassword ? "ri-eye-off-line" : "ri-eye-line"
                }`}
              />
              <ErrorMsg field="password" />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32"
            >
              {loading ? "Processing..." : "Sign Up"}
            </button>
            
            <div className="mt-32 text-center">
              <p className="text-sm text-secondary-light">
                Already have an account?{" "}
                <Link to="/signin" className="text-primary-600 fw-semibold">
                  Sign In
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignUpLayer;