import React, { useState, useCallback } from 'react';
import { Form, Input, Button, Alert, Typography } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

const { Title } = Typography;

/**
 * Register component for user registration
 * @returns {JSX.Element} Registration form UI
 */
const Register = () => {
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleSubmit = useCallback(
    async (values) => {
      setLoading(true);
      setError('');

      try {
        // eslint-disable-next-line no-unused-vars
        const response = await api.post('/auth/register', {
          username: values.username,
          email: values.email,
          password: values.password,
          role: 'user', // Hardcode the default role as 'user'
        });

        setLoading(false);
        form.resetFields();
        navigate('/login', {
          state: { successMessage: 'Registration successful! Please sign in.' },
        });
      } catch (error) {
        const errorMessage =
          error.response?.data?.message ||
          'An error occurred during registration. Please try again.';
        setError(errorMessage);
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
          Register
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
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          disabled={loading}
        >
          <Form.Item
            name="username"
            label="Username"
            rules={[
              { required: true, message: 'Please enter your username' },
              { min: 3, message: 'Username must be at least 3 characters' },
            ]}
            validateTrigger="onBlur"
          >
            <Input placeholder="Enter your username" size="large" />
          </Form.Item>
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
              {loading ? 'Registering...' : 'Register'}
            </Button>
          </Form.Item>
          <div className="text-center">
            <span>Already have an account? </span>
            <Link to="/login" className="text-blue-500 hover:text-blue-700">
              Sign In
            </Link>
          </div>
        </Form>
      </div>
    </div>
  );
};

export default Register;