import React, { useEffect, useState } from 'react';
import { Form, Input, Select, Alert } from 'antd';
import axios from 'axios';

const { Option } = Select;

const UserForm = ({ onUserSaved, initialValues = {}, isEditMode = false }) => {
  const [form] = Form.useForm();
  const [error, setError] = useState('');

  useEffect(() => {
    if (isEditMode && initialValues) {
      form.setFieldsValue(initialValues);
    } else {
      form.resetFields();
    }
  }, [initialValues, isEditMode, form]);

  const onFinish = async (values) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Prepare payload: Filter out unchanged values for edits
      const payload = isEditMode
        ? Object.fromEntries(
            Object.entries(values).filter(
              ([key, value]) => initialValues[key] !== value && key !== 'password'
            )
          )
        : values;

      // Ensure payload isn’t empty for updates
      if (isEditMode && Object.keys(payload).length === 0) {
        throw new Error('No changes detected to update');
      }

      if (isEditMode) {
        await axios.put(`http://localhost:5005/api/users/${initialValues.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post('http://localhost:5005/api/users', payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      form.resetFields();
      setError('');
      onUserSaved();
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || `Error ${isEditMode ? 'updating' : 'creating'} user`;
      console.error('Request failed:', {
        status: err.response?.status,
        message: errorMessage,
        details: err.response?.data,
      });
      setError(errorMessage);
    }
  };

  return (
    <div className="mb-6">
      {error && <Alert message={error} type="error" showIcon className="mb-4" />}
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{ role: 'user', ...initialValues }}
      >
        <Form.Item
          name="username"
          label="Username"
          rules={[
            { required: true, message: 'Please enter a username' },
            { min: 3, message: 'Username must be at least 3 characters' },
          ]}
        >
          <Input placeholder="Enter username" />
        </Form.Item>
        <Form.Item
          name="email"
          label="Email"
          rules={[
            { required: true, message: 'Please enter an email' },
            { type: 'email', message: 'Invalid email format' },
          ]}
        >
          <Input placeholder="Enter email" />
        </Form.Item>
        {!isEditMode && (
          <Form.Item
            name="password"
            label="Password"
            rules={[
              { required: true, message: 'Please enter a password' },
              { min: 6, message: 'Password must be at least 6 characters' },
            ]}
          >
            <Input.Password placeholder="Enter password" />
          </Form.Item>
        )}
        <Form.Item name="role" label="Role">
          <Select>
            <Option value="user">User</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
};

export default UserForm;