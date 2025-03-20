
import React from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Edit, Trash, AlertTriangle } from 'lucide-react';
import AdminLayout from '@/layouts/AdminLayout';
import { usePosts } from '@/contexts/PostsContext';
import { toast } from 'sonner';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';

const statusColors = {
  published: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  review: "bg-yellow-100 text-yellow-800"
};

const PostDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getPost, deletePost } = usePosts();
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);

  // Get post data
  const post = id ? getPost(id) : undefined;

  // Handle post not found
  if (!post) {
    return (
      <AdminLayout>
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <h2 className="text-2xl font-bold">Post Not Found</h2>
          <p className="text-muted-foreground mb-4">The post you're looking for doesn't exist or has been removed.</p>
          <Button onClick={() => navigate('/admin/posts')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Posts
          </Button>
        </div>
      </AdminLayout>
    );
  }

  const handleEdit = () => {
    navigate(`/admin/posts/edit/${id}`);
  };

  const handleDelete = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (id) {
      deletePost(id);
      setDeleteDialogOpen(false);
      toast.success('Post deleted successfully');
      navigate('/admin/posts');
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Post Details</h1>
            <p className="text-muted-foreground">View and manage post details</p>
          </div>
          <div className="flex flex-row gap-2">
            <Button variant="outline" onClick={() => navigate('/admin/posts')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Posts
            </Button>
            <Button variant="outline" onClick={handleEdit}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Post Meta Information */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader>
              <CardTitle>Post Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground">ID</div>
                <div>{post.id}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Date</div>
                <div>{post.date}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Author</div>
                <div>{post.author}</div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Category</div>
                <div>
                  <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                    {post.category}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Status</div>
                <div>
                  <span className={`px-2 py-1 rounded-full text-xs ${statusColors[post.status]}`}>
                    {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                  </span>
                </div>
              </div>
              
              <div>
                <div className="text-sm font-medium text-muted-foreground">Featured</div>
                <div>{post.featured ? 'Yes' : 'No'}</div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Post Content</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Post title and featured image */}
              {post.thumbnailUrl && (
                <div className="w-full aspect-video bg-muted rounded-lg overflow-hidden">
                  <img 
                    src={post.thumbnailUrl} 
                    alt={post.title} 
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div>
                <h1 className="text-3xl font-bold">{post.title}</h1>
                <p className="text-muted-foreground mt-2">{post.excerpt}</p>
              </div>
              
              <Separator />
              
              {/* Post content */}
              <div className="prose max-w-none dark:prose-invert">
                <div dangerouslySetInnerHTML={{ __html: post.content }} />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirm Deletion
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this post? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default PostDetail;
