import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Form } from 'react-bootstrap';
import { Line } from 'react-chartjs-2';
import axios from 'axios';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Separate Constants
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

const options = {
  responsive: true,
  plugins: {
    legend: {
      position: 'top',
    },
  },
};

const Sales = () => {
  const [intervalType, setIntervalType] = useState('day');
  const [salesData, setSalesData] = useState({
    labels: [],
    datasets: [
      {
        label: 'Sales',
        data: [],
        fill: false,
        borderColor: 'rgba(3, 98, 25, 1)',
      },
    ],
  });

  const fetchSalesData = async (type) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/transaction/getSales`, { model: type });
      const { data } = response; // Destructure data directly
      console.log(data);
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
      ];
      let labels = [];
        if (type === 'day') {
        labels = data.map((item) => `${monthNames[item.month - 1]}-${item.day}-${item.year}`);
        } else if (type === 'month') {
        labels = data.map((item) => `${monthNames[item.month - 1]}-${item.year}`);
        } else if (type === 'year') {
        labels = data.map((item) => `${item.year}`);
        }

      setSalesData({
        labels: labels,
        datasets: [
          {
            label: "Sales",
            data: data.map((item) => item.total),
            fill: false,
            borderColor: 'rgba(3, 98, 25, 1)',
          },
        ],
      });
    } catch (error) {
      console.error('Error fetching sales data:', error);
    }
  };

  useEffect(() => {
    fetchSalesData(intervalType);
  }, [intervalType]);

  const handleIntervalChange = (event) => {
    const selectedInterval = event.target.value;
    setIntervalType(selectedInterval);
  };

  return (
    <Container>
      <h2>Sales</h2>
      <Form.Group as={Row} className="mb-3">
        <Col lg={{ span: 2 }}>
          <Form.Label>Select Interval</Form.Label>
        </Col>
        <Col lg={{ span: 2 }}>
          <Form.Select
            aria-label="Default select example"
            value={intervalType}
            onChange={handleIntervalChange}
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </Form.Select>
        </Col>
      </Form.Group>
      <Line options={options} data={salesData} />
    </Container>
  );
};

export default Sales;
