
import { Injectable, inject } from '@angular/core';
import { Auth, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { ICDUserService } from './icd-user.service';

@Injectable({
  providedIn: 'root' // Makes this service available app-wide
})
export class UserCleanupService {
  // Inject Firebase Auth service
  private auth = inject(Auth);
  // Inject custom ICD user service for Firestore operations
  private icdUserService = inject(ICDUserService);

  /**
   * Method to check for orphaned Firebase Auth users (users in Auth but not in Firestore)
   * Note: This requires server-side implementation; client-side cannot list all Auth users
   * @returns An empty array (placeholder)
   */
  async findOrphanedAuthUsers(): Promise<string[]> {
    // This would require server-side implementation
    // Client-side cannot list all Firebase Auth users
    console.warn('⚠️ Orphaned user detection requires server-side implementation');
    return [];
  }

  /**
   * Check if an email exists in Firebase Auth and/or Firestore, and if a new user can be created
   * @param email The email to check
   * @returns Object with existence flags and a guidance message
   */
  async checkEmailConflicts(email: string): Promise<{
    existsInAuth: boolean;
    existsInFirestore: boolean;
    canCreateNew: boolean;
    message: string;
  }> {
    try {
      // Check if email exists in Firebase Auth
      const existsInAuth = await this.icdUserService.checkEmailExistsInAuth(email);
      // Check if user exists in Firestore
      const firestoreUser = await this.icdUserService.getUserByEmail(email);
      const existsInFirestore = !!firestoreUser;

      let canCreateNew = false;
      let message = '';

      // Determine the state and set message accordingly
      if (!existsInAuth && !existsInFirestore) {
        canCreateNew = true;
        message = 'Email is available for new user creation';
      } else if (existsInAuth && !existsInFirestore) {
        message = 'Email exists in Firebase Auth but not in ICD system. Consider cleanup.';
      } else if (!existsInAuth && existsInFirestore) {
        message = 'Email exists in ICD system but not in Firebase Auth. Data inconsistency detected.';
      } else {
        message = 'Email exists in both systems. User already fully registered.';
      }

      return {
        existsInAuth,
        existsInFirestore,
        canCreateNew,
        message
      };
    } catch (error) {
      // Log error and return default response
      console.error('Error checking email conflicts:', error);
      return {
        existsInAuth: false,
        existsInFirestore: false,
        canCreateNew: false,
        message: 'Error checking email availability'
      };
    }
  }

  /**
   * Provide user creation guidance based on email conflict checks
   * @param email The email to check
   * @returns Guidance string for user creation
   */
  async getCreationGuidance(email: string): Promise<string> {
    const conflicts = await this.checkEmailConflicts(email);
    // Return guidance based on conflict state
    if (conflicts.canCreateNew) {
      return 'You can proceed with creating this user.';
    } else if (conflicts.existsInAuth && !conflicts.existsInFirestore) {
      return 'This email is registered in Firebase Auth but not in your ICD system. You may need to clean up the authentication record first, or contact your administrator.';
    } else if (conflicts.existsInFirestore && !conflicts.existsInAuth) {
      return 'This email exists in your ICD system but not in Firebase Auth. This indicates a data inconsistency.';
    } else {
      return 'This email is already fully registered in the system.';
    }
  }
}
