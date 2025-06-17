import { Injectable, inject } from '@angular/core';
import { ICDDownloadsService } from './icd-downloads.service';

@Injectable({
  providedIn: 'root'
})
export class TestDownloadsService {
  private icdDownloadsService = inject(ICDDownloadsService);

  constructor() {}

  async createTestDownloads(userId: string): Promise<void> {
    try {
      console.log('🧪 Creating test downloads for user:', userId);

      const testDownloads = [
        {
          fileName: 'Patient_Report_Jan2024.pdf',
          fileSize: 2458624,
          fileType: 'application/pdf',
          fileStyle: 'pdf',
          category: 'Medical Reports',
          subject: 'Patient Report - January 2024',
          senderName: 'Dr. Sarah Johnson',
          senderEmail: 'dr.johnson@hospital.com',
          messageId: 'test_msg_001',
          fileData: 'data:application/pdf;base64,JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggMTMzCj4+CnN0cmVhbQpCVApxCjMwNiA3NDUgVGQKL0YxIDEyIFRmCihUZXN0IERvY3VtZW50KSBUago2MCA2ODEgVGQKKFRoaXMgaXMgYSB0ZXN0IFBERiBkb2N1bWVudCBmb3IgZGV2ZWxvcG1lbnQgcHVycG9zZXMuKSBUagpFVApRCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmCjAwMDAwMDAwMTAgMDAwMDAgbgowMDAwMDAwMDc5IDAwMDAwIG4KMDAwMDAwMDEzNiAwMDAwMCBuCjAwMDAwMDAzMzQgMDAwMDAgbgowMDAwMDAwNDA4IDAwMDAwIG4KdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo1ODcKJSVFT0Y='
        },
        {
          fileName: 'Training_Materials_2024.docx',
          fileSize: 1572864,
          fileType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          fileStyle: 'document',
          category: 'Training',
          subject: 'New Staff Training Materials',
          senderName: 'HR Department',
          senderEmail: 'hr@hospital.com',
          messageId: 'test_msg_002',
          fileData: 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,UEsDBBQACAgIACEJHFEAAAAAAAAAAAAAAAAYAAAAeGwvd29ya3NoZWV0cy9zaGVldDEueG1snVvJctswEP2VCufJkRZLtHQsOZnOTF...' // Truncated for brevity
        },
        {
          fileName: 'Budget_Analysis_Q1.xlsx',
          fileSize: 3145728,
          fileType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          fileStyle: 'spreadsheet',
          category: 'Finance',
          subject: 'Q1 Budget Analysis Report',
          senderName: 'Finance Team',
          senderEmail: 'finance@hospital.com',
          messageId: 'test_msg_003',
          fileData: 'data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,UEsDBBQACAgIADaJHFEAAAAAAAAAAAAAAAATAAAAW0NvbnRlbnRfVHlwZXNdLnhtbLWVwUrEMBSF...' // Truncated for brevity
        }
      ];

      for (const download of testDownloads) {
        await this.icdDownloadsService.logDownload(userId, download);
      }

      console.log('✅ Test downloads created successfully');
    } catch (error) {
      console.error('❌ Error creating test downloads:', error);
    }
  }
}
