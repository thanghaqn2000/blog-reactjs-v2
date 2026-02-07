import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { showToast } from "@/config/toast.config";
import { useAuth } from "@/contexts/AuthContext";
import AdminLayout from '@/layouts/AdminLayout';
import { cn } from '@/lib/utils';
import { GetUsersResponse, User, userService } from '@/services/admin/user.service';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import {
  Edit,
  Filter,
  MessageCircle,
  MoreHorizontal,
  Search,
  Star,
  Trash
} from 'lucide-react';
import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import * as z from 'zod';

interface UserQuotaRow {
  total_limit: number;
  used: number;
  remaining: number;
}

interface AdminUserRow {
  id: number;
  name: string;
  email: string;
  role: string;
  status: string;
  isVip: boolean;
  joinedDate: string;
  lastLogin: string;
  userQuota?: UserQuotaRow;
}

const userFormSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  role: z.string({
    required_error: "Please select a role.",
  }),
  status: z.string({
    required_error: "Please select a status.",
  }),
  isVip: z.boolean().default(false),
  password: z.string().min(6, {
    message: "Password must be at least 6 characters.",
  }).optional(),
  notes: z.string().optional(),
  total_limit: z.coerce.number().min(0).optional(),
  used: z.coerce.number().min(0).optional(),
  remaining: z.coerce.number().min(0).optional(),
  /** Điều chỉnh quota: +20 tăng 20, -20 giảm 20. Chỉ dùng trong form Edit. */
  quota_adjustment: z.union([z.coerce.number(), z.literal("")]).optional(),
});

type UserFormValues = z.infer<typeof userFormSchema>;

const mapUserToRow = (user: User): AdminUserRow => {
  const name = user.name || user.username || `User #${user.id}`;
  const joinedRaw = user.joined_date || user.createdAt || '';
  const lastRaw = user.last_login || user.updatedAt || '-';
  const status = user.status || 'active';
  const isVip = Boolean(user.is_vip);

  const userQuota = user.user_quota
    ? {
        total_limit: user.user_quota.total_limit,
        used: user.user_quota.used,
        remaining: user.user_quota.remaining,
      }
    : undefined;

  return {
    id: user.id,
    name,
    email: user.email,
    role: user.role,
    status,
    isVip,
    joinedDate: joinedRaw ? joinedRaw.slice(0, 10) : '-',
    lastLogin: lastRaw ? String(lastRaw).slice(0, 10) : '-',
    userQuota,
  };
};

