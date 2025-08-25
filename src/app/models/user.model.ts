
// Enum for user roles in the system
export enum RoleName {
  ADMIN = 'Admin', // Administrator role
  // Add more roles as needed (e.g., USER = 'User', MANAGER = 'Manager')
}


// Enum for user account status
export enum UserStatus {
  ACTIVE = 'active',    // User is active
  INACTIVE = 'inactive',// User is inactive
  PENDING = 'pending'   // User account is pending approval or activation
}


// Interface representing a user in the system
export interface User {
  id: string;                // Unique user ID
  firstName: string;         // User's first name
  lastName: string;          // User's last name
  email: string;             // User's email address
  role: RoleName;            // User's role (from RoleName enum)
  status: UserStatus;        // User's account status (from UserStatus enum)
  profileImage?: string;     // Optional: URL to user's profile image
  phoneNumber?: string;      // Optional: User's phone number
  idNumber?: string;         // Optional: User's ID number
  lastLogin?: Date;          // Optional: Last login date
  createdAt: Date;           // Date the user was created
  updatedAt: Date;           // Date the user was last updated
}


// Interface representing a permission for a resource/action
export interface Permission {
  resource: string; // The resource being accessed (e.g., 'document', 'user')
  action: string;   // The action allowed (e.g., 'read', 'write', 'delete')
}
