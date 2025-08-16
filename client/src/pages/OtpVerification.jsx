import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const OtpVerification = () => {
  const { setupRecaptcha } = useAuth();
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmation, setConfirmation] = useState(null);

  const sendOtp = async () => {
    try {
      const confirmationResult = await setupRecaptcha(phone);
      setConfirmation(confirmationResult);
      toast.success('OTP sent to phone');
    } catch (err) {
      toast.error(err.message);
    }
  };

  const verifyOtp = async () => {
    try {
      await confirmation.confirm(otp);
      toast.success('Phone verified successfully');
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="card w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">Phone OTP Verification</h2>
        <input
          type="tel"
          className="input-field mb-4"
          placeholder="+1 555 123 4567"
          value={phone}
          onChange={e => setPhone(e.target.value)}
        />
        <button onClick={sendOtp} className="btn-primary w-full mb-4">Send OTP</button>
        {confirmation && (
          <>
            <input
              type="text"
              className="input-field mb-4"
              placeholder="Enter OTP"
              value={otp}
              onChange={e => setOtp(e.target.value)}
            />
            <button onClick={verifyOtp} className="btn-primary w-full">Verify OTP</button>
          </>
        )}
        <div id="recaptcha-container"></div>
      </div>
    </div>
  );
};

export default OtpVerification;
