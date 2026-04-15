import { Icon } from "@iconify/react/dist/iconify.js";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { loginFunction } from "../features/auth/authService";

const SignInLayer = () => {

  const [phone,setPhone] = useState("")
  const [password,setPassword] = useState("")

  const [errors,setErrors] = useState({})

  const[showPassword,setShowPassword] = useState(false)

  const toggleVisibility = () => {
    setShowPassword(!showPassword)
  }

  const validate = () => {
    let newErrors = {}
    if (!password) {
        newErrors.password = "Password is required";
    } else if (password.length < 6) {
        newErrors.password = "Password must be at least 6 characters";
    }
    if (!phone.trim()) {
        newErrors.phone = "Phone number is required";
    } else if (phone.length < 10) {
        newErrors.phone = "Phone number must be 10 digits";
    }
    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  }

  const navigate = useNavigate()

  const dispatch = useDispatch()

  const handleLogin = async(e) => {
    e.preventDefault()
    if(!validate()) return;
    try{
      loginFunction(dispatch,navigate,{phone,password})
    }
    catch(err){
      console.log("Error Loging in",err.message);
    }
  }

  const ErrorMsg = ({field}) => {
    return errors[field] ? (
      <div className="text-danger mt-4 fw-medium" style={{fontSize : "11px"}}>
        {errors[field]}
      </div>
    ): null
  }

  const handlePhoneChange = (e) => {
    const value = e.target.value;

    if(/^\d*$/.test(value) && value.length<=10){
      setPhone(value)
    }

  }

  return (
    <section className='auth bg-base d-flex align-items-center justify-content-center flex-wrap'>
      <div className='py-32 px-24 d-flex flex-column justify-content-center'>
        <div className='max-w-464-px mx-auto w-100'>
          <div className="d-flex flex-column align-items-center justify-content-around">
            <Link to='/' className='mb-40 max-w-290-px'>
              <img src='assets/images/logo.png' alt='' />
            </Link>
            <h4 className='mb-12'>Sign In to your Account</h4>
            <p className='mb-32 text-secondary-light text-lg text-center'>
              Welcome back! please enter your detail
            </p>
          </div>
          <form onSubmit={(e) => handleLogin(e)}>
            <div className='icon-field mb-16'>
              <span className='icon top-50 translate-middle-y'>
                <Icon icon='mage:phone' />
              </span>
              <input
                type='tel'
                value={phone}
                onChange={(e) => handlePhoneChange(e)}
                className='form-control h-56-px bg-neutral-50 radius-12'
                placeholder='Phone'
              />
              <ErrorMsg field={"phone"}/>
            </div>
            <div className='position-relative mb-20'>
              <div className='icon-field'>
                <span className='icon top-50 translate-middle-y'>
                  <Icon icon='solar:lock-password-outline' />
                </span>
                

                <input
                
                  type={showPassword ? 'text': 'password'}
                  value={password}
                
                  onChange={(e) => setPassword(e.target.value)}
                  className='form-control h-56-px bg-neutral-50 radius-12'
                  id='your-password'
                  placeholder='Password'
                />
              </div>
              <span
                // 3. Toggle state on click and switch icons
                onClick={toggleVisibility}
                className={`toggle-password cursor-pointer position-absolute end-0 top-50 translate-middle-y me-16 text-secondary-light ${
                    showPassword ? 'ri-eye-off-line' : 'ri-eye-line'
                }`}
            />
            <ErrorMsg field={"password"}/>
            </div>
            {/* <div className=''>
              <div className='d-flex justify-content-between gap-2'>
                <div className='form-check style-check d-flex align-items-center'>
                  <input
                    className='form-check-input border border-neutral-300'
                    type='checkbox'
                    defaultValue=''
                    id='remeber'
                  />
                  <label className='form-check-label' htmlFor='remeber'>
                    Remember me{" "}
                  </label>
                </div>
                <Link to='/forgot-password' className='text-primary-600 fw-medium'>
                  Forgot Password?
                </Link>
              </div>
            </div> */}
            <button
              type='submit'
              className='btn btn-primary text-sm btn-sm px-12 py-16 w-100 radius-12 mt-32'
            >
              {" "}
              Sign In
            </button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default SignInLayer;
