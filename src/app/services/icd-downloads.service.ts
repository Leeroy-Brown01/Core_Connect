// Angular service for managing ICD file downloads and download logs in Firestore
import { Injectable, inject } from '@angular/core'; // Angular DI
import { Firestore, collection, getDocs, query, where, orderBy, addDoc, Timestamp } from '@angular/fire/firestore'; // Firestore DB
import { Observable, from } from 'rxjs'; // RxJS for async

// Interface representing a download item in the ICD downloads collection
export interface ICDDownloadItem {
  id?: string; // Firestore document ID
  fileName: string; // Name of the downloaded file
  fileSize: number; // File size in bytes
  fileType: string; // MIME type of the file
  fileStyle?: string; // UI style for file type
  subject: string; // Subject associated with the file
  senderName: string; // Name of the sender
  senderEmail: string; // Email of the sender
  downloadedBy: string; // User who downloaded the file
  downloadedAt: Date; // Download timestamp
  messageId: string; // Associated message ID
  category?: string; // Optional: file category
  attachmentUrl?: string; // Optional: file URL
  attachmentData?: string; // Optional: base64 file data
  userId: string; // User ID for tracking
}

// Interface for logging download events
export interface DownloadLogData {
  fileName: string; // Name of the file
  fileUrl?: string; // Optional: file URL
  fileData?: string; // Optional: base64 file data
  fileSize?: number; // Optional: file size
  fileType?: string; // Optional: MIME type
  fileStyle?: string; // Optional: UI style
  category?: string; // Optional: file category
  subject?: string; // Optional: subject
  senderName?: string; // Optional: sender name
  senderEmail?: string; // Optional: sender email
  messageId?: string; // Optional: message ID
}

@Injectable({
  providedIn: 'root'
})
export class ICDDownloadsService {
  // Name of the Firestore collection for downloads
  private readonly DOWNLOADS_COLLECTION = 'icd-downloads';
  // Name of the Firestore collection for messages
  private readonly MESSAGES_COLLECTION = 'messages';
  // Injected Firestore instance
  private firestore = inject(Firestore);

  constructor() {
    // Log service initialization
    console.log('ICDDownloadsService initialized with icd-downloads collection');
  }

  // Get downloads for a specific user as an observable
  getUserDownloads(userId: string): Observable<ICDDownloadItem[]> {
    return from(this.fetchUserDownloads(userId));
  }

  // Fetch downloads for a user from Firestore
  private async fetchUserDownloads(userId: string): Promise<ICDDownloadItem[]> {
    try {
      console.log('🔍 Fetching downloads for user from icd-downloads collection:', userId);
      
      const downloadsCollection = collection(this.firestore, this.DOWNLOADS_COLLECTION);
      
      // Query the icd-downloads collection for this user, ordered by download date
      const q = query(
        downloadsCollection,
        where('userId', '==', userId),
        orderBy('downloadedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const downloads: ICDDownloadItem[] = [];
      
      // Build download items from query results
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        downloads.push({
          id: doc.id,
          fileName: data['fileName'] || 'Unknown File',
          fileSize: data['fileSize'] || 0,
          fileType: data['fileType'] || 'application/octet-stream',
          fileStyle: data['fileStyle'] || this.getFileStyleFromType(data['fileType']),
          subject: data['subject'] || 'No Subject',
          senderName: data['senderName'] || 'Unknown Sender',
          senderEmail: data['senderEmail'] || '',
          downloadedBy: data['downloadedBy'] || userId,
          downloadedAt: data['downloadedAt']?.toDate ? data['downloadedAt'].toDate() : new Date(data['downloadedAt']),
          messageId: data['messageId'] || '',
          category: data['category'] || 'General',
          attachmentUrl: data['attachmentUrl'],
          attachmentData: data['attachmentData'],
          userId: data['userId'] || userId
        });
      });
      
      console.log(`✅ Fetched ${downloads.length} downloads from icd-downloads collection`);
      return downloads;
      
    } catch (error) {
      // Log and return empty array on error
      console.error('❌ Error fetching user downloads from icd-downloads:', error);
      return [];
    }
  }

  // Log a download event to the icd-downloads collection
  async logDownload(userId: string, downloadData: DownloadLogData): Promise<void> {
    try {
      console.log('📝 Logging download for user:', userId, downloadData);
      
      const downloadsCollection = collection(this.firestore, this.DOWNLOADS_COLLECTION);
      
      // Build the download document, filtering out undefined values
      const downloadDoc: any = {
        fileName: downloadData.fileName,
        fileSize: downloadData.fileSize || 0,
        fileType: downloadData.fileType || 'application/octet-stream',
        fileStyle: downloadData.fileStyle || this.getFileStyleFromType(downloadData.fileType),
        subject: downloadData.subject || 'File Download',
        senderName: downloadData.senderName || 'System',
        senderEmail: downloadData.senderEmail || '',
        downloadedBy: userId,
        downloadedAt: Timestamp.now(),
        messageId: downloadData.messageId || '',
        category: downloadData.category || 'General',
        userId: userId,
        createdAt: Timestamp.now()
      };

      // Only add optional fields if they have values
      if (downloadData.fileUrl) {
        downloadDoc.attachmentUrl = downloadData.fileUrl;
      }

      if (downloadData.fileData) {
        downloadDoc.attachmentData = downloadData.fileData;
      }

      // Add the download log to Firestore
      await addDoc(downloadsCollection, downloadDoc);
      console.log('✅ Download logged successfully');
      
    } catch (error) {
      // Log and rethrow error
      console.error('❌ Error logging download:', error);
      throw error;
    }
  }

