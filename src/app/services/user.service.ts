import { Injectable } from '@angular/core';
import { Firestore, collection, doc, getDoc, getDocs, setDoc, updateDoc, query, where, orderBy, limit, addDoc, writeBatch } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private firestore: Firestore) {
    console.log('UserService initialized with Firestore:', !!this.firestore);
  }

  getUser(uid: string): Observable<any> {
    console.log('Getting user data for UID:', uid);
    return from(this.fetchUser(uid)).pipe(
      catchError(error => {
        console.error('Error getting user:', error);
        throw error;
      })
    );
  }

  private async fetchUser(uid: string): Promise<any> {
    try {
      const userDocRef = doc(this.firestore, `users/${uid}`);
      const userDoc = await getDoc(userDocRef);
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log('User data fetched successfully for:', uid);
        return { id: userDoc.id, ...data };
      } else {
        console.log('No user document found for:', uid);
        return null;
      }
    } catch (error) {
      console.error('Error fetching user document:', error);
      throw error;
    }
  }

  async updateUser(uid: string, data: any): Promise<void> {
    try {
      console.log('Updating user:', uid, 'with data:', data);
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await updateDoc(userDocRef, {
        ...data,
        updatedAt: new Date().toISOString()
      });
      console.log('User updated successfully');
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  getAllUsers(): Observable<any[]> {
    console.log('Fetching all users');
    return from(this.fetchAllUsers()).pipe(
      catchError(error => {
        console.error('Error getting all users:', error);
        throw error;
      })
    );
  }

  private async fetchAllUsers(): Promise<any[]> {
    try {
      const usersCollection = collection(this.firestore, 'users');
      const usersSnapshot = await getDocs(usersCollection);
      const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      console.log('Fetched', users.length, 'users');
      return users;
    } catch (error) {
      console.error('Error fetching all users:', error);
      throw error;
    }
  }

  // Get user registration requests (pending approval)
  getUserRegistrationRequests(): Observable<any[]> {
    return from(this.fetchUserRegistrationRequests());
  }

  private async fetchUserRegistrationRequests(): Promise<any[]> {
    const requestsCollection = collection(this.firestore, 'userRegistrationRequests');
    const q = query(requestsCollection, where('status', '==', 'pending'));
    const requestsSnapshot = await getDocs(q);
    return requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Get user activity updates
  getUserActivityUpdates(): Observable<any[]> {
    return from(this.fetchUserActivityUpdates());
  }

  private async fetchUserActivityUpdates(): Promise<any[]> {
    const activitiesCollection = collection(this.firestore, 'userActivities');
    const q = query(activitiesCollection, orderBy('timestamp', 'desc'), limit(50));
    const activitiesSnapshot = await getDocs(q);
    return activitiesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Create new user
  async createUser(userData: any): Promise<any> {
    const usersCollection = collection(this.firestore, 'users');
    return addDoc(usersCollection, userData);
  }

  // Create new user with specific UID (for auth integration)
  async createUserWithUid(uid: string, userData: any): Promise<void> {
    try {
      console.log('Creating user document with UID:', uid);
      const userDocRef = doc(this.firestore, `users/${uid}`);
      await setDoc(userDocRef, {
        ...userData,
        createdAt: userData.createdAt?.toISOString() || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      console.log('User document created successfully');
    } catch (error) {
      console.error('Error creating user document:', error);
      throw error;
    }
  }

  // Approve user registration
  async approveUserRegistration(requestId: string, userData: any): Promise<void> {
    const batch = writeBatch(this.firestore);
    
    // Add to users collection
    const userRef = doc(this.firestore, 'users', requestId);
    batch.set(userRef, userData);
    
    // Update request status
    const requestRef = doc(this.firestore, 'userRegistrationRequests', requestId);
    batch.update(requestRef, { status: 'approved', approvedAt: new Date() });
    
    return batch.commit();
  }

  // Get users by province
  getUsersByProvince(province: string): Observable<any[]> {
    if (province === 'All Provinces') {
      return this.getAllUsers();
    }
    return from(this.fetchUsersByProvince(province));
  }

  private async fetchUsersByProvince(province: string): Promise<any[]> {
    const usersCollection = collection(this.firestore, 'users');
    const q = query(usersCollection, where('province', '==', province));
    const usersSnapshot = await getDocs(q);
    return usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  // Get user metrics
  getUserMetrics(): Observable<any> {
    return this.getAllUsers().pipe(
      map(users => {
        console.log('Raw users data for metrics:', users);
        
        // Count total users
        const totalUsers = users.length;
        
        // Count active users - check multiple possible status formats
        const activeUsers = users.filter(user => {
          const status = user.status?.toLowerCase();
          const isActive = user.isActive;
          const active = status === 'active' || isActive === true || (!status && !isActive);
          return active;
        });
        
        // Count completed users - check multiple possible completion formats
        const completedUsers = users.filter(user => {
          return user.trainingCompleted === true || 
                 user.trainingComplete === true ||
                 user.completed === true ||
                 user.status === 'completed';
        });
        
        const metrics = {
          totalUsers: totalUsers,
          totalActiveUsers: activeUsers.length,
          completedUsers: completedUsers.length
        };
        
        console.log('Calculated metrics:', metrics);
        console.log('Sample user for debugging:', users[0]);
        
        return metrics;
      })
    );
  }

  // Get user metrics by role - reusable across the system
  getUserCountByRole(role: string): Observable<number> {
    return this.getAllUsers().pipe(
      map(users => {
        console.log(`Counting users with role: ${role}`);
        const filteredUsers = users.filter(user => {
          const userRole = user.role?.toLowerCase() || user.userRole?.toLowerCase() || user.type?.toLowerCase();
          return userRole === role.toLowerCase();
        });
        console.log(`Found ${filteredUsers.length} users with role: ${role}`);
        return filteredUsers.length;
      })
    );
  }

  // Get users by multiple roles
  getUserCountByRoles(roles: string[]): Observable<{[key: string]: number}> {
    return this.getAllUsers().pipe(
      map(users => {
        console.log('Counting users by roles:', roles);
        const roleCounts: {[key: string]: number} = {};
        
        roles.forEach(role => {
          roleCounts[role] = users.filter(user => {
            const userRole = user.role?.toLowerCase() || user.userRole?.toLowerCase() || user.type?.toLowerCase();
            return userRole === role.toLowerCase();
          }).length;
        });
        
        console.log('Role counts:', roleCounts);
        return roleCounts;
      })
    );
  }

  // Get active users by role
  getActiveUserCountByRole(role: string): Observable<number> {
    return this.getAllUsers().pipe(
      map(users => {
        const activeUsersInRole = users.filter(user => {
          const userRole = user.role?.toLowerCase() || user.userRole?.toLowerCase() || user.type?.toLowerCase();
          const isActive = user.status?.toLowerCase() === 'active' || user.isActive === true;
          return userRole === role.toLowerCase() && isActive;
        });
        console.log(`Found ${activeUsersInRole.length} active users with role: ${role}`);
        return activeUsersInRole.length;
      })
    );
  }

  // Get comprehensive role-based metrics for admin dashboard
  getAdminRoleMetrics(): Observable<any> {
    return this.getAllUsers().pipe(
      map(users => {
        console.log('Calculating admin role metrics from users:', users.length);
        
        // Count by roles
        const trainers = users.filter(user => {
          const userRole = user.role?.toLowerCase() || user.userRole?.toLowerCase() || user.type?.toLowerCase();
          return userRole === 'instructor' || userRole === 'trainer';
        });
        
        const trainees = users.filter(user => {
          const userRole = user.role?.toLowerCase() || user.userRole?.toLowerCase() || user.type?.toLowerCase();
          return userRole === 'trainee' || userRole === 'student';
        });
        
        const admins = users.filter(user => {
          const userRole = user.role?.toLowerCase() || user.userRole?.toLowerCase() || user.type?.toLowerCase();
          return userRole === 'admin' || userRole === 'administrator';
        });
        
        // Count active users in each role
        const activeTrainers = trainers.filter(user => 
          user.status?.toLowerCase() === 'active' || user.isActive === true
        );
        
        const activeTrainees = trainees.filter(user => 
          user.status?.toLowerCase() === 'active' || user.isActive === true
        );
        
        const metrics = {
          totalTrainers: trainers.length,
          activeTrainers: activeTrainers.length,
          totalTrainees: trainees.length,
          activeTrainees: activeTrainees.length,
          totalAdmins: admins.length,
          totalUsers: users.length
        };
        
        console.log('Admin role metrics calculated:', metrics);
        console.log('Sample user structure for debugging:', users[0]);
        
        return metrics;
      })
    );
  }
}
