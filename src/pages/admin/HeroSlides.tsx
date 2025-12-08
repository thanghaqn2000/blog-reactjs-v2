import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showToast } from "@/config/toast.config";
import AdminLayout from '@/layouts/AdminLayout';
import { zodResolver } from '@hookform/resolvers/zod';
import { ArrowUpDown, ImagePlus, Plus, Save, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

// Define the slide structure
interface Slide {
  id: number;
  url: string;
  alt: string;
  heading: string;
  description: string;
  file?: File;
}

// Default placeholder image for new slides
const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920';

// Initial slides from the Hero component
const initialSlides: Slide[] = [
  {
    id: 1,
    url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Stock market trading',
    heading: 'Empower Your Investment Journey',
    description: 'In-depth analysis and real-time market insights to help you make informed decisions.'
  },
  {
    id: 2,
    url: 'https://images.unsplash.com/photo-1519389950473-47ba0277781c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Financial team meeting',
    heading: 'Expert Financial Analysis',
    description: 'Get access to expert opinions and comprehensive market research.'
  },
  {
    id: 3,
    url: 'https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Digital finance technology',
    heading: 'Future of Digital Finance',
    description: 'Stay ahead with insights on blockchain, cryptocurrencies, and financial technology.'
  },
  {
    id: 4,
    url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Global markets data',
    heading: 'Global Market Trends',
    description: 'Explore international market trends and investment opportunities worldwide.'
  },
  {
    id: 5,
    url: 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920',
    alt: 'Retirement planning',
    heading: 'Secure Your Financial Future',
    description: 'Learn strategies for long-term wealth building and retirement planning.'
  }
];

// Form schema for slide validation
const slideSchema = z.object({
  heading: z.string().min(3, { message: "Heading must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  alt: z.string().min(3, { message: "Alt text must be at least 3 characters" }),
});

// Form schema for new slide
const newSlideSchema = z.object({
  heading: z.string().min(3, { message: "Heading must be at least 3 characters" }),
  description: z.string().min(10, { message: "Description must be at least 10 characters" }),
  alt: z.string().min(3, { message: "Alt text must be at least 3 characters" }),
});

const HeroSlides = () => {
  const [slides, setSlides] = useState<Slide[]>(() => {
    // Try to get saved slides from localStorage
    const savedSlides = localStorage.getItem('heroSlides');
    return savedSlides ? JSON.parse(savedSlides) : initialSlides;
  });
  const [activeSlide, setActiveSlide] = useState<Slide | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSlideImage, setNewSlideImage] = useState<string | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  // Setup form for editing slides
  const form = useForm<z.infer<typeof slideSchema>>({
    resolver: zodResolver(slideSchema),
    defaultValues: {
      heading: "",
      description: "",
      alt: "",
    },
  });

  // Setup form for creating new slides
  const newSlideForm = useForm<z.infer<typeof newSlideSchema>>({
    resolver: zodResolver(newSlideSchema),
    defaultValues: {
      heading: "New Slide",
      description: "Description for the new slide goes here.",
      alt: "New slide image",
    },
  });

  // Handle slide selection
  const handleSelectSlide = (slide: Slide) => {
    setActiveSlide(slide);
    setPreviewImage(slide.url);
    form.reset({
      heading: slide.heading,
      description: slide.description,
      alt: slide.alt,
    });
  };

  // Handle image upload for existing slide
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!activeSlide) {
      showToast.error("Please select a slide first");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image size should be less than 5MB");
      return;
    }

    // Preview the image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setPreviewImage(event.target.result as string);
        
        // Store the file for later processing
        setActiveSlide(prev => {
          if (!prev) return null;
          return { ...prev, file };
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle image upload for new slide
  const handleNewSlideImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      showToast.error("Image size should be less than 5MB");
      return;
    }

    setUploadedFile(file);

    // Preview the image
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewSlideImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Handle form submission for editing slides
  const onSubmit = (values: z.infer<typeof slideSchema>) => {
    if (!activeSlide) {
      showToast.error("No slide selected");
      return;
    }

    // Create a new URL if file was uploaded
    let newUrl = activeSlide.url;
    if (previewImage && previewImage !== activeSlide.url) {
      newUrl = previewImage;
    }

    // Update slides array
    const updatedSlides = slides.map(slide => 
      slide.id === activeSlide.id 
        ? { 
            ...slide, 
            heading: values.heading, 
            description: values.description, 
            alt: values.alt,
            url: newUrl
          } 
        : slide
    );
    
    setSlides(updatedSlides);
    // Save to localStorage for persistence
    localStorage.setItem('heroSlides', JSON.stringify(updatedSlides));
    showToast.success("Slide updated successfully");
  };

  // Create a new slide
  const createNewSlide = (values: z.infer<typeof newSlideSchema>) => {
    // Generate a new ID (one higher than the current max ID)
    const newId = Math.max(...slides.map(slide => slide.id), 0) + 1;
    
    // Create the new slide
    const newSlide: Slide = {
      id: newId,
      url: newSlideImage || DEFAULT_IMAGE,
      alt: values.alt,
      heading: values.heading,
      description: values.description,
    };
    
    // Add the new slide to the collection
    const updatedSlides = [...slides, newSlide];
    setSlides(updatedSlides);
    
    // Save to localStorage for persistence
    localStorage.setItem('heroSlides', JSON.stringify(updatedSlides));
    
    // Close the dialog and reset the form
    setIsCreateDialogOpen(false);
    setNewSlideImage(null);
    setUploadedFile(null);
    newSlideForm.reset({
      heading: "New Slide",
      description: "Description for the new slide goes here.",
      alt: "New slide image",
    });
    
    showToast.success("New slide created successfully");
    
    // Select the new slide for editing
    handleSelectSlide(newSlide);
  };

  // Remove a slide
  const removeSlide = (slideId: number) => {
    // Prevent removing all slides
    if (slides.length <= 1) {
      showToast.error("Cannot remove the last slide. At least one slide must remain.");
      return;
    }
    
    // Remove the slide from the array
    const updatedSlides = slides.filter(slide => slide.id !== slideId);
    setSlides(updatedSlides);
    
    // Save to localStorage for persistence
    localStorage.setItem('heroSlides', JSON.stringify(updatedSlides));
    
    // If the active slide was removed, clear the active slide
    if (activeSlide?.id === slideId) {
      setActiveSlide(null);
      setPreviewImage(null);
    }
    
    showToast.success("Slide removed successfully");
  };

  // Move slide up or down in the order
  const moveSlide = (slideId: number, direction: 'up' | 'down') => {
    const slideIndex = slides.findIndex(s => s.id === slideId);
    if (
      (direction === 'up' && slideIndex === 0) || 
      (direction === 'down' && slideIndex === slides.length - 1)
    ) {
      return; // Can't move further
    }
    
    const newSlides = [...slides];
    const targetIndex = direction === 'up' ? slideIndex - 1 : slideIndex + 1;
    
    // Swap positions
    [newSlides[slideIndex], newSlides[targetIndex]] = [newSlides[targetIndex], newSlides[slideIndex]];
    
    setSlides(newSlides);
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

  const handleSaveAll = () => {
    // Logic to save all changes
    showToast.success("All changes saved");
  };

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
                      <div className="flex flex-wrap gap-2">
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
                            onClick={removeNewSlideImage}
                          >
                            <X className="mr-2 h-4 w-4" />
                            Xóa hình ảnh
                          </Button>
                        )}
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
                    
                    <FormField
                      control={newSlideForm.control}
                      name="alt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Alt Text</FormLabel>
                          <FormControl>
                            <Input placeholder="Image alt text" {...field} />
                          </FormControl>
                          <FormDescription>
                            Mô tả hình ảnh cho truy cập bằng văn bản
                          </FormDescription>
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
            
            <Button onClick={handleSaveAll}>
              <Save className="mr-2 h-4 w-4" /> Lưu tất cả thay đổi
            </Button>
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
                              <img src={slide.url} alt={slide.alt} className="h-full w-full object-cover" />
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
                        <div className="flex flex-wrap gap-2">
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
                              onClick={removeUploadedImage}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Xóa hình ảnh đã tải lên
                            </Button>
                          )}
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
                          
                          <FormField
                            control={form.control}
                            name="alt"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Mô tả hình ảnh</FormLabel>
                                <FormControl>
                                  <Input placeholder="Image alt text" {...field} />
                                </FormControl>
                                <FormDescription>
                                  Mô tả hình ảnh cho truy cập bằng văn bản
                                </FormDescription>
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
                            alt={activeSlide.alt}
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