  // Download a file (from base64) and log the download event
  async downloadFileAndLog(
    userId: string, 
    downloadItem: ICDDownloadItem, 
    logData?: Partial<DownloadLogData>
  ): Promise<void> {
    try {
      // Download the file from base64 data
      if (downloadItem.attachmentData) {
        this.downloadFromBase64(downloadItem);
      } else {
        console.warn('⚠️ No attachment data available for:', downloadItem.fileName);
        throw new Error('File data not available for download');
      }

      // Prepare log data for the download event
      const logDownloadData: DownloadLogData = {
        fileName: downloadItem.fileName,
        fileSize: downloadItem.fileSize,
        fileType: downloadItem.fileType,
        fileStyle: downloadItem.fileStyle,
        category: downloadItem.category,
        subject: downloadItem.subject,
        senderName: downloadItem.senderName,
        senderEmail: downloadItem.senderEmail,
        messageId: downloadItem.messageId,
        fileData: downloadItem.attachmentData,
        ...logData // Allow override of any fields
      };

      // Log the download event
      await this.logDownload(userId, logDownloadData);
      console.log('✅ File downloaded and logged successfully');
      
    } catch (error) {
      // Log and rethrow error
      console.error('❌ Error downloading file and logging:', error);
      throw error;
    }
  }

  // Download a file from base64-encoded data
  private downloadFromBase64(downloadItem: ICDDownloadItem): void {
    try {
      if (!downloadItem.attachmentData) {
        throw new Error('No attachment data available');
      }

      // Convert base64 string to binary blob
      const byteCharacters = atob(downloadItem.attachmentData.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: downloadItem.fileType });
      
      // Create a download link and trigger download
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = downloadItem.fileName;
      document.body.appendChild(link);
      link.click();
      
      // Cleanup the link and URL
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      console.log('✅ File downloaded from base64 successfully');
    } catch (error) {
      // Log and rethrow error
      console.error('❌ Error in downloadFromBase64:', error);
      throw error;
    }
  }

  // Utility method to determine file style (icon type) from file MIME type
  private getFileStyleFromType(fileType?: string): string {
    if (!fileType) return 'document';
    
    const type = fileType.toLowerCase();
    if (type.includes('pdf')) return 'pdf';
    if (type.includes('word') || type.includes('document')) return 'document';
    if (type.includes('sheet') || type.includes('excel')) return 'spreadsheet';
    if (type.includes('image')) return 'image';
    if (type.includes('video')) return 'video';
    if (type.includes('audio')) return 'audio';
    if (type.includes('zip') || type.includes('archive')) return 'archive';
    if (type.includes('text')) return 'text';
    return 'document';
  }

  // Get downloads for a user filtered by category
  async getDownloadsByCategory(userId: string, category: string): Promise<ICDDownloadItem[]> {
    try {
      const downloadsCollection = collection(this.firestore, this.DOWNLOADS_COLLECTION);
      const q = query(
        downloadsCollection,
        where('userId', '==', userId),
        where('category', '==', category),
        orderBy('downloadedAt', 'desc')
      );
      
      const querySnapshot = await getDocs(q);
      const downloads: ICDDownloadItem[] = [];
      
      // Build download items from query results
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        downloads.push({
          id: doc.id,
          ...data,
          downloadedAt: data['downloadedAt']?.toDate ? data['downloadedAt'].toDate() : new Date(data['downloadedAt'])
        } as ICDDownloadItem);
      });
      
      return downloads;
    } catch (error) {
      // Log and return empty array on error
      console.error('Error fetching downloads by category:', error);
      return [];
    }
  }

  // Helper method to format file size for display (e.g., 1.2 MB)
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper method to get a file icon (emoji) based on file type
  getFileIcon(fileType: string): string {
    if (fileType.includes('pdf')) return '📄';
    if (fileType.includes('word') || fileType.includes('document')) return '📝';
    if (fileType.includes('sheet') || fileType.includes('excel')) return '📊';
    if (fileType.includes('image')) return '🖼️';
    if (fileType.includes('video')) return '🎥';
    if (fileType.includes('audio')) return '🎵';
    if (fileType.includes('zip') || fileType.includes('archive')) return '📦';
    return '📎';
  }
}
