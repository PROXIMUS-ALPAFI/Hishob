import React, { useState, useEffect } from "react";
import { Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { isAuthenticated } from "../auth";
import Loading from "../components/loading";

const Register = ({ theme, toggleTheme }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [messageApi, messageContextHolder] = message.useMessage();

  const submitHandler = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post("/users/register", values);
      messageApi.success(`Account created! Welcome, ${data.user.name}`);
      setLoading(false);
      navigate("/login");
    } catch (error) {
      setLoading(false);
      messageApi.error(error.response?.data?.message || "Unable to create your account");
    }
  };

  const onFinishFailed = () => {
    messageApi.warning("Please fix the form errors before continuing.");
  };

  useEffect(() => {
    if (isAuthenticated()) {
      navigate("/");
    }
  }, [navigate]);
  return (
      <div className="auth-page">
        {messageContextHolder}
        {loading && <Loading />}
        <button className="auth-theme-toggle" type="button" onClick={toggleTheme}>
          {theme === 'dark' ? 'Light mode' : 'Dark mode'}
        </button>
        <div className="auth-card">
          <section className="auth-card__hero">
            <div>
              <span className="auth-card__eyebrow">Start tracking today</span>
              <h1>Build a cleaner money routine.</h1>
            </div>
            <div>
              <p>Create an account to log transactions and understand spending patterns at a glance.</p>
              <ul>
                <li>Organize income and expenses</li>
                <li>Filter by time period and type</li>
                <li>Review clear income and expense summaries</li>
              </ul>
            </div>
          </section>

          <section className="auth-card__form">
            <h2>Create account</h2>
            <p className="auth-card__form-copy">Set up your Hishob workspace in less than a minute.</p>
            <Form layout="vertical" onFinish={submitHandler} onFinishFailed={onFinishFailed} autoComplete="off">
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: "Name is required" }]}
              >
                <Input placeholder="Your full name" size="large" />
              </Form.Item>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: "Email is required" },
                  { type: "email", message: "Enter a valid email address" },
                ]}
              >
                <Input type="email" placeholder="name@example.com" size="large" />
              </Form.Item>
              <Form.Item
                label="Password"
                name="password"
                rules={[
                  { required: true, message: "Password is required" },
                  { min: 6, message: "Password must be at least 6 characters" },
                ]}
              >
                <Input.Password placeholder="Create a secure password" size="large" />
              </Form.Item>
              <button className="auth-card__submit" type="submit">
                Register
              </button>
            </Form>
            <p className="auth-card__switch">
              Already registered? <Link to="/login">Log in here</Link>
            </p>
          </section>
        </div>
      </div>
  );
};

export default Register;
