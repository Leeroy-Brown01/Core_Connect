import { Injectable } from '@angular/core';
import { Firestore, collection, getDocs, query, orderBy, where } from '@angular/fire/firestore';
import { Observable, from } from 'rxjs';

export interface DownloadItem {
  id: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  category: string;
  department: string;
  uploaderName: string;
  uploadedAt: Date;
  downloadCount: number;
  description?: string;
  downloadUrl: string;
}

@Injectable({
  providedIn: 'root'
})
export class DownloadsService {
  private readonly DOWNLOADS_COLLECTION = 'downloads';

  constructor(private firestore: Firestore) {
    console.log('DownloadsService initialized');
  }

  // Get all downloads
  getDownloads(): Observable<DownloadItem[]> {
    return from(this.fetchDownloads());
  }

  private async fetchDownloads(): Promise<DownloadItem[]> {
    try {
      console.log('Fetching downloads from Firestore...');
      
      const downloadsCollection = collection(this.firestore, this.DOWNLOADS_COLLECTION);
      const q = query(downloadsCollection, orderBy('uploadedAt', 'desc'));
      
      const querySnapshot = await getDocs(q);
      const downloads = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fileName: data['fileName'] || '',
          fileSize: data['fileSize'] || 0,
          fileType: data['fileType'] || '',
          category: data['category'] || '',
          department: data['department'] || '',
          uploaderName: data['uploaderName'] || '',
          uploadedAt: data['uploadedAt']?.toDate ? data['uploadedAt'].toDate() : new Date(data['uploadedAt']),
          downloadCount: data['downloadCount'] || 0,
          description: data['description'] || '',
          downloadUrl: data['downloadUrl'] || ''
        } as DownloadItem;
      });
      
      console.log(`✅ Fetched ${downloads.length} downloads`);
      return downloads;
    } catch (error) {
      console.error('❌ Error fetching downloads:', error);
      // Return sample data as fallback
      return this.getSampleDownloads();
    }
  }

  // Fallback sample data
  private getSampleDownloads(): DownloadItem[] {
    console.log('Using sample downloads data');
    return [
      {
        id: '1',
        fileName: 'ICD Guidelines 2024.pdf',
        fileSize: 2458624,
        fileType: 'PDF',
        category: 'Guidelines',
        department: 'Administration',
        uploaderName: 'Dr. Sarah Johnson',
        uploadedAt: new Date('2024-01-15'),
        downloadCount: 245,
        description: 'Updated ICD guidelines for 2024 implementation',
        downloadUrl: '#'
      },
      {
        id: '2',
        fileName: 'Training Manual.docx',
        fileSize: 5242880,
        fileType: 'DOCX',
        category: 'Training',
        department: 'Human Resources',
        uploaderName: 'Mike Chen',
        uploadedAt: new Date('2024-01-10'),
        downloadCount: 156,
        description: 'Comprehensive training manual for new staff',
        downloadUrl: '#'
      },
      {
        id: '3',
        fileName: 'Budget Report Q1.xlsx',
        fileSize: 1048576,
        fileType: 'XLSX',
        category: 'Reports',
        department: 'Finance',
        uploaderName: 'Anna Williams',
        uploadedAt: new Date('2024-01-08'),
        downloadCount: 89,
        description: 'First quarter budget analysis and projections',
        downloadUrl: '#'
      },
      {
        id: '4',
        fileName: 'System Architecture.png',
        fileSize: 3145728,
        fileType: 'PNG',
        category: 'Technical',
        department: 'IT',
        uploaderName: 'James Miller',
        uploadedAt: new Date('2024-01-05'),
        downloadCount: 67,
        description: 'Network architecture diagram',
        downloadUrl: '#'
      },
      {
        id: '5',
        fileName: 'Policy Updates.pdf',
        fileSize: 1572864,
        fileType: 'PDF',
        category: 'Policies',
        department: 'Legal',
        uploaderName: 'Lisa Davis',
        uploadedAt: new Date('2024-01-03'),
        downloadCount: 123,
        description: 'Latest policy changes and updates',
        downloadUrl: '#'
      }
    ];
  }

  // Get downloads by category
  getDownloadsByCategory(category: string): Observable<DownloadItem[]> {
    return from(this.fetchDownloadsByCategory(category));
  }

  private async fetchDownloadsByCategory(category: string): Promise<DownloadItem[]> {
    try {
      const downloadsCollection = collection(this.firestore, this.DOWNLOADS_COLLECTION);
      const q = query(
        downloadsCollection,
        where('category', '==', category),
        orderBy('uploadedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fileName: data['fileName'] || '',
          fileSize: data['fileSize'] || 0,
          fileType: data['fileType'] || '',
          category: data['category'] || '',
          department: data['department'] || '',
          uploaderName: data['uploaderName'] || '',
          uploadedAt: data['uploadedAt']?.toDate ? data['uploadedAt'].toDate() : new Date(data['uploadedAt']),
          downloadCount: data['downloadCount'] || 0,
          description: data['description'] || '',
          downloadUrl: data['downloadUrl'] || ''
        } as DownloadItem;
      });
    } catch (error) {
      console.error('Error fetching downloads by category:', error);
      return [];
    }
  }

  // Get downloads by department
  getDownloadsByDepartment(department: string): Observable<DownloadItem[]> {
    return from(this.fetchDownloadsByDepartment(department));
  }

  private async fetchDownloadsByDepartment(department: string): Promise<DownloadItem[]> {
    try {
      const downloadsCollection = collection(this.firestore, this.DOWNLOADS_COLLECTION);
      const q = query(
        downloadsCollection,
        where('department', '==', department),
        orderBy('uploadedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          fileName: data['fileName'] || '',
          fileSize: data['fileSize'] || 0,
          fileType: data['fileType'] || '',
          category: data['category'] || '',
          department: data['department'] || '',
          uploaderName: data['uploaderName'] || '',
          uploadedAt: data['uploadedAt']?.toDate ? data['uploadedAt'].toDate() : new Date(data['uploadedAt']),
          downloadCount: data['downloadCount'] || 0,
          description: data['description'] || '',
          downloadUrl: data['downloadUrl'] || ''
        } as DownloadItem;
      });
    } catch (error) {
      console.error('Error fetching downloads by department:', error);
      return [];
    }
  }
}