const UserManagement = () => {
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterVip, setFilterVip] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isSelfDeleteWarningOpen, setIsSelfDeleteWarningOpen] = useState(false);
  const [isUpgradeDialogOpen, setIsUpgradeDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUserRow | null>(null);
  const usersPerPage = 10;
  const dialogCloseFocusRef = useRef<HTMLDivElement>(null);

  const {
    data: usersResponse,
    isLoading: isLoadingUsers,
    refetch: refetchUsers,
  } = useQuery<GetUsersResponse>({
    queryKey: ['admin-users'],
    queryFn: () => userService.getUsers(),
    staleTime: 5 * 60 * 1000,
  });

  const apiUsers = usersResponse?.data ?? [];
  const users: AdminUserRow[] = apiUsers.map(mapUserToRow);

  const editForm = useForm<UserFormValues>({
    resolver: zodResolver(userFormSchema),
    defaultValues: {
      name: '',
      email: '',
      role: 'user',
      status: 'active',
      isVip: false,
      notes: '',
      total_limit: 0,
      used: 0,
      remaining: 0,
      quota_adjustment: undefined,
    },
  });

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      user.email.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesRoleFilter = filterRole === 'all' || user.role === filterRole;
    const matchesStatusFilter = filterStatus === 'all' || user.status === filterStatus;
    const matchesVipFilter = filterVip === 'all' || 
      (filterVip === 'vip' && user.isVip) || 
      (filterVip === 'non-vip' && !user.isVip);
    
    return matchesSearch && matchesRoleFilter && matchesStatusFilter && matchesVipFilter;
  });

  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleEditUser = async (data: UserFormValues) => {
    if (!selectedUser) return;
    try {
      const rawAdjustment = data.quota_adjustment;
      const hasQuotaAdjustment =
        rawAdjustment !== undefined &&
        rawAdjustment !== "" &&
        Number(rawAdjustment) !== 0;
      const quotaAdjustment = hasQuotaAdjustment ? Number(rawAdjustment) : undefined;

      const payload: Parameters<typeof userService.updateUser>[1] = {
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
        is_vip: data.isVip,
      };
      if (quotaAdjustment != null) {
        payload.quota_adjustment = quotaAdjustment;
      }

      const updatedUser = await userService.updateUser(selectedUser.id, payload);
      await refetchUsers();

      if (updatedUser.user_quota) {
        editForm.setValue("total_limit", updatedUser.user_quota.total_limit);
        editForm.setValue("used", updatedUser.user_quota.used);
        editForm.setValue("remaining", updatedUser.user_quota.remaining);
      }
      editForm.setValue("quota_adjustment", undefined);
      showToast.success("User updated successfully");
    } catch (error) {
      showToast.error("Có lỗi xảy ra khi cập nhật người dùng");
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    if (currentUser && selectedUser.id === currentUser.id) {
      showToast.error("Bạn không thể tự xóa chính mình");
      handleDeleteDialogClose();
      return;
    }
    try {
      await userService.deleteUser(selectedUser.id);
      await refetchUsers();
      setIsDeleteDialogOpen(false);
      showToast.success("User deleted successfully");
    } catch (error) {
      showToast.error("Có lỗi xảy ra khi xoá người dùng");
    }
  };

  const handleUpgradeToVip = async () => {
    if (!selectedUser) return;
    try {
      await userService.updateUser(selectedUser.id, { is_vip: true });
      await refetchUsers();
      setIsUpgradeDialogOpen(false);
      showToast.success(`${selectedUser.name} has been upgraded to VIP`);
    } catch (error) {
      showToast.error("Có lỗi xảy ra khi nâng cấp VIP");
    }
  };

  const openEditDialog = (user: AdminUserRow) => {
    setSelectedUser(user);
    const q = user.userQuota;
    editForm.reset({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      isVip: user.isVip,
      notes: '',
      total_limit: q?.total_limit ?? 0,
      used: q?.used ?? 0,
      remaining: q?.remaining ?? 0,
    });
    setTimeout(() => setIsEditDialogOpen(true), 0);
  };

  const handleEditDialogClose = () => {
    setIsEditDialogOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
      editForm.reset();
    }, 100);
  };

  const handleDeleteDialogClose = () => {
    setIsDeleteDialogOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
    }, 100);
  };

  const handleSelfDeleteWarningClose = () => {
    setIsSelfDeleteWarningOpen(false);
    setTimeout(() => setSelectedUser(null), 100);
  };

  const handleUpgradeDialogClose = () => {
    setIsUpgradeDialogOpen(false);
    setTimeout(() => {
      setSelectedUser(null);
    }, 100);
  };

  return (
    <AdminLayout>
      <div ref={dialogCloseFocusRef} className="space-y-4" tabIndex={-1}>
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Quản lí người dùng</CardTitle>
              <CardDescription>Quản lí người dùng, gán vai trò, và thiết lập quyền hạn</CardDescription>
            </div>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-1 items-center gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Tìm kiếm người dùng..."
                    className="pl-8"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="mr-2 h-4 w-4" />
                      Lọc
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-[200px]">
                    <div className="grid gap-3 p-3">
                      <div>
                        <div className="font-medium mb-1 text-xs">Vai trò</div>
                        <select 
                          className="w-full rounded-md border border-input bg-transparent p-1 text-sm"
                          value={filterRole}
                          onChange={(e) => setFilterRole(e.target.value)}
                        >
                          <option value="all">Tất cả vai trò</option>
                          <option value="user">Người dùng</option>
                          <option value="admin">Quản trị viên</option>
                          <option value="editor">Biên tập viên</option>
                        </select>
                      </div>
                      <div>
                        <div className="font-medium mb-1 text-xs">Trạng thái</div>
                        <select 
                          className="w-full rounded-md border border-input bg-transparent p-1 text-sm"
                          value={filterStatus}
                          onChange={(e) => setFilterStatus(e.target.value)}
                        >
                          <option value="all">Tất cả trạng thái</option>
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div>
                        <div className="font-medium mb-1 text-xs">Trạng thái VIP</div>
                        <select 
                          className="w-full rounded-md border border-input bg-transparent p-1 text-sm"
                          value={filterVip}
                          onChange={(e) => setFilterVip(e.target.value)}
                        >
                          <option value="all">Tất cả người dùng</option>
                          <option value="vip">VIP</option>
                          <option value="non-vip">Non-VIP</option>
                        </select>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[200px]">Tên</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Vai trò</TableHead>
                    <TableHead>Trạng thái</TableHead>
                    <TableHead>VIP</TableHead>
                    <TableHead>Ngày tham gia</TableHead>
                    <TableHead className="text-right">Hành động</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentUsers.length > 0 ? (
                    currentUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.role === 'admin' ? 'default' : 'outline'}
                            className={cn(
                              user.role === 'admin' && 'bg-blue-500',
                              user.role === 'editor' && 'bg-amber-500 text-white'
                            )}
                          >
                            {user.role}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={user.status === 'active' ? 'default' : 'outline'}
                            className={cn(
                              user.status === 'active' && 'bg-green-500',
                              user.status === 'inactive' && 'bg-slate-500 text-white'
                            )}
                          >
                            {user.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.isVip ? (
                            <Badge variant="outline" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">
                              <Star className="h-3 w-3 mr-1 fill-amber-500 text-amber-500" />
                              VIP
                            </Badge>
                          ) : (
                            <span className="text-slate-500 text-sm">-</span>
                          )}
                        </TableCell>
                        <TableCell>{user.joinedDate}</TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Mở menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditDialog(user)}>
                                <Edit className="mr-2 h-4 w-4" />
                                Cập nhật
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={() => {
                                  setSelectedUser(user);
                                  if (currentUser && user.id === currentUser.id) {
                                    setTimeout(() => setIsSelfDeleteWarningOpen(true), 0);
                                  } else {
                                    setTimeout(() => setIsDeleteDialogOpen(true), 0);
                                  }
                                }}
                                className="text-red-600"
                              >
                                <Trash className="mr-2 h-4 w-4" />
                                Xóa
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => {
                                  navigate(`/admin/users/${user.id}/chat-history`, {
                                    state: {
                                      name: user.name,
                                      email: user.email,
                                      role: user.role,
                                      isVip: user.isVip,
                                    },
                                  });
                                }}
                              >
                                <MessageCircle className="mr-2 h-4 w-4" />
                                Xem lịch sử nhắn tin
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        Không tìm thấy người dùng.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {filteredUsers.length > usersPerPage && (
              <div className="mt-4 flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious 
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                    {Array.from({ length: totalPages }).map((_, index) => (
                      <PaginationItem key={index}>
                        <PaginationLink
                          onClick={() => setCurrentPage(index + 1)}
                          isActive={currentPage === index + 1}
                        >
                          {index + 1}
                        </PaginationLink>
                      </PaginationItem>
                    ))}
                    <PaginationItem>
                      <PaginationNext 
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={isEditDialogOpen} onOpenChange={(open) => { if (!open) handleEditDialogClose(); }}>
        <DialogContent
          className="sm:max-w-[425px]"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            dialogCloseFocusRef.current?.focus?.();
          }}
        >
          <DialogHeader>
            <DialogTitle>Cập nhật thông tin người dùng</DialogTitle>
            <DialogDescription>
              Cập nhật thông tin người dùng. Nhấn lưu khi bạn hoàn thành.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tên</FormLabel>
                    <FormControl>
                      <Input {...field} disabled/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={editForm.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vai trò</FormLabel>
                      <FormControl>
                        <select
                          className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                          value={field.value}
                          onChange={(e) => {
                            const value = e.target.value;
                            field.onChange(value);
                            if (value === "admin" && editForm.getValues("isVip")) {
                              editForm.setValue("isVip", false);
                            }
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="vip">VIP</option>
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="space-y-3">
                <p className="text-sm font-medium">Quota</p>
                <FormField
                  control={editForm.control}
                  name="quota_adjustment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Điều chỉnh quota</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="VD: 20 (tăng) hoặc -20 (giảm)"
                          value={field.value === undefined || field.value === "" ? "" : field.value}
                          onChange={(e) => {
                            const v = e.target.value;
                            field.onChange(v === "" ? undefined : v);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="grid grid-cols-3 gap-3 text-sm">
                  <FormField
                    control={editForm.control}
                    name="total_limit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Tổng quota</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} disabled readOnly className="bg-muted" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="used"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Đã sử dụng</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} disabled readOnly className="bg-muted" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={editForm.control}
                    name="remaining"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-xs text-muted-foreground">Còn lại</FormLabel>
                        <FormControl>
                          <Input type="number" min={0} disabled readOnly className="bg-muted" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={handleEditDialogClose}>Thoát</Button>
                <Button type="submit">Lưu thay đổi</Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteDialogOpen} onOpenChange={(open) => { if (!open) handleDeleteDialogClose(); }}>
        <DialogContent
          className="sm:max-w-[425px]"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            dialogCloseFocusRef.current?.focus?.();
          }}
        >
          <DialogHeader>
            <DialogTitle>Delete User</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this user? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2 p-4 rounded-md bg-red-50 border border-red-200">
            <p className="text-sm text-red-800">
              You are about to delete the user: <span className="font-medium">{selectedUser?.name}</span>
            </p>
          </div>
          <DialogFooter className="mt-4">
            <Button type="button" variant="outline" onClick={handleDeleteDialogClose}>Cancel</Button>
            <Button 
              variant="destructive" 
              onClick={handleDeleteUser}
            >
              Delete User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={isSelfDeleteWarningOpen} onOpenChange={(open) => { if (!open) handleSelfDeleteWarningClose(); }}>
        <DialogContent
          className="sm:max-w-[425px]"
          onCloseAutoFocus={(e) => {
            e.preventDefault();
            dialogCloseFocusRef.current?.focus?.();
          }}
        >
          <DialogHeader>
            <DialogTitle>Không thể xóa</DialogTitle>
            <DialogDescription>
              Bạn không thể tự xóa chính mình.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button type="button" onClick={handleSelfDeleteWarningClose}>
              Đóng
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default UserManagement;
