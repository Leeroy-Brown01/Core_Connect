export enum RoleName {
  ADMIN = 'Admin',
  MANAGER = 'Manager',
  WAREHOUSE_STAFF = 'Warehouse Staff',
  SALES_REP = 'Sales Rep',
  SUPPLIER = 'Supplier',
  // VIEWER = 'Viewer'
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: RoleName;
  status: UserStatus;
  profileImage?: string;
  phoneNumber?: string;
  idNumber?: string;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Permission {
  resource: string;
  action: string;
}
