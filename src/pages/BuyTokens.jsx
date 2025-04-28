import React, { useState, useEffect } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./BuyTokens.css";

const BuyTokens = () => {
  const [meterNumber, setMeterNumber] = useState("");
  const [amount, setAmount] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("mpesa");
  const [selectedBank, setSelectedBank] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedCounty, setSelectedCounty] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState("");
  const [isBankPaid, setIsBankPaid] = useState(false);

  const banks = [/* your banks array */];
  const counties = [/* your counties array */];

  useEffect(() => {
    const interval = setInterval(() => {
      setMessage("Form updated at: " + new Date().toLocaleTimeString());
    }, 600000);
    return () => clearInterval(interval);
  }, [paymentMethod]);

  const generateFormattedToken = () => {
    const rawToken = Array.from({ length: 20 }, () => Math.floor(Math.random() * 10)).join('');
    return rawToken.match(/.{1,4}/g).join('-');
  };

  const pollPaymentStatus = async (meterNumber) => {
    let attempts = 0;
    const maxAttempts = 12; // poll for 1 minute (every 5 seconds)

    while (attempts < maxAttempts) {
      try {
        const response = await axios.get(`http://localhost:5000/mpesa/payment-status?meterNumber=${meterNumber}`);
        const data = response.data;

        if (data.success) {
          const formattedToken = generateFormattedToken();
          setToken(`🔋 Token: ${formattedToken}`);
          setMessage("✅ Payment successful and token generated.");
          setIsLoading(false);
          return;
        } else if (data.failed) {
          setMessage("⚠️ Payment failed. Try again.");
          setIsLoading(false);
          return;
        }
      } catch (error) {
        console.error("Polling error:", error);
        setMessage("⚠️ Error checking payment status.");
        setIsLoading(false);
        return;
      }

      await new Promise((resolve) => setTimeout(resolve, 5000)); // wait 5 seconds
      attempts++;
    }

    setMessage("⚠️ Payment timeout. Try again.");
    setIsLoading(false);
  };

  const handlePurchase = async (e) => {
    e.preventDefault();
    setMessage("");
    setToken("");
    setIsLoading(true);

    if (!meterNumber || meterNumber.length !== 11) {
      setMessage("⚠️ Meter number must be exactly 11 digits.");
      setIsLoading(false);
      return;
    }
    if (!amount) {
      setMessage("⚠️ Amount is required.");
      setIsLoading(false);
      return;
    }

    if (paymentMethod === "mpesa" && !phoneNumber) {
      setMessage("⚠️ Enter a valid 10-digit phone number.");
      setIsLoading(false);
      return;
    }

    if (paymentMethod === "bank" && (!accountNumber || !selectedCounty || !selectedBank)) {
      setMessage("⚠️ Complete all bank details.");
      setIsLoading(false);
      return;
    }

    if (paymentMethod === "mpesa") {
      try {
        const response = await axios.post("http://localhost:5000/mpesa/stk-push", {
          phoneNumber,
          amount,
          meterNumber,
        });

        if (response.data.pending) {
          setMessage("📲 Awaiting payment confirmation...");
          pollPaymentStatus(meterNumber);
        } else {
          setMessage("📲 Awaiting payment confirmation...");
          setIsLoading(false);
        }
      } catch (error) {
        console.error(error);
        setMessage("⚠️ Error initiating payment.");
        setIsLoading(false);
      }
      return;
    }

    if (paymentMethod === "paypal") {
      const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_xclick&business=tiffanyjemosop@gmail.com&amount=${amount}&currency_code=USD&item_name=Electricity+Tokens`;
      window.location.href = paypalUrl;
      return;
    }

    if (paymentMethod === "bank") {
      try {
        const response = await axios.post("http://localhost:5000/buy-tokens", {
          meterNumber,
          amount,
          phoneNumber,
          paymentMethod,
          selectedBank,
          accountNumber,
          selectedCounty,
        });
        setMessage(response.data.message || "✅ Payment instructions sent.");
      } catch (error) {
        setMessage(error.response?.data?.error || "⚠️ Error processing payment.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleBankPaymentConfirmation = () => {
    setIsBankPaid(true);
    setTimeout(() => {
      const formattedToken = generateFormattedToken();
      setToken(`🔋 Token: ${formattedToken}`);
    }, 2000);
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="buy-tokens">
          <h2>Buy Electricity Tokens</h2>
          <form onSubmit={handlePurchase}>
            <label>Meter Number:</label>
            <input
              type="text"
              value={meterNumber}
              onChange={(e) => setMeterNumber(e.target.value)}
              maxLength="11"
              placeholder="Enter 11-digit meter number"
              required
            />

            <label>Amount (Ksh):</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
            />

            <label>Payment Method:</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)} required>
              <option value="mpesa">📲 M-PESA</option>
              <option value="paypal">💳 PayPal</option>
              <option value="bank">🏦 Bank Transfer</option>
            </select>

            {paymentMethod === "mpesa" && (
              <>
                <label>Phone Number:</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  maxLength="10"
                  placeholder="Enter 10-digit Safaricom number"
                  required
                />
              </>
            )}

            {paymentMethod === "bank" && (
              <>
                <label>Bank:</label>
                <select value={selectedBank} onChange={(e) => setSelectedBank(e.target.value)} required>
                  <option value="">-- Select Bank --</option>
                  {banks.map((bank) => (
                    <option key={bank} value={bank}>{bank}</option>
                  ))}
                </select>

                <label>Account Number:</label>
                <input
                  type="text"
                  value={accountNumber}
                  onChange={(e) => setAccountNumber(e.target.value)}
                  placeholder="Enter your bank account number"
                  required
                />

                <label>County (Branch):</label>
                <select value={selectedCounty} onChange={(e) => setSelectedCounty(e.target.value)} required>
                  <option value="">-- Select County --</option>
                  {counties.map((county) => (
                    <option key={county} value={county}>{county}</option>
                  ))}
                </select>

                <div className="bank-details">
                  <p><strong>Use your meter number as reference.</strong></p>
                  <small>After payment, click confirm:</small>
                  <button type="button" onClick={handleBankPaymentConfirmation} disabled={isBankPaid}>
                    {isBankPaid ? "Payment Confirmed ✅" : "Confirm Bank Payment"}
                  </button>
                </div>
              </>
            )}

            {paymentMethod !== "bank" && (
              <button type="submit" disabled={isLoading}>
                {isLoading ? "Processing..." : `Proceed with ${paymentMethod.toUpperCase()}`}
              </button>
            )}
          </form>

          {message && <p className={message.includes("✅") ? "success" : "error"}>{message}</p>}
          {token && <h3 className="success">{token}</h3>}
        </div>
      </div>
    </div>
  );
};

export default BuyTokens;
