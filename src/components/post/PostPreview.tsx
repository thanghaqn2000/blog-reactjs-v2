import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import DOMPurify from 'dompurify';
import { Save } from 'lucide-react';

interface PostPreviewProps {
  title: string;
  description: string;
  content: string;
  category: string;
  status: string;
  thumbnailPreview?: string;
  isSubmitting: boolean;
  onSave: () => void;
  onCancel: () => void;
}

const PostPreview = ({
  title,
  description,
  content,
  category,
  status,
  thumbnailPreview,
  isSubmitting,
  onSave,
  onCancel
}: PostPreviewProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Xem trước bài viết</CardTitle>
        <CardDescription>
          Xem trước bài viết sẽ hiển thị như thế nào
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {thumbnailPreview && (
          <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
            <img 
              src={thumbnailPreview} 
              alt="Thumbnail preview" 
              className="w-full h-full object-cover"
            />
          </div>
        )}

        <div>
          <h1 className="text-3xl font-bold">{title || "Chưa có tiêu đề"}</h1>
          {description && (
            <p className="mt-2 text-muted-foreground">{description}</p>
          )}
          {category && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                {category === 'news' ? 'Tin tức' : 'Tài chính'}
              </span>
            </div>
          )}
          {status && (
            <div className="mt-2">
              <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-secondary/10 text-secondary">
                {status === 'pending' ? 'Chờ duyệt' : 'Đã xuất bản'}
              </span>
            </div>
          )}
        </div>
        
        <div className="prose max-w-none dark:prose-invert">
          <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content || 'Chưa có nội dung') }} />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={onCancel}>
          Hủy
        </Button>
        <Button onClick={onSave} disabled={isSubmitting}>
          <Save className="mr-2 h-4 w-4" />
          {isSubmitting ? 'Đang lưu...' : 'Lưu bài viết'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PostPreview; 
