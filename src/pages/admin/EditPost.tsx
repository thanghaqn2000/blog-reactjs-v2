import React, { useState, useRef, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileImage, Save, ArrowLeft } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { useToast } from '@/hooks/use-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { usePosts } from '@/contexts/PostsContext';
import { toast } from 'sonner';

const EditPost = () => {
  const { id } = useParams<{ id: string }>();
  const { getPost, updatePost } = usePosts();
  const editor = useRef(null);
  const [content, setContent] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [featured, setFeatured] = useState(false);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState<File | null>(null);
  const [excerpt, setExcerpt] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState<'published' | 'draft' | 'review'>('draft');
  const { toast: toastNotification } = useToast();
  const navigate = useNavigate();

  // Jodit configuration - modified to prevent editor from jumping
  const config = {
    readonly: false,
    height: 500,
    toolbar: true,
    spellcheck: true,
    toolbarSticky: true,
    toolbarStickyOffset: 80, // Add an offset to avoid overlapping with other elements
    toolbarAdaptive: true,
    showCharsCounter: true,
    showWordsCounter: true,
    showXPathInStatusbar: false,
    askBeforePasteHTML: true,
    askBeforePasteFromWord: true,
    imageDefaultWidth: 300,
    imageUpload: true,
    imageResize: true,
    imageMove: true,
    saveSelection: false, // Added to fix cursor jumping
    autofocus: false,    // Prevent auto focusing which can cause jumps
    useSplitMode: false, // Using full editor mode, not split mode
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

  // Changed to use onBlur instead of onChange to prevent jumping
  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
  };

  // Load post data on component mount
  useEffect(() => {
    if (id) {
      const post = getPost(id);
      if (post) {
        setTitle(post.title);
        setContent(post.content);
        setExcerpt(post.excerpt);
        setCategory(post.category);
        setAuthor(post.author);
        setStatus(post.status);
        setFeatured(post.featured || false);
        if (post.thumbnailUrl) {
          setThumbnailPreview(post.thumbnailUrl);
        }
      } else {
        // Post not found, navigate back to posts list
        toast.error('Post not found');
        navigate('/admin/posts');
      }
    }
  }, [id, getPost, navigate]);

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

  const handleSubmit = () => {
    if (!title.trim()) {
      toastNotification({
        title: "Error",
        description: "Please enter a post title",
        variant: "destructive"
      });
      return;
    }

    if (!content.trim()) {
      toastNotification({
        title: "Error",
        description: "Please enter some content for your post",
        variant: "destructive"
      });
      return;
    }

    if (!id) {
      toast.error('Post ID is missing');
      return;
    }

    // Update post
    updatePost({
      id,
      title,
      content,
      excerpt: excerpt || title,
      category: category || 'Uncategorized',
      author,
      status,
      date: getPost(id)?.date || new Date().toISOString().split('T')[0],
      thumbnailUrl: thumbnailPreview || undefined,
      featured
    });

    // Show success message
    toast.success('Post updated successfully!');
    
    // Navigate to the post detail view
    navigate(`/admin/posts/detail/${id}`);
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Edit Post</h1>
            <p className="text-muted-foreground">Update your post content and settings</p>
          </div>
          <div className="flex flex-row gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/posts')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Button>
          </div>
        </div>

        <Tabs defaultValue="editor" className="w-full">
          <TabsList className="grid w-full md:w-80 grid-cols-2">
            <TabsTrigger value="editor">Editor</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="editor" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Post Details</CardTitle>
                <CardDescription>
                  Update the basic information for your post
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input 
                      id="title"
                      placeholder="Enter post title" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="excerpt">Excerpt</Label>
                    <Input 
                      id="excerpt"
                      placeholder="Enter post excerpt (short description)" 
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input 
                      id="category"
                      placeholder="Enter post category" 
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <select 
                      id="status"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as 'published' | 'draft' | 'review')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <option value="draft">Draft</option>
                      <option value="review">In Review</option>
                      <option value="published">Published</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="thumbnail">Featured Image</Label>
                    <div className="flex items-center gap-4">
                      <Button 
                        variant="outline" 
                        onClick={() => document.getElementById('thumbnail')?.click()}
                        className="flex items-center gap-2"
                      >
                        <FileImage className="h-4 w-4" />
                        Choose Image
                      </Button>
                      <Input 
                        id="thumbnail"
                        type="file"
                        accept="image/*"
                        onChange={handleThumbnailChange}
                        className="hidden"
                      />
                      <span className="text-sm text-muted-foreground">
                        {thumbnailFile ? thumbnailFile.name : thumbnailPreview ? 'Current image' : 'No file chosen'}
                      </span>
                    </div>
                    {thumbnailPreview && (
                      <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">Preview:</p>
                        <img 
                          src={thumbnailPreview} 
                          alt="Thumbnail preview" 
                          className="max-h-[200px] max-w-full object-contain border rounded"
                        />
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <input 
                        type="checkbox"
                        id="featured"
                        checked={featured}
                        onChange={(e) => setFeatured(e.target.checked)}
                        className="h-4 w-4"
                      />
                      <Label htmlFor="featured">Featured Post</Label>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Featured posts will appear on the homepage
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Post Content</CardTitle>
                <CardDescription>
                  Edit your post content using the rich text editor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <JoditEditor
                  ref={editor}
                  value={content}
                  config={config}
                  onBlur={handleEditorChange}
                  onChange={() => {}}
                />
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/admin/posts')}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
          
          <TabsContent value="preview" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Post Preview</CardTitle>
                <CardDescription>
                  Preview how your post will look when published
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {thumbnailPreview && (
                  <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
                    <img 
                      src={thumbnailPreview} 
                      alt={title} 
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div>
                  <h1 className="text-3xl font-bold">{title || "Untitled Post"}</h1>
                  {category && (
                    <div className="mt-2">
                      <span className="inline-block px-3 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary">
                        {category}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="prose max-w-none dark:prose-invert">
                  <div dangerouslySetInnerHTML={{ __html: content }} />
                </div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => navigate('/admin/posts')}>
                  Cancel
                </Button>
                <Button onClick={handleSubmit}>
                  <Save className="mr-2 h-4 w-4" />
                  Save Changes
                </Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default EditPost;
