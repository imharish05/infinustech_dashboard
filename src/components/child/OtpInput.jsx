import React, { useState, useRef } from 'react';

const OtpInput = () => {
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const inputRefs = useRef([]);

  const handleChange = (element, index) => {
    // Only allow numbers
    if (!/^[0-9]$/.test(element.value) && element.value !== "") return;

    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);

    // Auto-focus next
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  return (
    <div className="d-flex flex-column align-items-center gap-3 mt-3">
      <div className="d-flex gap-2">
        {otp.map((data, index) => (
          <input
            key={index}
            type="text"
            maxLength="1"
            ref={(el) => (inputRefs.current[index] = el)}
            value={data}
            onChange={(e) => handleChange(e.target, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className="form-control text-center fw-bold"
            style={{
              width: '40px',
              height: '50px',
              fontSize: '18px',
              borderRadius: '8px',
              border: '2px solid #e5e7eb',
              padding: '0', 
              lineHeight: '50px', // Matches height to center text vertically
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#fff',
              color: '#000' // Ensure text isn't white-on-white
            }}
          />
        ))}
      </div>
      <button 
        className="btn btn-primary-600 px-32 py-12 radius-8 mt-4"
        onClick={() => console.log(otp.join(""))}
      >
        Verify OTP
      </button>
    </div>
  );
};

export default OtpInput;