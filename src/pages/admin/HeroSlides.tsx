import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showToast } from "@/config/toast.config";
import AdminLayout from '@/layouts/AdminLayout';
import { postService } from '@/services/admin/post.service';
import { slideService } from '@/services/admin/slide.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpDown, ImagePlus, Loader2, Plus, Trash2, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define the slide structure
interface Slide {
  id: number;
  url: string;
  heading: string;
  description: string;
  file?: File;
}

// Default placeholder image for new slides
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920';

// Form schema for slide validation
const slideSchema = z.object({
  heading: z.string().min(3, { message: "Heading must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
});

// Form schema for new slide
const newSlideSchema = z.object({
  heading: z.string().min(3, { message: "Heading must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
});

const HeroSlides = () => {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [activeSlide, setActiveSlide] = useState<Slide | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSlideImage, setNewSlideImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Setup form for editing slides
  const form = useForm<z.infer<typeof slideSchema>>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      heading: "",
      description: "",
    },
  });

  // Setup form for creating new slides
  const newSlideForm = useForm<z.infer<typeof newSlideSchema>>({
    resolver: zodResolver(newSlideSchema),
    defaultValues: {
      heading: "New Slide",
      description: "Description for the new slide goes here.",
    },
  });

  // Helper: upload image to S3 via presign URL and return image_key
  const uploadImageAndGetKey = async (file: File): Promise<string | null> => {
    try {
      const presign = await postService.presignUrl({
        filename: file.name,
        content_type: file.type,
      });

      const uploadResp = await fetch(presign.url, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadResp.ok) {
        showToast.error('Upload ảnh slide lên S3 thất bại');
        return null;
      }

      return presign.key;
    } catch (error) {
      showToast.error('Có lỗi khi tạo URL upload ảnh slide');
      return null;
    }
  };

  // Load slides from API on mount
  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const data = await slideService.getSlides();
        const mapped: Slide[] = data.map((s) => ({
          id: s.id,
          url: s.image_url,
          heading: s.heading,
          description: s.description,
        }));
        setSlides(mapped);
        if (mapped.length > 0) {
          handleSelectSlide(mapped[0]);
        }
      } catch (error) {
        showToast.error('Không tải được danh sách slide');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSlides();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Handle slide selection
  const handleSelectSlide = (slide: Slide) => {
    setActiveSlide(slide);
    setPreviewImage(slide.url);
    form.reset({
      heading: slide.heading,
      description: slide.description,
    });
  };

  const handleSelectedSlideFile = (file: File) => {
    if (!activeSlide) {
      showToast.error("Please select a slide first");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
        setActiveSlide((prev) => {
          if (!prev) return null;
          return { ...prev, file };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload for existing slide (from file input)
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleSelectedSlideFile(file);
  };

  // Paste image for existing slide
  const handleImagePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    if (!activeSlide) return;
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          handleSelectedSlideFile(file);
        }
        break;
      }
    }
  };

  const handleNewSlideFile = (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image size should be less than 5MB");
      return;
    }

    setUploadedFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewSlideImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload for new slide
  const handleNewSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    handleNewSlideFile(file);
  };

  // Paste image for new slide
  const handleNewSlideImagePaste = (event: React.ClipboardEvent<HTMLDivElement>) => {
    const items = event.clipboardData?.items;
    if (!items) return;

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (item.kind === "file" && item.type.startsWith("image/")) {
        const file = item.getAsFile();
        if (file) {
          event.preventDefault();
          handleNewSlideFile(file);
        }
        break;
      }
    }
  };

  // Handle form submission for editing slides
  const onSubmit = async (values: z.infer<typeof slideSchema>) => {
    if (!activeSlide) {
      showToast.error("No slide selected");
      return;
    }

    try {
      let imageKey: string | undefined;

      if (activeSlide.file) {
        const key = await uploadImageAndGetKey(activeSlide.file);
        if (!key) return;
        imageKey = key;
      }

      const payload: { slide: { heading: string; description: string; image_key?: string } } = {
        slide: {
          heading: values.heading,
          description: values.description,
        },
      };

      if (imageKey) {
        payload.slide.image_key = imageKey;
      }

      const updated = await slideService.updateSlide(activeSlide.id, payload);

      const newSlides = slides.map((slide) =>
        slide.id === activeSlide.id
          ? {
              ...slide,
              heading: updated.heading,
              description: updated.description,
              url: updated.image_url,
              file: undefined,
            }
          : slide
      );

      setSlides(newSlides);
      const refreshed = newSlides.find((s) => s.id === activeSlide.id) || null;
      setActiveSlide(refreshed);
      setPreviewImage(refreshed?.url || null);

      showToast.success("Slide updated successfully");
    } catch (error) {
      showToast.error("Có lỗi khi cập nhật slide");
    }
  };

  // Create a new slide
  const createNewSlide = async (values: z.infer<typeof newSlideSchema>) => {
    try {
      if (!uploadedFile) {
        showToast.error("Vui lòng tải lên hình ảnh cho slide");
        return;
      }

      const imageKey = await uploadImageAndGetKey(uploadedFile);
      if (!imageKey) return;

      const created = await slideService.createSlide({
        slide: {
          heading: values.heading,
          description: values.description,
          image_key: imageKey,
        },
      });

      const newSlide: Slide = {
        id: created.id,
        url: created.image_url,
        heading: created.heading,
        description: created.description,
      };

      const updatedSlides = [...slides, newSlide];
      setSlides(updatedSlides);

      setIsCreateDialogOpen(false);
      setNewSlideImage(null);
      setUploadedFile(null);
      newSlideForm.reset({
        heading: "New Slide",
        description: "Description for the new slide goes here.",
      });

      showToast.success("New slide created successfully");
      handleSelectSlide(newSlide);
    } catch (error) {
      showToast.error("Có lỗi khi tạo slide mới");
    }
  };

  // Remove a slide
  const removeSlide = async (slideId: number) => {
    // Prevent removing all slides
    if (slides.length <= 1) {
      showToast.error("Cannot remove the last slide. At least one slide must remain.");
      return;
    }
    try {
      await slideService.deleteSlide(slideId);

      const updatedSlides = slides.filter(slide => slide.id !== slideId);
      setSlides(updatedSlides);

      if (activeSlide?.id === slideId) {
        const next = updatedSlides[0] ?? null;
        setActiveSlide(next);
        setPreviewImage(next?.url || null);
      }

      showToast.success("Slide removed successfully");
    } catch (error) {
      showToast.error("Có lỗi khi xoá slide");
    }
  };

  // Move slide up or down in the order & sync with backend
  const moveSlide = async (slideId: number, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex(s => s.id === slideId);
    if (
      (direction === 'up' && slideIndex === 0) || 
      (direction === 'down' && slideIndex === slides.length - 1)
    ) {
      return; // Can't move further
    }
    
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;

    // Swap positions trong state để UI phản hồi ngay
    [newSlides[slideIndex], newSlides[targetIndex]] = [
      newSlides[targetIndex],
      newSlides[slideIndex],
    ];

    setSlides(newSlides);

    try {
      const orderedIds = newSlides.map((s) => s.id);
      await slideService.reorderSlides(orderedIds);
      showToast.success("Cập nhật thứ tự slide thành công");
    } catch (error) {
      showToast.error("Có lỗi khi cập nhật thứ tự slide");
      // Optionally: refetch lại từ server để tránh lệch trạng thái
    }
  };

  // Remove image from preview (reset to original)
  const removeUploadedImage = () => {
    if (!activeSlide) return;
    setPreviewImage(activeSlide.url);
    setActiveSlide(prev => {
      if (!prev) return null;
      return { ...prev, file: undefined };
    });
  };

  // Remove uploaded image for new slide
  const removeNewSlideImage = () => {
    setNewSlideImage(null);
    setUploadedFile(null);
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex h-[calc(100vh-80px)] items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="h-8 w-8 animate-spin" />
            <p className="text-sm">Đang tải danh sách slide...</p>
          </div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">Quản lí slide</h1>
          <div className="flex items-center gap-2">
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" /> Tạo slide mới
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Tạo slide mới</DialogTitle>
                  <DialogDescription>
                    Thêm một slide mới vào carousel của bạn. Tải lên hình ảnh và cung cấp chi tiết bên dưới.
                  </DialogDescription>
                </DialogHeader>
                
                <Form {...newSlideForm}>
                  <form onSubmit={newSlideForm.handleSubmit(createNewSlide)} className="space-y-4">
                    {/* Image Upload */}
                    <div className="space-y-2">
                      <Label>Hình ảnh slide</Label>
                      <div className="mb-2">
                        <AspectRatio ratio={16 / 9} className="bg-muted overflow-hidden rounded-md border">
                          {newSlideImage ? (
                            <img 
                              src={newSlideImage} 
                              alt="New slide preview" 
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full w-full bg-muted">
                              <ImagePlus className="h-10 w-10 text-muted-foreground" />
                            </div>
                          )}
                        </AspectRatio>
                      </div>
                      <div
                        className="flex flex-col gap-2 rounded-md border border-dashed border-muted-foreground/40 p-3 cursor-pointer hover:bg-muted/40"
                        onClick={() => {
                          const input = document.getElementById("new-slide-image") as HTMLInputElement | null;
                          input?.click();
                        }}
                        onPaste={handleNewSlideImagePaste}
                        tabIndex={0}
                      >
                        <div className="flex flex-wrap gap-2 items-center">
                          <Label 
                            htmlFor="new-slide-image" 
                            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90"
                          >
                            <ImagePlus className="mr-2 h-4 w-4" />
                            Tải lên hình ảnh
                          </Label>
                          <Input 
                            id="new-slide-image" 
                            type="file" 
                            accept="image/*"
                            className="hidden" 
                            onChange={handleNewSlideImageUpload}
                          />
                          {newSlideImage && (
                            <Button 
                              type="button"
                              variant="outline" 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeNewSlideImage();
                              }}
                            >
                              <X className="mr-2 h-4 w-4" />
                              Xóa hình ảnh
                            </Button>
                          )}
                        </div>
                        <span className="text-sm text-muted-foreground">
                          Click để chọn ảnh hoặc paste (Ctrl + V)
                        </span>
                      </div>
                    </div>
                    
                    {/* Form Fields */}
                    <FormField
                      control={newSlideForm.control}
                      name="heading"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tiêu đề</FormLabel>
                          <FormControl>
                            <Input placeholder="Tiêu đề slide" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={newSlideForm.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mô tả</FormLabel>
                          <FormControl>
                            <Input placeholder="Mô tả slide" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <DialogFooter>
                      <Button type="submit" className="w-full">
                        Tạo slide
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
            
          </div>
        </div>

        <Tabs defaultValue="slides" className="w-full">
          <TabsList>
            <TabsTrigger value="slides">Quản lí slide</TabsTrigger>
            <TabsTrigger value="preview">Xem trước</TabsTrigger>
          </TabsList>
          
          <TabsContent value="slides" className="space-y-4">
            <div className="grid md:grid-cols-3 gap-6">
              {/* Slides List */}
              <div className="md:col-span-1 space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quản lí slide</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {slides.map((slide) => (
                        <div 
                          key={slide.id} 
                          className={`p-2 border rounded-md cursor-pointer transition-colors flex items-center justify-between ${
                            activeSlide?.id === slide.id ? 'border-primary bg-primary/5' : 'border-gray-200'
                          }`}
                          onClick={() => handleSelectSlide(slide)}
                        >
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded overflow-hidden">
                              <img src={slide.url} alt={slide.heading} className="h-full w-full object-cover" />
                            </div>
                            <span className="font-medium text-sm truncate max-w-[120px]">
                              {slide.heading}
                            </span>
                          </div>
                          <div className="flex gap-1">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6" 
                              onClick={(e) => {
                                e.stopPropagation();
                                moveSlide(slide.id, 'up');
                              }}
                            >
                              <ArrowUpDown className="h-3.5 w-3.5" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10" 
                              onClick={(e) => {
                                e.stopPropagation();
                                removeSlide(slide.id);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Slide Editor */}
              <div className="md:col-span-2">
                {activeSlide ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Chỉnh sửa slide</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Image Upload */}
                      <div className="space-y-2">
                        <Label>Hình ảnh slide</Label>
                        <div className="mb-4">
                          <AspectRatio ratio={16 / 9} className="bg-muted overflow-hidden rounded-md border">
                            {previewImage && (
                              <img 
                                src={previewImage} 
                                alt="Preview" 
                                className="w-full h-full object-cover" 
                              />
                            )}
                          </AspectRatio>
                        </div>
                        <div
                          className="flex flex-col gap-2 rounded-md border border-dashed border-muted-foreground/40 p-3 cursor-pointer hover:bg-muted/40"
                          onClick={() => {
                            const input = document.getElementById("image-upload") as HTMLInputElement | null;
                            input?.click();
                          }}
                          onPaste={handleImagePaste}
                          tabIndex={0}
                        >
                          <div className="flex flex-wrap gap-2 items-center">
                            <Label 
                              htmlFor="image-upload" 
                              className="inline-flex h-9 cursor-pointer items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:ring-offset-2"
                            >
                              <ImagePlus className="mr-2 h-4 w-4" />
                              Tải lên hình ảnh
                            </Label>
                            <Input 
                              id="image-upload" 
                              type="file" 
                              accept="image/*"
                              className="hidden" 
                              onChange={handleImageUpload}
                            />
                            {previewImage !== activeSlide.url && (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  removeUploadedImage();
                                }}
                              >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Xóa hình ảnh đã tải lên
                              </Button>
                            )}
                          </div>
                          <span className="text-sm text-muted-foreground">
                            Click để chọn ảnh hoặc paste (Ctrl + V)
                          </span>
                        </div>
                      </div>

                      {/* Form */}
                      <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                          <FormField
                            control={form.control}
                            name="heading"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Tiêu đề</FormLabel>
                                <FormControl>
                                  <Input placeholder="Tiêu đề slide" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mô tả</FormLabel>
                                <FormControl>
                                  <Input placeholder="Mô tả slide" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button type="submit" className="w-full">
                            Cập nhật slide
                          </Button>
                        </form>
                      </Form>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardContent className="pt-6">
                      <div className="flex flex-col items-center justify-center h-[300px] text-center">
                        <p className="text-muted-foreground">
                          Chọn một slide từ danh sách để chỉnh sửa hoặc tạo slide mới
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview">
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Xem trước cách slide sẽ hiển thị:</h3>
                  <div className="border rounded-lg overflow-hidden">
                    <AspectRatio ratio={16 / 9} className="bg-muted">
                      {activeSlide && (
                        <div className="relative h-full w-full">
                            <img 
                              src={previewImage || activeSlide.url} 
                              alt={activeSlide.heading}
                              className="h-full w-full object-cover"
                            />
                          <div className="absolute inset-0 bg-black/40"></div>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-6 text-center">
                            <h2 className="text-2xl md:text-4xl font-bold mb-2">
                              {form.watch("heading") || activeSlide.heading}
                            </h2>
                            <p className="text-sm md:text-base max-w-md">
                              {form.watch("description") || activeSlide.description}
                            </p>
                          </div>
                        </div>
                      )}
                      {!activeSlide && (
                        <div className="flex items-center justify-center h-full">
                          <p className="text-muted-foreground">
                            Chọn một slide để xem trước
                          </p>
                        </div>
                      )}
                    </AspectRatio>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    <p>Lưu ý: Xem trước cho biết sắp xếp cách slide sẽ hiển thị trên trang chủ.</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default HeroSlides;
