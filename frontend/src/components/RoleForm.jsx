import React, { useEffect, useState } from 'react';
import { Form, Select, Alert } from 'antd';
import axios from 'axios';

const { Option } = Select;

const RoleForm = ({ initialValues = {}, onRoleSaved, isEditMode = false }) => {
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

      // Prepare payload: Only send the role field
      const payload = { role: values.role };

      // Ensure there’s a change to update
      if (isEditMode && initialValues.role === values.role) {
        throw new Error('No changes detected to update');
      }

      if (isEditMode) {
        await axios.put(
          `http://localhost:5005/api/users/${initialValues.id}`,
          payload,
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } else {
        throw new Error('RoleForm only supports editing existing users');
      }

      setError('');
      onRoleSaved(); // Notify parent to refresh UI
    } catch (err) {
      const errorMessage =
        err.response?.data?.message || err.message || 'Error updating role';
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
          name="role"
          label="Role"
          rules={[{ required: true, message: 'Please select a role!' }]}
        >
          <Select onChange={() => form.submit()}> {/* Auto-submit on change */}
            <Option value="user">User</Option>
            <Option value="admin">Admin</Option>
          </Select>
        </Form.Item>
      </Form>
    </div>
  );
};

export default RoleForm;