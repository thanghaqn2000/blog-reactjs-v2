import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { showToast } from "@/config/toast.config";
import AdminLayout from '@/layouts/AdminLayout';
import { createNotificationSchema } from '@/schemas/user-validation';
import { notificationService } from '@/services/admin/notification.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowLeft, Bell, Calendar, Send } from 'lucide-react';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';

type CreateNotificationFormData = z.infer<typeof createNotificationSchema>;

const CreateNotification = () => {
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateNotificationFormData>({
    resolver: zodResolver(createNotificationSchema),
    defaultValues: {
      type: 'sent_now',
      scheduled_at: '',
    },
  });

  const title = watch('title');
  const content = watch('content');
  const link = watch('link');
  const type = watch('type');
  const scheduled_at = watch('scheduled_at');

  const onSubmit = async (data: CreateNotificationFormData) => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSend = async () => {
    try {
      await notificationService.createNotification({
        title,
        content,
        link: link || undefined,
        type,
        scheduled_at: type === 'scheduled' ? scheduled_at : undefined
      });
      
      showToast.success(
        type === 'sent_now' 
          ? 'Notification đã được gửi thành công!' 
          : 'Notification đã được lên lịch thành công!'
      );
      navigate('/admin/notifications');
    } catch (error) {
      showToast.error('Có lỗi xảy ra khi tạo notification');
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  const formatDateTime = (dateTimeString: string) => {
    if (!dateTimeString) return '';
    return new Date(dateTimeString).toLocaleString('vi-VN');
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Tạo notification mới</h1>
            <p className="text-muted-foreground">
              Gửi notification đến mobile device của người dùng
            </p>
          </div>
          <div className="flex flex-row gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/notifications')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Thông tin notification
              </CardTitle>
              <CardDescription>
                Nhập thông tin chi tiết cho notification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                {/* Title */}
                <div className="space-y-2">
                  <Label htmlFor="title">
                    Tiêu đề <span className="text-red-500">*</span>
                  </Label>
                  <Input 
                    id="title"
                    placeholder="Nhập tiêu đề notification" 
                    {...register('title')}
                  />
                  {errors.title && (
                    <p className="text-sm text-red-500">{errors.title.message}</p>
                  )}
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <Label htmlFor="content">
                    Nội dung <span className="text-red-500">*</span>
                  </Label>
                  <Textarea 
                    id="content"
                    placeholder="Nhập nội dung notification"
                    rows={4}
                    {...register('content')}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500">{errors.content.message}</p>
                  )}
                </div>

                {/* Link */}
                <div className="space-y-2">
                  <Label htmlFor="link">Link (tùy chọn)</Label>
                  <Input 
                    id="link"
                    placeholder="https://example.com"
                    {...register('link')}
                  />
                  {errors.link && (
                    <p className="text-sm text-red-500">{errors.link.message}</p>
                  )}
                </div>

                {/* Type */}
                <div className="space-y-2">
                  <Label htmlFor="type">
                    Loại gửi <span className="text-red-500">*</span>
                  </Label>
                  <select 
                    id="type"
                    {...register('type')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    onChange={(e) => {
                      setValue('type', e.target.value as 'sent_now' | 'scheduled');
                    }}
                  >
                    <option value="sent_now">Gửi ngay</option>
                    <option value="scheduled">Lên lịch gửi</option>
                  </select>
                  {errors.type && (
                    <p className="text-sm text-red-500">{errors.type.message}</p>
                  )}
                </div>

                {/* Scheduled DateTime */}
                {type === 'scheduled' && (
                  <div className="space-y-2">
                    <Label htmlFor="scheduled_at">
                      Thời gian gửi <span className="text-red-500">*</span>
                    </Label>
                    <Input 
                      id="scheduled_at"
                      type="datetime-local"
                      {...register('scheduled_at')}
                    />
                    {errors.scheduled_at && (
                      <p className="text-sm text-red-500">{errors.scheduled_at.message}</p>
                    )}
                  </div>
                )}
              </div>

              {/* Preview */}
              {(title || content) && (
                <div className="mt-8">
                  <Label className="text-base font-semibold">Xem trước notification</Label>
                  <div className="mt-2 p-4 border rounded-lg bg-gray-50">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
                          <Bell className="w-4 h-4 text-white" />
                        </div>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {title || 'Tiêu đề notification'}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {content || 'Nội dung notification'}
                        </p>
                        {link && (
                          <p className="text-xs text-blue-600 mt-1 truncate">
                            {link}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button 
                variant="outline" 
                onClick={() => navigate('/admin/notifications')}
                type="button"
              >
                Hủy
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {type === 'sent_now' ? (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Đang gửi...' : 'Gửi ngay'}
                  </>
                ) : (
                  <>
                    <Calendar className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Đang lên lịch...' : 'Lên lịch gửi'}
                  </>
                )}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>

      {/* Confirmation Modal */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {type === 'sent_now' ? 'Xác nhận gửi notification' : 'Xác nhận lên lịch notification'}
            </DialogTitle>
            <DialogDescription asChild>
              <div className="space-y-2">
                <p>Bạn có chắc chắn muốn {type === 'sent_now' ? 'gửi' : 'lên lịch'} notification này?</p>
                <div className="bg-gray-50 p-3 rounded-md text-sm">
                  <p><strong>Tiêu đề:</strong> {title}</p>
                  <p><strong>Nội dung:</strong> {content}</p>
                  {link && <p><strong>Link:</strong> {link}</p>}
                  {type === 'scheduled' && scheduled_at && (
                    <p><strong>Thời gian:</strong> {formatDateTime(scheduled_at)}</p>
                  )}
                </div>
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmSend} disabled={isSubmitting}>
              {isSubmitting 
                ? (type === 'sent_now' ? 'Đang gửi...' : 'Đang lên lịch...') 
                : (type === 'sent_now' ? 'Xác nhận gửi' : 'Xác nhận lên lịch')
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default CreateNotification;
