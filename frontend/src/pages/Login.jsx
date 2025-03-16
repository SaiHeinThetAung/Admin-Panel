import React, { useState, useCallback, useEffect } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;

const Login = () => {
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const [form] = Form.useForm();

  useEffect(() => {
    if (location.state?.successMessage) {
      setSuccess(location.state.successMessage);
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = useCallback(
    async (values) => {
      setLoading(true);
      setError('');
      setSuccess('');

      try {
        const response = await api.post('/auth/login', {
          email: values.email,
          password: values.password,
        }, {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000,
        });

        // Store token and user data in localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user)); // Store user object
        navigate('/dashboard', { replace: true });
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          'An error occurred during login. Please try again.';
        setError(errorMessage);
        form.resetFields(['password']);
      } finally {
        setLoading(false);
      }
    },
    [navigate, form]
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg">
        <div className="flex justify-center mb-6">
          <img
            src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
            alt="Company Logo"
            className="h-12"
            onError={(e) => (e.target.style.display = 'none')}
          />
        </div>
        <Title level={2} className="text-center mb-6">
          Sign In
        </Title>
        {error && (
          <Alert
            message={error}
            type="error"
            showIcon
            className="mb-6"
            closable
            onClose={() => setError('')}
          />
        )}
        {success && (
          <Alert
            message={success}
            type="success"
            showIcon
            className="mb-6"
            closable
            onClose={() => setSuccess('')}
          />
        )}
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
        >
          <Form.Item
            name="email"
            label="Email Address"
            rules={[
              { required: true, message: 'Please enter your email address' },
              { type: 'email', message: 'Please enter a valid email address' },
            ]}
            validateTrigger="onBlur"
          >
            <Input placeholder="Enter your email address" size="large" />
          </Form.Item>
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter your password' },
              { min: 8, message: 'Password must be at least 8 characters' },
            ]}
            validateTrigger="onBlur"
          >
            <Input.Password placeholder="Enter your password" size="large" />
          </Form.Item>
          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              loading={loading}
              className="w-full"
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </Button>
          </Form.Item>
          <div className="text-center">
            <span>Don't have an account? </span>
            <Link to="/register" className="text-blue-500 hover:text-blue-700">
              Register
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Login;