export enum RoleName {
  ADMIN = 'Admin',
 
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
