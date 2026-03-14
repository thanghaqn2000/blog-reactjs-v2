import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { showToast } from "@/config/toast.config";
import AdminLayout from "@/layouts/AdminLayout";
import { cn } from "@/lib/utils";
import {
  adminFeedbackService,
  type AdminFeedbackItem,
} from "@/services/admin/feedback.service";
import {
  Check,
  CheckCircle2,
  Clock3,
  MessageCircle,
  Search,
  Trash2,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

const PER_PAGE = 10;
type StatusFilter = "all" | "waiting" | "done";

const FeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState<AdminFeedbackItem[]>([]);
  const [meta, setMeta] = useState<{
    current_page: number;
    total_pages: number;
    total_count: number;
  } | null>(null);
  const [summary, setSummary] = useState({
    total: 0,
    waiting: 0,
    done: 0,
  });
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [searchTitle, setSearchTitle] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminFeedbackItem | null>(null);
  const [open, setOpen] = useState(false);
  const [updatingId, setUpdatingId] = useState<number | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [feedbackToDelete, setFeedbackToDelete] =
    useState<AdminFeedbackItem | null>(null);

  const fetchSummary = useCallback(async () => {
    try {
      const [allRes, waitingRes, doneRes] = await Promise.all([
        adminFeedbackService.getFeedbacks({ page: 1, per_page: 1 }),
        adminFeedbackService.getFeedbacks({ page: 1, per_page: 1, status: 0 }),
        adminFeedbackService.getFeedbacks({ page: 1, per_page: 1, status: 1 }),
      ]);
      setSummary({
        total: allRes.meta.total_count,
        waiting: waitingRes.meta.total_count,
        done: doneRes.meta.total_count,
      });
    } catch {
      setSummary({ total: 0, waiting: 0, done: 0 });
    }
  }, []);

  const fetchFeedbacks = useCallback(async () => {
    setLoading(true);
    try {
      const params: Parameters<typeof adminFeedbackService.getFeedbacks>[0] = {
        page,
        per_page: PER_PAGE,
        title: searchTitle.trim() || undefined,
      };
      if (statusFilter === "waiting") params.status = 0;
      if (statusFilter === "done") params.status = 1;
      const res = await adminFeedbackService.getFeedbacks(params);
      setFeedbacks(res.data);
      setMeta(res.meta);
    } catch {
      showToast.error("Không tải được danh sách phản hồi.");
      setFeedbacks([]);
      setMeta(null);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter, searchTitle]);

  useEffect(() => {
    fetchFeedbacks();
  }, [fetchFeedbacks]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleSearch = () => {
    setSearchTitle(searchInput.trim());
    setPage(1);
  };

  const handleMarkDone = async (id: number) => {
    setUpdatingId(id);
    try {
      await adminFeedbackService.updateStatus(id, "done");
      setFeedbacks((prev) =>
        prev.map((f) => (f.id === id ? { ...f, status: "done" as const } : f)),
      );
      if (selected?.id === id) setSelected({ ...selected, status: "done" });
      setSummary((s) => ({ ...s, waiting: s.waiting - 1, done: s.done + 1 }));
      showToast.success("Đã đánh dấu hoàn thành.");
    } catch {
      showToast.error("Cập nhật trạng thái thất bại.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleOpenDetail = (item: AdminFeedbackItem) => {
    setSelected(item);
    setOpen(true);
  };

  const handleDelete = (item: AdminFeedbackItem) => {
    setFeedbackToDelete(item);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!feedbackToDelete) return;

    setDeletingId(feedbackToDelete.id);
    try {
      await adminFeedbackService.deleteFeedback(feedbackToDelete.id);
      showToast.success("Đã xóa phản hồi.");
      await Promise.all([fetchFeedbacks(), fetchSummary()]);
      setDeleteDialogOpen(false);
      setFeedbackToDelete(null);
    } catch {
      showToast.error("Xóa phản hồi thất bại.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderStatus = (s: "waiting" | "done") => {
    if (s === "waiting") {
      return (
        <Badge className="bg-amber-100 text-amber-700 border border-amber-200 rounded-full px-3 py-1 text-xs font-semibold">
          Đang chờ
        </Badge>
      );
    }
    return (
      <Badge className="bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-full px-3 py-1 text-xs font-semibold">
        Hoàn thành
      </Badge>
    );
  };

  const formatCreatedAt = (created_at: string) => {
    try {
      const d = new Date(created_at);
      return d.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return created_at;
    }
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Quản lý Phản hồi
            </h1>
            <p className="text-muted-foreground">
              Xem và xử lý các yêu cầu từ khách hàng
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto md:items-center">
            <div className="relative w-full sm:w-64 flex gap-2">
              <Input
                placeholder="Tìm theo tiêu đề..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-9 rounded-xl"
              />
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Button
                type="button"
                variant="secondary"
                size="sm"
                className="rounded-xl shrink-0"
                onClick={handleSearch}
              >
                Tìm
              </Button>
            </div>
            <Select
              value={statusFilter}
              onValueChange={(val) => {
                setStatusFilter(val as StatusFilter);
                setPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44 rounded-xl">
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="waiting">Đang chờ</SelectItem>
                <SelectItem value="done">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-none bg-white shadow-sm">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Tổng số
                </p>
                <p className="text-2xl font-bold mt-1">{summary.total}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none bg-white shadow-sm">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="h-10 w-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600">
                <Clock3 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Chưa xử lý
                </p>
                <p className="text-2xl font-bold mt-1">{summary.waiting}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-none bg-white shadow-sm">
            <CardContent className="flex items-center gap-3 py-4">
              <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Hoàn thành
                </p>
                <p className="text-2xl font-bold mt-1">{summary.done}</p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-2xl border-none bg-white shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>Danh sách phản hồi</CardTitle>
          </CardHeader>
          <CardContent>
            {loading && feedbacks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Đang tải...
              </div>
            ) : feedbacks.length === 0 ? (
              <div className="py-8 text-center text-sm text-muted-foreground">
                Không có phản hồi nào phù hợp điều kiện lọc.
              </div>
            ) : (
              <>
                <Table className="min-w-full">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[80px]">ID</TableHead>
                      <TableHead>Khách hàng</TableHead>
                      <TableHead className="hidden md:table-cell">
                        Tiêu đề
                      </TableHead>
                      <TableHead className="hidden sm:table-cell">
                        Ngày tạo
                      </TableHead>
                      <TableHead>Trạng thái</TableHead>
                      <TableHead className="text-right">Thao tác</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {feedbacks.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer">
                        <TableCell className="font-semibold text-primary">
                          FB-{String(item.id).padStart(3, "0")}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">
                              {(item.user_name || "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="text-sm font-medium">
                                {item.user_name || "—"}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {formatCreatedAt(item.created_at)}
                              </div>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <div className="text-sm font-medium line-clamp-1">
                            {item.title}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell text-sm text-muted-foreground">
                          {formatCreatedAt(item.created_at)}
                        </TableCell>
                        <TableCell>{renderStatus(item.status)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            {item.status === "waiting" && (
                              <Button
                                variant="outline"
                                size="icon"
                                className="h-8 w-8 rounded-full shrink-0 text-emerald-600 border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleMarkDone(item.id);
                                }}
                                disabled={updatingId === item.id}
                                title="Đánh dấu hoàn thành"
                              >
                                {updatingId === item.id ? (
                                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
                                ) : (
                                  <Check className="h-4 w-4" />
                                )}
                              </Button>
                            )}
                            <Button
                              variant="outline"
                              size="sm"
                              className="rounded-full text-xs"
                              onClick={() => handleOpenDetail(item)}
                            >
                              Xem chi tiết
                            </Button>
                          <Button
                            variant="outline"
                            size="icon"
                            className="h-8 w-8 rounded-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(item);
                            }}
                            disabled={deletingId === item.id}
                            title="Xóa phản hồi"
                          >
                            {deletingId === item.id ? (
                              <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-600 border-t-transparent" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
                {meta && meta.total_pages > 1 && (
                  <Pagination className="mt-4">
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page > 1) setPage(page - 1);
                          }}
                          className={page <= 1 ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      {Array.from({ length: meta.total_pages }, (_, i) => i + 1)
                        .filter(
                          (p) =>
                            p === 1 ||
                            p === meta.total_pages ||
                            Math.abs(p - page) <= 1
                        )
                        .map((p, idx, arr) => (
                          <PaginationItem key={p}>
                            {idx > 0 && arr[idx - 1] !== p - 1 && (
                              <span className="px-2">…</span>
                            )}
                            <PaginationLink
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                setPage(p);
                              }}
                              isActive={page === p}
                            >
                              {p}
                            </PaginationLink>
                          </PaginationItem>
                        ))}
                      <PaginationItem>
                        <PaginationNext
                          href="#"
                          onClick={(e) => {
                            e.preventDefault();
                            if (page < meta.total_pages) setPage(page + 1);
                          }}
                          className={
                            page >= meta.total_pages
                              ? "pointer-events-none opacity-50"
                              : ""
                          }
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                )}
              </>
            )}
          </CardContent>
        </Card>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogContent className="max-w-xl rounded-3xl">
            {selected && (
              <>
                <DialogHeader className="space-y-1.5">
                  <DialogTitle className="flex items-center gap-2 text-xl">
                    <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <MessageCircle className="h-4 w-4" />
                    </span>
                    Chi tiết phản hồi
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 mt-2">
                  <div className="text-xs text-muted-foreground">
                    <span className="font-semibold text-foreground">
                      FB-{String(selected.id).padStart(3, "0")}
                    </span>{" "}
                    • {formatCreatedAt(selected.created_at)}
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Người gửi
                    </p>
                    <p className="text-sm font-semibold">
                      {selected.user_name || "—"}
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Tiêu đề
                    </p>
                    <p className="text-sm font-semibold">{selected.title}</p>
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-muted-foreground">
                      Nội dung
                    </p>
                    <p className="text-sm leading-relaxed bg-gray-50 rounded-xl px-3 py-3">
                      {selected.content}
                    </p>
                  </div>

                  {(selected.page_issue ?? "").trim() && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        Trang đang bị vấn đề
                      </p>
                      <p className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
                        {selected.page_issue}
                      </p>
                    </div>
                  )}

                  {(selected.phone_number ?? "").trim() && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        Số điện thoại
                      </p>
                      <p className="text-sm font-medium">{selected.phone_number}</p>
                    </div>
                  )}

                  {(selected.image_url ?? "").trim() && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-medium text-muted-foreground">
                        Ảnh đính kèm
                      </p>
                      <div className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-3">
                        <img
                          src={selected.image_url!}
                          alt="Đính kèm"
                          className="mt-2 max-h-48 rounded-lg object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>

                <DialogFooter className="mt-4">
                  <div className="flex w-full items-center justify-between gap-3">
                    <div className="text-xs text-muted-foreground">
                      Trạng thái hiện tại:{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          selected.status === "waiting"
                            ? "text-amber-600"
                            : "text-emerald-600",
                        )}
                      >
                        {selected.status === "waiting"
                          ? "Đang chờ"
                          : "Hoàn thành"}
                      </span>
                    </div>
                    <Button
                      type="button"
                      className="rounded-full px-5"
                      variant={
                        selected.status === "waiting" ? "default" : "outline"
                      }
                      disabled={updatingId === selected.id}
                      onClick={() => {
                        if (selected.status === "waiting") {
                          handleMarkDone(selected.id);
                          setOpen(false);
                        }
                      }}
                    >
                      {updatingId === selected.id ? "Đang cập nhật..." : "Hoàn thành ngay"}
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="max-w-md rounded-2xl">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600">
                  !
                </span>
                Xác nhận xóa phản hồi
              </DialogTitle>
            </DialogHeader>
            <div className="mt-2 text-sm text-muted-foreground">
              Bạn có chắc chắn muốn xóa phản hồi{" "}
              <span className="font-semibold text-foreground">
                {feedbackToDelete?.title}
              </span>{" "}
              không? Hành động này không thể hoàn tác.
            </div>
            <DialogFooter className="mt-4 flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setFeedbackToDelete(null);
                }}
              >
                Hủy
              </Button>
              <Button
                type="button"
                variant="destructive"
                disabled={deletingId === feedbackToDelete?.id}
                onClick={handleConfirmDelete}
              >
                {deletingId === feedbackToDelete?.id ? "Đang xóa..." : "Xóa"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
};

export default FeedbackManagement;

