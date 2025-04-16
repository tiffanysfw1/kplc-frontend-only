import React, { useState, useEffect } from "react";
import axios from "axios";
import { Table } from "react-bootstrap"; // Bootstrap Table
import { Pie } from "react-chartjs-2"; // Chart.js Pie Chart
import "chart.js/auto";
import Navbar from "../components/Navbar";
import Sidebar from "../components/Sidebar";
import "./Billing.css"; // Billing page styles

const Billing = () => {
  const [billingData, setBillingData] = useState([]);

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    try {
      const response = await axios.get("http://localhost:5000/billing-data"); // Adjust API endpoint
      setBillingData(response.data);
    } catch (error) {
      console.error("Error fetching billing data:", error);
    }
  };

  // Count Paid & Unpaid Bills
  const paidBills = billingData.filter((bill) => bill.status === "Paid").length;
  const unpaidBills = billingData.filter((bill) => bill.status === "Unpaid").length;

  // Pie Chart Data
  const unpaidBillsChart = {
    labels: ["Paid Bills", "Unpaid Bills"],
    datasets: [
      {
        data: [paidBills, unpaidBills],
        backgroundColor: ["#2ecc71", "#e74c3c"], // Green for paid, red for unpaid
      },
    ],
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <Navbar />
        <div className="dashboard-main">
          <h1>Billing History</h1>
          <p>Check your past electricity bills and payments.</p>

          {/* Billing Table */}
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>Date</th>
                <th>Amount (Ksh)</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {billingData.map((bill, index) => (
                <tr key={index}>
                  <td>{bill.date}</td>
                  <td>{bill.amount}</td>
                  <td style={{ color: bill.status === "Paid" ? "green" : "red" }}>{bill.status}</td>
                </tr>
              ))}
            </tbody>
          </Table>

          {/* Pie Chart */}
          <div className="chart">
            <h3>Paid vs Unpaid Bills</h3>
            <Pie data={unpaidBillsChart} />
          </div>
        </div>
      </div>
    </div>
  );
};
export default Billing;
