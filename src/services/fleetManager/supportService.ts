import { post, getToken } from '../apiService';
import environment from '../../environments/environment';

export async function supportService(data: any): Promise<any> {
  const token = await getToken();

  if (!token) {
    throw new Error('Authentication failed');
  }

  const formData = new FormData();
  formData.append('userId', data.userId);
  formData.append('subject', data.subject);
  formData.append('body', data.body);
  data.toEmail.forEach((email: string) => formData.append('toEmails', email));
  data.ccEmails.forEach((email: string) => formData.append('ccEmails', email));
  data.attachments.forEach((file: File) => formData.append('attachments', file));

  return await fetch(`${environment.scoreAPI}/email/sendEmail`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  });
}
