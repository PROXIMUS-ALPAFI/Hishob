import React, { useState, useEffect } from "react";
import { Form, Input, message } from "antd";
import { Link, useNavigate } from "react-router-dom";
import api from "../api";
import { isAuthenticated, setAuthSession } from "../auth";
import Loading from "../components/loading";

const Login = ({ theme, toggleTheme }) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [messageApi, messageContextHolder] = message.useMessage();

  const submitHandler = async (values) => {
    try {
      setLoading(true);
      const { data } = await api.post("/users/login", values);
      setLoading(false);
      setAuthSession({ user: data.user, token: data.token });
      messageApi.success(data.message || "Welcome back");
      navigate("/");
    } catch (error) {
      setLoading(false);
      messageApi.error(error.response?.data?.message || "Unable to log in with those details");
    }
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
              <span className="auth-card__eyebrow">Personal budget tracker</span>
              <h1>See where your money goes, faster.</h1>
            </div>
            <div>
              <p>Sign in to manage income, expenses, and trends from one simple dashboard.</p>
              <ul>
                <li>Quick transaction entry</li>
                <li>Clear income vs expense breakdowns</li>
                <li>Responsive dashboard that works on mobile</li>
              </ul>
            </div>
          </section>

          <section className="auth-card__form">
            <h2>Login</h2>
            <p className="auth-card__form-copy">Use your account details to continue to Hishob.</p>
            <Form layout="vertical" onFinish={submitHandler} autoComplete="off">
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
                rules={[{ required: true, message: "Password is required" }]}
              >
                <Input.Password placeholder="Enter your password" size="large" />
              </Form.Item>
              <button className="auth-card__submit" type="submit">
                Login
              </button>
            </Form>
            <p className="auth-card__switch">
              New here? <Link to="/register">Create an account</Link>
            </p>
          </section>
        </div>
      </div>
  );
};

export default Login;
