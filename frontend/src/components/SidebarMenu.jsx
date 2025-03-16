import React from 'react';
import {
  UserOutlined,
  TeamOutlined,
  LockOutlined,
  BarChartOutlined,
  UploadOutlined,
  AppstoreOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { Menu } from 'antd';

// Default admin menu items
const defaultItems = [
  { key: '1', icon: <UserOutlined />, label: 'Users' },
  { key: '2', icon: <TeamOutlined />, label: 'Roles' },
  { key: '3', icon: <LockOutlined />, label: 'Bans' },
  { key: '4', icon: <BarChartOutlined />, label: 'Analytics' },
  { key: '5', icon: <UploadOutlined />, label: 'Upload' },
  { key: '6', icon: <AppstoreOutlined />, label: 'Settings' },
];

const SidebarMenu = ({ onMenuSelect, selectedKey, items = defaultItems }) => {
  return (
    <Menu
      theme="dark"
      mode="inline"
      defaultSelectedKeys={['1']}
      selectedKeys={[selectedKey]}
      items={items}
      onClick={({ key }) => onMenuSelect(key)}
    />
  );
};

export default SidebarMenu;