import PostPreview from '@/components/post/PostPreview';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showToast } from '@/config/toast.config';
import { usePosts } from '@/contexts/PostsContext';
import AdminLayout from '@/layouts/AdminLayout';
import { createPostSchema } from '@/schemas/user-validation';
import { postService } from '@/services/admin/post.service';
import { zodResolver } from '@hookform/resolvers/zod';
import JoditEditor from 'jodit-react';
import { ArrowLeft, FileImage, Save, Trash2 } from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useParams } from 'react-router-dom';
import * as z from 'zod';

type EditPostFormData = z.infer<typeof createPostSchema>;

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const { getPost, fetchPosts } = usePosts();
  const editor = useRef(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [editorContent, setEditorContent] = useState('');
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<EditPostFormData>({
    resolver: zodResolver(createPostSchema),
    defaultValues: {
      status: 'pending',
      content: '',
    },
  });

  const title = watch('title');
  const content = watch('content');
  const category = watch('category');
  const status = watch('status');
  const description = watch('description');

  const config = {
    readonly: false,
    height: 500,
    toolbar: true,
    spellcheck: true,
    toolbarSticky: true,
    toolbarStickyOffset: 80,
    toolbarAdaptive: true,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: false,
    askBeforePasteFromWord: false,
    imageDefaultWidth: 300,
    imageUpload: true,
    imageResize: true,
    imageMove: true,
    saveSelection: false,
    autofocus: false,
    useSplitMode: false,
    buttons: [
      'source', '|',
      'bold', 'strikethrough', 'underline', 'italic', '|',
      'ul', 'ol', '|',
      'outdent', 'indent', '|',
      'font', 'fontsize', 'brush', 'paragraph', '|',
      'image', 'video', 'table', 'link', '|',
      'align', 'undo', 'redo', '|',
      'hr', 'eraser', 'copyformat', '|',
      'symbol', 'fullsize', 'print', 'about'
    ],
    uploader: {
      insertImageAsBase64URI: true
    }
  };

  const handleEditorChange = (newContent: string) => {
    setEditorContent(newContent);
    setValue('content', newContent, { shouldValidate: true });
  };

  const handleThumbnailChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveThumbnail = () => {
    setThumbnailFile(null);
    setThumbnailPreview('');
    const fileInput = document.getElementById('thumbnail') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  useEffect(() => {
    if (id) {
      const post = getPost(id);
      if (post) {
        setValue('title', post.title);
        setValue('description', post.description);
        setValue('content', post.content);
        setValue('category', post.category);
        setValue('status', post.status);
        setEditorContent(post.content);
        if (post.thumbnailUrl) {
          setThumbnailPreview(post.thumbnailUrl);
        }
      }
    }
  }, [id, getPost, setValue]);

  const onSubmit = async (data: EditPostFormData) => {
    if (!id) return;

    console.log(data.content)
    if (!data.content.trim() || data.content == "<p><br></p>") {
      showToast.error('Nội dung là bắt buộc');
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmUpdate = async () => {
    if (!id) return;

    try {
      await postService.updatePost(parseInt(id), {
        post: {
          title: title,
          description: description,
          content: content,
          category: category,
          status: status,
          image: thumbnailFile || undefined
        }
      });

      await fetchPosts();
      showToast.success('Cập nhật bài viết thành công!');
      navigate('/admin/posts');
    } catch (error) {
      showToast.error('Có lỗi xảy ra khi cập nhật bài viết');
    } finally {
      setIsConfirmModalOpen(false);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Chỉnh sửa bài viết</h1>
          </div>
          <div className="flex flex-row gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/posts')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Quay lại
            </Button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <Tabs defaultValue="editor" className="w-full">
            <TabsList className="grid w-full md:w-80 grid-cols-2">
              <TabsTrigger value="editor">Chỉnh sửa</TabsTrigger>
              <TabsTrigger value="preview">Xem trước</TabsTrigger>
            </TabsList>
            
            <TabsContent value="editor" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Thông tin bài viết</CardTitle>
                  <CardDescription>
                    Cập nhật thông tin cho bài viết
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Tiêu đề</Label>
                      <Input 
                        id="title"
                        placeholder="Nhập tiêu đề bài viết" 
                        {...register('title')}
                      />
                      {errors.title && (
                        <p className="text-sm text-red-500">{errors.title.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Mô tả</Label>
                      <Input 
                        id="description"
                        placeholder="Nhập mô tả bài viết" 
                        {...register('description')}
                      />
                      {errors.description && (
                        <p className="text-sm text-red-500">{errors.description.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="category">Danh mục</Label>
                      <select 
                        id="category"
                        {...register('category')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">Chọn danh mục</option>
                        <option value="news">Tin tức</option>
                        <option value="finance">Tài chính</option>
                      </select>
                      {errors.category && (
                        <p className="text-sm text-red-500">{errors.category.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Trạng thái</Label>
                      <select 
                        id="status"
                        {...register('status')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="pending">Chờ duyệt</option>
                        <option value="publish">Xuất bản</option>
                      </select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="thumbnail">Ảnh đại diện</Label>
                      <div className="flex items-center gap-4">
                        <Button 
                          variant="outline" 
                          type="button"
                          onClick={() => document.getElementById('thumbnail')?.click()}
                          className="flex items-center gap-2"
                        >
                          <FileImage className="h-4 w-4" />
                          Chọn ảnh
                        </Button>
                        <Input 
                          id="thumbnail"
                          type="file"
                          accept="image/*"
                          onChange={handleThumbnailChange}
                          className="hidden"
                        />
                        <span className="text-sm text-muted-foreground">
                          {thumbnailFile ? thumbnailFile.name : 'Chưa chọn ảnh'}
                        </span>
                      </div>
                      {thumbnailPreview && (
                        <div className="mt-4">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-sm text-muted-foreground">Xem trước:</p>
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="h-8" 
                              onClick={handleRemoveThumbnail}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Xóa
                            </Button>
                          </div>
                          <img 
                            src={thumbnailPreview} 
                            alt="Thumbnail preview" 
                            className="max-h-[200px] max-w-full object-contain border rounded"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Nội dung bài viết</CardTitle>
                  <CardDescription>
                    Cập nhật nội dung bài viết
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <input type="hidden" {...register('content')} />
                  <JoditEditor
                    ref={editor}
                    value={editorContent}
                    config={config}
                    onBlur={handleEditorChange}
                    onChange={() => {}}
                  />
                  {errors.content && (
                    <p className="text-sm text-red-500 mt-2">{errors.content.message}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button variant="outline" onClick={() => navigate('/admin/posts')}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    <Save className="mr-2 h-4 w-4" />
                    {isSubmitting ? 'Đang lưu...' : 'Lưu thay đổi'}
                  </Button>
                </CardFooter>
              </Card>
            </TabsContent>
            
            <TabsContent value="preview" className="space-y-4">
              <PostPreview
                title={title}
                description={description}
                content={content}
                category={category}
                status={status}
                thumbnailPreview={thumbnailPreview}
                isSubmitting={isSubmitting}
                onSave={handleSubmit(onSubmit)}
                onCancel={() => navigate('/admin/posts')}
              />
            </TabsContent>
          </Tabs>
        </form>
      </div>

      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Xác nhận cập nhật bài viết</DialogTitle>
            <DialogDescription>
              Bạn có chắc chắn muốn cập nhật bài viết này? Bài viết sẽ được cập nhật với trạng thái: <span className="text-red-500 font-bold">{status === 'pending' ? 'Chờ duyệt' : 'Đã xuất bản'}</span>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsConfirmModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleConfirmUpdate} disabled={isSubmitting}>
              {isSubmitting ? 'Đang cập nhật...' : 'Xác nhận cập nhật'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default EditPost;
