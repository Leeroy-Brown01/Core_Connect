import { Injectable, inject } from '@angular/core';
import { Auth, fetchSignInMethodsForEmail } from '@angular/fire/auth';
import { ICDUserService } from './icd-user.service';

@Injectable({
  providedIn: 'root'
})
export class UserCleanupService {
  private auth = inject(Auth);
  private icdUserService = inject(ICDUserService);

  // Method to check for orphaned Firebase Auth users
  async findOrphanedAuthUsers(): Promise<string[]> {
    // This would require server-side implementation
    // Client-side cannot list all Firebase Auth users
    console.warn('⚠️ Orphaned user detection requires server-side implementation');
    return [];
  }

  // Method to check if email has conflicts
  async checkEmailConflicts(email: string): Promise<{
    existsInAuth: boolean;
    existsInFirestore: boolean;
    canCreateNew: boolean;
    message: string;
  }> {
    try {
      const existsInAuth = await this.icdUserService.checkEmailExistsInAuth(email);
      const firestoreUser = await this.icdUserService.getUserByEmail(email);
      const existsInFirestore = !!firestoreUser;

      let canCreateNew = false;
      let message = '';

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
      console.error('Error checking email conflicts:', error);
      return {
        existsInAuth: false,
        existsInFirestore: false,
        canCreateNew: false,
        message: 'Error checking email availability'
      };
    }
  }

  // Method to provide user creation guidance
  async getCreationGuidance(email: string): Promise<string> {
    const conflicts = await this.checkEmailConflicts(email);
    
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
