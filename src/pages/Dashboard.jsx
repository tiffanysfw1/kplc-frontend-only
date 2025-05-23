import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "chart.js/auto";
import "./Dashboard.css";

// ✅ Define your API base URL here
const apiUrl = "http://localhost:3000";


const Dashboard = () => {
  const [consumptionData, setConsumptionData] = useState([]);
  const [billingData, setBillingData] = useState([]);
  const [paymentData, setPaymentData] = useState([]);

  useEffect(() => {
    fetchCustomerData();
  }, []);

  const fetchCustomerData = async () => {
    try {
      const response = await axios.get(`${apiUrl}/api/dashboard-data`);
      setConsumptionData(response.data.consumption || []);
      setBillingData(response.data.billing || []);
      setPaymentData(response.data.payments || []);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const consumptionChart = {
    labels: consumptionData?.map((data) => data.date) || [],
    datasets: [
      {
        label: "Electricity Consumption (kWh)",
        data: consumptionData?.map((data) => data.usage) || [],
        backgroundColor: "rgba(54, 162, 235, 0.7)",
      },
    ],
  };

  const billingChart = {
    labels: billingData?.map((data) => data.date) || [],
    datasets: [
      {
        label: "Billing Amount (Ksh)",
        data: billingData?.map((data) => data.amount) || [],
        backgroundColor: "rgba(255, 99, 132, 0.7)",
      },
    ],
  };

  const paymentChart = {
    labels: paymentData?.map((data) => data.date) || [],
    datasets: [
      {
        label: "Payments Made (Ksh)",
        data: paymentData?.map((data) =>
          data.status === "purchased" ? data.amount : 0
        ) || [],
        backgroundColor: "rgba(75, 192, 192, 0.7)",
      },
      {
        label: "Pending Payments (Ksh)",
        data: paymentData?.map((data) =>
          data.status === "pending" ? data.amount : 0
        ) || [],
        backgroundColor: "rgba(255, 159, 64, 0.7)",
      },
    ],
  };

  const cumulativePaymentChart = {
    labels: paymentData?.map((data) => data.date) || [],
    datasets: [
      {
        label: "Cumulative Payments (Ksh)",
        data:
          paymentData?.reduce((acc, data, index) => {
            const previous = index === 0 ? 0 : acc[index - 1];
            return [
              ...acc,
              previous + (data.status === "purchased" ? data.amount : 0),
            ];
          }, []) || [],
        backgroundColor: "rgba(153, 102, 255, 0.7)",
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="dashboard-main">
          <div className="dasboard-container">
            <h1>Customer Analytics Dashboard</h1>
            <p>Track your electricity consumption, billing, and payments.</p>
          </div>

          <div className="charts-container">
            <div className="chart">
              <h3>Electricity Consumption</h3>
              <Bar data={consumptionChart} />
            </div>

            <div className="chart">
              <h3>Billing History</h3>
              <Line data={billingChart} />
            </div>

            <div className="chart">
              <h3>Payment History</h3>
              <Bar data={paymentChart} />
            </div>

            <div className="chart">
              <h3>Cumulative Payment Progress</h3>
              <Line data={cumulativePaymentChart} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
