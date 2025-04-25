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

  const banks = ["Equity Bank", "KCB Bank", "Cooperative Bank", "ABSA Bank", "Standard Chartered"];
  const counties = [
    "Nairobi", "Mombasa", "Kisumu", "Nakuru", "Kiambu", "Machakos", "Uasin Gishu", "Meru", "Kakamega", "Embu",
    "Nyeri", "Kisii", "Bungoma", "Narok", "Kericho", "Homa Bay", "Kitui", "Laikipia", "Kilifi",
    "Baringo", "Vihiga", "Siaya", "Mandera", "Marsabit", "Samburu", "Kwale", "Turkana", "Garissa", "Tana River",
    "Elgeyo Marakwet", "Trans Nzoia", "Wajir", "West Pokot", "Lamu", "Tharaka Nithi", "Taita Taveta", "Isiolo",
    "Nandi", "Bomet", "Busia", "Migori", "Kajiado", "Nyandarua", "Makueni", "Nyamira", "Taveta"
  ];

  useEffect(() => {
    // This function will be triggered every 10 minutes
    const interval = setInterval(() => {
      // Trigger the form update
      console.log("Updating form..."); // Replace with your actual logic to refresh the form.
      // You can set a state here that triggers the component to re-render or update.
      setMessage("Form updated at: " + new Date().toLocaleTimeString());
    }, 600000); // 600000ms = 10 minutes

    // Cleanup the interval when the component is unmounted or payment method is reset
    return () => clearInterval(interval);
  }, [paymentMethod]); // Depend on paymentMethod to start a new interval when it changes

  const handlePurchase = async (e) => {
    e.preventDefault();
    setMessage("");
    setToken("");
    setIsLoading(true);

    // Validation for M-PESA and Bank Payment
    if (!meterNumber || meterNumber.length !== 11) {
      setMessage("⚠️ Meter number must be exactly 11 digits.");
      setIsLoading(false);
      return;
    }

    if (!amount || parseInt(amount) < 10) {
      setMessage("⚠️ Minimum amount is Ksh 10.");
      setIsLoading(false);
      return;
    }

    if (paymentMethod === "mpesa" && (!phoneNumber || phoneNumber.length !== 10)) {
      setMessage("⚠️ Enter a valid 10-digit phone number.");
      setIsLoading(false);
      return;
    }

    if (paymentMethod === "bank" && (!accountNumber || !selectedCounty || !selectedBank)) {
      setMessage("⚠️ Complete all bank details.");
      setIsLoading(false);
      return;
    }

    // Simulate M-PESA Payment and Token Generation
    if (paymentMethod === "mpesa") {
      setTimeout(() => {
        setMessage("✅ payment confirmed. Token has been generated.");
        const generatedToken = `🔋 Token: ${Math.floor(100000000 + Math.random() * 900000000)}`;
        setToken(generatedToken);
        setIsLoading(false);
      }, 2000); // Simulate a 2-second delay
      return; // Exit to prevent further processing
    }

    // Proceed with PayPal or Bank transfer as usual
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
        setIsLoading(false);
      } catch (error) {
        setMessage(error.response?.data?.error || "⚠️ Error processing payment.");
        setIsLoading(false);
      }
    }
  };

  const handleBankPaymentConfirmation = () => {
    setIsBankPaid(true);
    setTimeout(() => {
      const generatedToken = `🔋 Token: ${Math.floor(100000000 + Math.random() * 900000000)}`;
      setToken(generatedToken);
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
              min="10"
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
                <div className="mpesa-instructions">
                  <p><strong>💡 Instructions:</strong></p>
                  <p>Go to M-PESA → Lipa na M-PESA → Buy Goods</p>
                  <p><strong>Till Number:</strong> <code>4874240</code></p>
                  <p><strong>Account:</strong> Your Meter Number</p>
                  <p><strong>Amount:</strong> Ksh {amount || "___"}</p>
                </div>
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
