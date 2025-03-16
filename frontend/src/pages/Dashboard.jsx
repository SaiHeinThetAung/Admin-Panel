/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import { Layout, theme, Table, Input, Select, Button, Tooltip, Popconfirm, Modal, message } from 'antd';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import UserForm from '../components/UserForm';
import SidebarMenu from '../components/SidebarMenu';
import RoleForm from '../components/RoleForm';
import api from '../services/api';

const { Header, Content, Footer, Sider } = Layout;
const { Option } = Select;

const siderStyle = {
  overflow: 'auto',
  height: '100vh',
  position: 'sticky',
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: 'thin',
  scrollbarGutter: 'stable',
};

const userMenuItems = [
  { key: '1', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="url(#userGradient)" />
    <defs>
      <linearGradient id="userGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
        <stop stopColor="#F472B6" />
        <stop offset="1" stopColor="#60A5FA" />
      </linearGradient>
    </defs>
  </svg>, label: 'Profile' },
];

const Dashboard = () => {
  const [users, setUsers] = useState([]);
  const [filters, setFilters] = useState({ username: '', email: '', role: 'user', banned: 'false' });
  const [sort, setSort] = useState({ field: 'created_at', direction: 'asc' });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [editRoleUser, setEditRoleUser] = useState(null);
  const [selectedMenu, setSelectedMenu] = useState('1');
  const [loggedInUser, setLoggedInUser] = useState(JSON.parse(localStorage.getItem('user') || '{}')); // State for logged-in user
  const navigate = useNavigate();

  const isAdmin = loggedInUser.role === 'admin';

  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    fetchUsers();
  }, [filters, sort, selectedMenu]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('No authentication token found');

      let response;
      if (isAdmin) {
        const adjustedFilters = {
          ...filters,
          banned: filters.banned === 'true' ? true : filters.banned === 'false' ? false : undefined,
        };
        response = await api.get('/users', {
          headers: { Authorization: `Bearer ${token}` },
          params: {
            ...adjustedFilters,
            sortBy: sort.field,
            sortDir: sort.direction,
          },
        });
        console.log('Admin fetched users:', response.data);
      } else {
        console.log('Fetching user data for ID:', loggedInUser.id);
        response = await api.get(`/users/${loggedInUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('User response:', response.data);
        response.data = Array.isArray(response.data) ? response.data : [response.data];
      }
      setUsers(response.data);
      console.log('Set users state:', response.data);
    } catch (error) {
      console.error('Error fetching users:', {
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        data: error.response?.data,
      });
      const errorMsg = error.response?.status === 401
        ? 'Unauthorized: Please log in again'
        : error.response?.data?.message || 'Failed to fetch users';
      message.error(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleBanToggle = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      await api.patch(
        `/users/${id}/ban`,
        { ban: !currentStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      message.success(`User ${currentStatus ? 'unbanned' : 'banned'} successfully`);
      fetchUsers();
    } catch (error) {
      message.error('Failed to update ban status');
    }
  };

  const handleDelete = async (id) => {
    try {
      const token = localStorage.getItem('token');
      await api.delete(`/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      message.success('User deleted successfully');
      fetchUsers();
    } catch (error) {
      message.error('Failed to delete user');
    }
  };

  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const showModal = (user = null) => {
    setEditUser(user);
    setIsModalOpen(true);
  };

  const handleOk = () => {
    const form = document.querySelector('.ant-modal .ant-form');
    if (form) form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
  };

  const handleCancel = () => {
    setIsModalOpen(false);
    setEditUser(null);
  };

  const handleUserSaved = async () => {
    // Check if the edited user is the logged-in user and update localStorage/state
    if (editUser && editUser.id === loggedInUser.id) {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/users/${loggedInUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedUser = response.data;
        // Update localStorage and state with the new user data
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setLoggedInUser(updatedUser);
        message.success('Username updated successfully');
      } catch (error) {
        console.error('Error fetching updated user:', error);
        message.error('Failed to refresh user data');
      }
    }
    setIsModalOpen(false);
    setEditUser(null);
    fetchUsers();
  };

  const showRoleModal = (user) => {
    setEditRoleUser(user);
    setIsRoleModalOpen(true);
  };

  const handleRoleCancel = () => {
    setIsRoleModalOpen(false);
    setEditRoleUser(null);
  };

  const handleRoleSaved = async () => {
    if (editRoleUser && editRoleUser.id === loggedInUser.id) {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get(`/users/${loggedInUser.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const updatedUser = response.data;
        if (updatedUser.role === 'user' && loggedInUser.role === 'admin') {
          handleLogout('Your role has been changed to user. Logging out...');
          return;
        }
        // Update localStorage and state if role changes but not to user
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setLoggedInUser(updatedUser);
      } catch (error) {
        console.error('Error fetching updated user:', error);
      }
    }
    setIsRoleModalOpen(false);
    setEditRoleUser(null);
    fetchUsers();
  };

  const handleLogout = (customMessage) => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    message.success(customMessage || 'Logged out successfully');
    navigate('/login');
  };

  const userColumns = [
    { title: 'Username', dataIndex: 'username' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Role', dataIndex: 'role' },
    { title: 'Created At', dataIndex: 'created_at', render: (text) => text ? new Date(text).toLocaleString() : 'N/A' },
  ];

  const adminColumns = [
    { title: 'Username', dataIndex: 'username', sorter: true, onHeaderCell: () => ({
        onClick: () => setSort({ field: 'username', direction: sort.direction === 'asc' ? 'desc' : 'asc' }),
      }),
    },
    { title: 'Email', dataIndex: 'email', sorter: true, onHeaderCell: () => ({
        onClick: () => setSort({ field: 'email', direction: sort.direction === 'asc' ? 'desc' : 'asc' }),
      }),
    },
    { title: 'Role', dataIndex: 'role' },
    { title: 'Created At', dataIndex: 'created_at', sorter: true, render: (text) => text ? new Date(text).toLocaleString() : 'N/A', onHeaderCell: () => ({
        onClick: () => setSort({ field: 'created_at', direction: sort.direction === 'asc' ? 'desc' : 'asc' }),
      }),
    },
    { title: 'Banned', dataIndex: 'banned', render: (banned) => (banned ? 'Yes' : 'No') },
    {
      title: 'Actions',
      render: (_, record) => (
        <div>
          <Button type="link" onClick={() => showModal(record)}>Edit</Button>
          <Button type="link" onClick={() => handleBanToggle(record.id, record.banned)}>
            {record.banned ? 'Unban' : 'Ban'}
          </Button>
          <Popconfirm
            title="Are you sure to delete this user?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button type="link" danger>Delete</Button>
          </Popconfirm>
        </div>
      ),
    },
  ];

  const roleColumns = [
    { title: 'Username', dataIndex: 'username' },
    { title: 'Email', dataIndex: 'email' },
    { title: 'Current Role', dataIndex: 'role' },
    {
      title: 'Actions',
      render: (_, record) => (
        <Button type="link" onClick={() => showRoleModal(record)}>
          Edit Role
        </Button>
      ),
    },
  ];

  const inputStyle = 'flex-1 min-w-[200px] max-w-[300px] h-10 rounded-md border-gray-300 hover:border-blue-400 focus:border-blue-500 transition-colors';
  const selectStyle = 'flex-1 min-w-[120px] max-w-[150px] h-10';

  const renderContent = () => {
    if (!isAdmin) {
      return (
        <div>
          <h2 className="text-lg font-semibold mb-4">Your Information</h2>
          {users.length === 0 ? (
            <p>No data available</p>
          ) : (
            <Table
              columns={userColumns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={false}
              bordered
            />
          )}
        </div>
      );
    }

    switch (selectedMenu) {
      case '1':
        return (
          <>
            <Button type="primary" onClick={() => showModal()} className="mb-6">Add User</Button>
            <Modal
              title={editUser ? 'Edit User' : 'Add User'}
              open={isModalOpen}
              onOk={handleOk}
              onCancel={handleCancel}
              okText="Save"
              cancelText="Cancel"
            >
              <UserForm onUserSaved={handleUserSaved} initialValues={editUser} isEditMode={!!editUser} />
            </Modal>
            <div className="flex items-center gap-4 mb-6 flex-wrap sm:flex-nowrap bg-gray-50 p-4 rounded-lg shadow-sm">
              <Tooltip title="Search by username">
                <Input
                  placeholder="Username"
                  value={filters.username}
                  onChange={(e) => handleFilterChange('username', e.target.value)}
                  className={inputStyle}
                  allowClear
                />
              </Tooltip>
              <Tooltip title="Search by email">
                <Input
                  placeholder="Email"
                  value={filters.email}
                  onChange={(e) => handleFilterChange('email', e.target.value)}
                  className={inputStyle}
                  allowClear
                />
              </Tooltip>
              <Tooltip title="Filter by role">
                <Select
                  value={filters.role}
                  onChange={(value) => handleFilterChange('role', value)}
                  className={selectStyle}
                  placeholder="Role"
                  allowClear
                  dropdownStyle={{ minWidth: 120 }}
                  style={{ height: '40px' }}
                >
                  <Option value="admin">Admin</Option>
                  <Option value="user">User</Option>
                </Select>
              </Tooltip>
              <Tooltip title="Filter by ban status">
                <Select
                  value={filters.banned}
                  onChange={(value) => handleFilterChange('banned', value)}
                  className={selectStyle}
                  placeholder="Status"
                  allowClear
                  dropdownStyle={{ minWidth: 120 }}
                  style={{ height: '40px' }}
                >
                  <Option value="true">Banned</Option>
                  <Option value="false">Not Banned</Option>
                </Select>
              </Tooltip>
            </div>
            <Table
              columns={adminColumns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              bordered
            />
          </>
        );
      case '2':
        return (
          <>
            <h2 className="text-lg font-semibold mb-4">Role Management</h2>
            <Modal
              title="Edit Role"
              open={isRoleModalOpen}
              onCancel={handleRoleCancel}
              footer={null}
            >
              <RoleForm
                onRoleSaved={handleRoleSaved}
                initialValues={editRoleUser ? { role: editRoleUser.role, id: editRoleUser.id } : {}}
                isEditMode={!!editRoleUser}
              />
            </Modal>
            <Table
              columns={roleColumns}
              dataSource={users}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
              bordered
            />
          </>
        );
      case '3':
        return <div>Ban/Unban System (Placeholder - Add ban-specific UI here)</div>;
      case '4':
        return <div>Analytics Dashboard (Placeholder - Add charts/stats here)</div>;
      case '5':
        return <div>Upload Section (Placeholder - Add upload functionality here)</div>;
      case '6':
        return <div>Settings Page (Placeholder - Add settings options here)</div>;
      default:
        return null;
    }
  };

  return (
    <Layout hasSider>
      <Sider style={siderStyle}>
        <div className="h-14 m-1 flex items-center justify-center rounded">
          <img
            src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg"
            alt="Ant Design Logo"
            className="h-9 mr-2"
          />
          <span className="text-xl font-semibold text-white drop-shadow-sm">
            AntDesign
          </span>
        </div>
        <SidebarMenu
          onMenuSelect={setSelectedMenu}
          selectedKey={selectedMenu}
          items={isAdmin ? undefined : userMenuItems}
        />
      </Sider>
      <Layout>
        <Header style={{
          padding: '0 16px',
          background: '#001529',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
          borderRadius: 0,
        }}>
          <div className="text-2xl font-bold text-white p-4 drop-shadow-md">
            {isAdmin ? 'Admin Dashboard' : 'User Dashboard'}
          </div>
          <div className="flex items-center">
            <Tooltip title="Username">
              <span className="flex items-center mr-4">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className="mr-2">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="url(#userGradient)" />
                  <defs>
                    <linearGradient id="userGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F472B6" />
                      <stop offset="1" stopColor="#60A5FA" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-white font-semibold drop-shadow-sm">{loggedInUser.username || 'User'}</span>
              </span>
            </Tooltip>
            <Tooltip title="Log out">
              <Button
                type="text"
                onClick={() => handleLogout()}
                style={{ padding: 0, height: 'auto' }}
                className="flex items-center text-white hover:text-gray-300 transition-colors"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17 7l-1.41 1.41L18.17 11H8v2h10.17l-2.58 2.58L17 17l5-5-5-5zM4 5h8V3H4c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h8v-2H4V5z" fill="url(#logoutGradient)" />
                  <defs>
                    <linearGradient id="logoutGradient" x1="0" y1="0" x2="24" y2="24" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#F87171" />
                      <stop offset="1" stopColor="#FBBF24" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="ml-1 font-semibold drop-shadow-sm">Logout</span>
              </Button>
            </Tooltip>
          </div>
        </Header>
        <Content style={{ margin: '24px 16px 0', overflow: 'initial' }}>
          <div style={{ padding: 24, background: colorBgContainer, borderRadius: borderRadiusLG }}>
            {renderContent()}
          </div>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          Ant Design ©{new Date().getFullYear()} Created by Ant UED
        </Footer>
      </Layout>
    </Layout>
  );
};

export default Dashboard;