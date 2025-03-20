
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Link, useNavigate } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';
import { FileText, Plus, Eye, Edit, Trash, AlertTriangle } from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout';
import { usePosts } from '@/contexts/PostsContext';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const statusColors = {
  published: "bg-green-100 text-green-800",
  draft: "bg-gray-100 text-gray-800",
  review: "bg-yellow-100 text-yellow-800"
};

const Posts = () => {
  const { posts, deletePost } = usePosts();
  const navigate = useNavigate();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const handleView = (id: string) => {
    navigate(`/admin/posts/detail/${id}`);
  };

  const handleEdit = (id: string) => {
    navigate(`/admin/posts/edit/${id}`);
  };

  const handleDeleteClick = (id: string) => {
    setPostToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (postToDelete) {
      deletePost(postToDelete);
      toast.success('Post deleted successfully');
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  return (
    <AdminLayout>
      <div className="flex flex-col space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Posts</h1>
            <p className="text-muted-foreground">Manage your blog posts and articles</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2">
            <Button asChild>
              <Link to="/admin/posts/create">
                <Plus className="mr-2 h-4 w-4" />
                Create Post
              </Link>
            </Button>
          </div>
        </div>
        
        <Separator />
        
        {/* Posts List */}
        <Card>
          <CardHeader>
            <CardTitle>All Posts</CardTitle>
            <CardDescription>View and manage all your posts</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Title</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Category</th>
                    <th className="text-left py-3 px-4 font-medium hidden md:table-cell">Author</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium hidden sm:table-cell">Date</th>
                    <th className="text-center py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.map((post) => (
                    <tr key={post.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4">
                        <div className="flex items-start gap-2">
                          <FileText className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
                          <div>
                            <div className="font-medium">{post.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-1">{post.excerpt}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">
                        <span className="px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                          {post.category}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden md:table-cell">{post.author}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 rounded-full text-xs ${statusColors[post.status]}`}>
                          {post.status.charAt(0).toUpperCase() + post.status.slice(1)}
                        </span>
                      </td>
                      <td className="py-3 px-4 hidden sm:table-cell">{post.date}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Button variant="ghost" size="icon" title="View" onClick={() => handleView(post.id)}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Edit" onClick={() => handleEdit(post.id)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDeleteClick(post.id)}>
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
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

export default Posts;
