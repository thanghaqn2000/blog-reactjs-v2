import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDate } from '@/config/date.config';
import { usePosts } from '@/contexts/PostsContext';
import { AdminPostsFilters } from '@/services/admin/post.service';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Eye,
  Plus,
  Search,
  Trash2,
} from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AdminLayout from '../../../layouts/AdminLayout';

const CATEGORY_LABEL: Record<string, string> = {
  news: 'Tin tức',
  finance: 'Tài chính',
  report: 'Báo cáo',
};

function categoryLabel(raw: string) {
  return CATEGORY_LABEL[raw] ?? raw;
}

function getStatusStyle(status: string) {
  if (status === 'publish') return 'bg-green-100 text-green-700 border-green-200';
  return 'bg-amber-100 text-amber-700 border-amber-200';
}

function getTypeStyle(sub?: string) {
  if (sub === 'vip') return 'bg-purple-100 text-purple-700 border-purple-200 font-bold';
  return 'bg-blue-100 text-blue-700 border-blue-200';
}

function statusVi(status: string) {
  if (status === 'publish') return 'Xuất bản';
  if (status === 'pending') return 'Chờ duyệt';
  return status;
}

function typeVi(sub?: string) {
  if (sub === 'vip') return 'VIP';
  return 'Phổ thông';
}

function formatTimeLabel(iso?: string) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  const h = d.getHours();
  const m = d.getMinutes().toString().padStart(2, '0');
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
}

function getVisiblePages(current: number, total: number): (number | 'dots')[] {
  if (total <= 0) return [];
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  const set = new Set<number>([1, total, current, current - 1, current + 1]);
  const sorted = [...set].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const out: (number | 'dots')[] = [];
  let prev = 0;
  for (const p of sorted) {
    if (p - prev > 1) out.push('dots');
    out.push(p);
    prev = p;
  }
  return out;
}

type FilterOverrides = {
  searchTerm?: string;
  category?: string;
  status?: string;
  subType?: string;
  dateFrom?: string;
  dateTo?: string;
};

function AdminPostsFilterBar(props: {
  searchTerm: string;
  setSearchTerm: (v: string) => void;
  category: string;
  setCategory: (v: string) => void;
  status: string;
  setStatus: (v: string) => void;
  subType: string;
  setSubType: (v: string) => void;
  dateFrom: string;
  setDateFrom: (v: string) => void;
  dateTo: string;
  setDateTo: (v: string) => void;
  onRefetchPage1: (overrides?: FilterOverrides) => void;
  onApplyFilters: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}) {
  const {
    searchTerm,
    setSearchTerm,
    category,
    setCategory,
    status,
    setStatus,
    subType,
    setSubType,
    dateFrom,
    setDateFrom,
    dateTo,
    setDateTo,
    onRefetchPage1,
    onApplyFilters,
    onClearFilters,
    hasActiveFilters,
  } = props;

  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, []);

  return (
    <div className="p-5 border-b border-slate-100 bg-slate-50/50">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-4">
          <div className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
            <Search className="h-[18px] w-[18px] shrink-0 text-slate-400 pointer-events-none" aria-hidden />
            <input
              type="text"
              placeholder="Tìm kiếm tên bài viết..."
              className="min-w-0 flex-1 border-0 bg-transparent py-0.5 text-slate-800 outline-none placeholder:text-slate-400"
              value={searchTerm}
              onChange={(e) => {
                const v = e.target.value;
                setSearchTerm(v);
                if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
                searchDebounceRef.current = setTimeout(() => {
                  onRefetchPage1({ searchTerm: v });
                }, 400);
              }}
              onKeyDown={(e) => {
                if (e.key !== 'Enter') return;
                e.preventDefault();
                if (searchDebounceRef.current) {
                  clearTimeout(searchDebounceRef.current);
                  searchDebounceRef.current = null;
                }
                const v = (e.target as HTMLInputElement).value;
                onRefetchPage1({ searchTerm: v });
              }}
            />
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col gap-3">
          <div className="flex flex-wrap gap-3">
            <select
              className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
              value={subType}
              onChange={(e) => {
                const v = e.target.value;
                setSubType(v);
                onRefetchPage1({ subType: v });
              }}
            >
              <option value="">Loại bài viết</option>
              <option value="normal">Phổ thông</option>
              <option value="vip">VIP</option>
            </select>

            <select
              className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
              value={category}
              onChange={(e) => {
                const v = e.target.value;
                setCategory(v);
                onRefetchPage1({ category: v });
              }}
            >
              <option value="">Danh mục</option>
              <option value="news">Tin tức</option>
              <option value="finance">Tài chính</option>
              <option value="report">Báo cáo</option>
            </select>

            <select
              className="flex-1 min-w-[140px] px-3 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500/20 outline-none cursor-pointer"
              value={status}
              onChange={(e) => {
                const v = e.target.value;
                setStatus(v);
                onRefetchPage1({ status: v });
              }}
            >
              <option value="">Trạng thái</option>
              <option value="pending">Chờ duyệt</option>
              <option value="publish">Xuất bản</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2 min-w-0">
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Từ:</span>
            <input
              type="date"
              className="text-sm outline-none bg-transparent min-w-0 flex-1 cursor-pointer border border-slate-100 rounded px-1"
              value={dateFrom}
              onChange={(e) => {
                const v = e.target.value;
                setDateFrom(v);
                onRefetchPage1({ dateFrom: v });
              }}
            />
            <span className="text-xs text-slate-400 font-medium whitespace-nowrap">Đến:</span>
            <input
              type="date"
              className="text-sm outline-none bg-transparent min-w-0 flex-1 cursor-pointer border border-slate-100 rounded px-1"
              value={dateTo}
              onChange={(e) => {
                const v = e.target.value;
                setDateTo(v);
                onRefetchPage1({ dateTo: v });
              }}
            />
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" size="sm" onClick={onApplyFilters}>
                Áp dụng bộ lọc
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 hover:bg-red-400"
                disabled={!hasActiveFilters}
                onClick={() => {
                  if (searchDebounceRef.current) {
                    clearTimeout(searchDebounceRef.current);
                    searchDebounceRef.current = null;
                  }
                  onClearFilters();
                }}
              >
                Xóa bộ lọc
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const Posts = () => {
  const { posts, deletePost, fetchPosts, loading, pagination } = usePosts();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'manual' | 'auto'>('manual');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [postToDelete, setPostToDelete] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [subType, setSubType] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [autoSearchTerm, setAutoSearchTerm] = useState('');
  const [autoCategory, setAutoCategory] = useState('');
  const [autoStatus, setAutoStatus] = useState('');
  const [autoSubType, setAutoSubType] = useState('');
  const [autoDateFrom, setAutoDateFrom] = useState('');
  const [autoDateTo, setAutoDateTo] = useState('');

  const buildFilters = useCallback((): AdminPostsFilters => {
    return {
      title: searchTerm.trim() || undefined,
      category: category || undefined,
      status: status || undefined,
      sub_type: subType || undefined,
      date_post_from: dateFrom || undefined,
      date_post_to: dateTo || undefined,
    };
  }, [searchTerm, category, status, subType, dateFrom, dateTo]);

  const buildAutoFilters = useCallback((): AdminPostsFilters => {
    return {
      title: autoSearchTerm.trim() || undefined,
      category: autoCategory || undefined,
      status: autoStatus || undefined,
      sub_type: autoSubType || undefined,
      date_post_from: autoDateFrom || undefined,
      date_post_to: autoDateTo || undefined,
    };
  }, [autoSearchTerm, autoCategory, autoStatus, autoSubType, autoDateFrom, autoDateTo]);

  const applyFilters = useCallback(() => {
    void fetchPosts(1, buildFilters(), { scope: 'manual' });
  }, [fetchPosts, buildFilters]);

  const applyAutoFilters = useCallback(() => {
    void fetchPosts(1, buildAutoFilters(), { scope: 'auto' });
  }, [fetchPosts, buildAutoFilters]);

  const clearManualFilters = useCallback(() => {
    setSearchTerm('');
    setCategory('');
    setStatus('');
    setSubType('');
    setDateFrom('');
    setDateTo('');
    void fetchPosts(1, {}, { scope: 'manual' });
  }, [fetchPosts]);

  const clearAutoFilters = useCallback(() => {
    setAutoSearchTerm('');
    setAutoCategory('');
    setAutoStatus('');
    setAutoSubType('');
    setAutoDateFrom('');
    setAutoDateTo('');
    void fetchPosts(1, {}, { scope: 'auto' });
  }, [fetchPosts]);

  const manualHasActiveFilters = useMemo(
    () =>
      Boolean(
        searchTerm.trim() ||
          category ||
          status ||
          subType ||
          dateFrom ||
          dateTo
      ),
    [searchTerm, category, status, subType, dateFrom, dateTo]
  );

  const autoHasActiveFilters = useMemo(
    () =>
      Boolean(
        autoSearchTerm.trim() ||
          autoCategory ||
          autoStatus ||
          autoSubType ||
          autoDateFrom ||
          autoDateTo
      ),
    [autoSearchTerm, autoCategory, autoStatus, autoSubType, autoDateFrom, autoDateTo]
  );

  /**
   * Refetch trang 1 — chỉ field có trong `overrides` lấy giá trị mới (kể cả chuỗi rỗng để xóa lọc),
   * còn lại lấy từ state hiện tại. Tránh bug: chọn lại "Loại bài viết" về placeholder mà vẫn gửi sub_type cũ.
   */
  const refetchPage1 = useCallback(
    (overrides: FilterOverrides = {}) => {
      const titleSrc = overrides.searchTerm !== undefined ? overrides.searchTerm : searchTerm;
      const cat = overrides.category !== undefined ? overrides.category : category;
      const stat = overrides.status !== undefined ? overrides.status : status;
      const sub = overrides.subType !== undefined ? overrides.subType : subType;
      const df = overrides.dateFrom !== undefined ? overrides.dateFrom : dateFrom;
      const dt = overrides.dateTo !== undefined ? overrides.dateTo : dateTo;
      void fetchPosts(
        1,
        {
          title: titleSrc.trim() || undefined,
          category: cat || undefined,
          status: stat || undefined,
          sub_type: sub || undefined,
          date_post_from: df || undefined,
          date_post_to: dt || undefined,
        },
        { scope: 'manual' }
      );
    },
    [fetchPosts, searchTerm, category, status, subType, dateFrom, dateTo]
  );

  const refetchAutoPage1 = useCallback(
    (overrides: FilterOverrides = {}) => {
      const titleSrc =
        overrides.searchTerm !== undefined ? overrides.searchTerm : autoSearchTerm;
      const cat = overrides.category !== undefined ? overrides.category : autoCategory;
      const stat = overrides.status !== undefined ? overrides.status : autoStatus;
      const sub = overrides.subType !== undefined ? overrides.subType : autoSubType;
      const df = overrides.dateFrom !== undefined ? overrides.dateFrom : autoDateFrom;
      const dt = overrides.dateTo !== undefined ? overrides.dateTo : autoDateTo;
      void fetchPosts(
        1,
        {
          title: titleSrc.trim() || undefined,
          category: cat || undefined,
          status: stat || undefined,
          sub_type: sub || undefined,
          date_post_from: df || undefined,
          date_post_to: dt || undefined,
        },
        { scope: 'auto' }
      );
    },
    [fetchPosts, autoSearchTerm, autoCategory, autoStatus, autoSubType, autoDateFrom, autoDateTo]
  );

  const tabMounted = useRef(false);
  useEffect(() => {
    if (!tabMounted.current) {
      tabMounted.current = true;
      return;
    }
    void fetchPosts(1, undefined, { scope: activeTab === 'manual' ? 'manual' : 'auto' });
  }, [activeTab, fetchPosts]);

  const handlePageChange = (page: number) => {
    if (page < 1 || page > pagination.totalPages) return;
    void fetchPosts(page, undefined, { scope: activeTab === 'manual' ? 'manual' : 'auto' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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
      void deletePost(postToDelete);
      setDeleteDialogOpen(false);
      setPostToDelete(null);
    }
  };

  const pageItems = useMemo(
    () => getVisiblePages(pagination.currentPage, pagination.totalPages),
    [pagination.currentPage, pagination.totalPages]
  );

  const rangeStart =
    pagination.totalCount === 0
      ? 0
      : (pagination.currentPage - 1) * 10 + 1;
  const rangeEnd = Math.min(pagination.currentPage * 10, pagination.totalCount);

  return (
    <AdminLayout>
      <div className="min-h-screen bg-slate-50 p-4 md:p-8 font-sans text-slate-800">
        <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 mb-1">Quản lý bài viết</h1>
            <p className="text-sm text-slate-500">
              Quản lý nội dung và trạng thái hiển thị của các bài viết trên hệ thống.
            </p>
          </div>
          <Link
            to="/admin/posts/create"
            className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-medium transition-all shadow-sm active:scale-95"
          >
            <Plus size={18} />
            <span>Tạo bài viết mới</span>
          </Link>
        </div>

        <div className="max-w-7xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="flex border-b border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setActiveTab('manual')}
              className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === 'manual' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Quản lý bài viết
              {activeTab === 'manual' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('auto')}
              className={`px-6 py-4 text-sm font-semibold transition-all relative ${
                activeTab === 'auto' ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Tin tức do hệ thống tự đăng
              {activeTab === 'auto' && (
                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600" />
              )}
            </button>
          </div>

          {activeTab === 'manual' && (
            <AdminPostsFilterBar
              searchTerm={searchTerm}
              setSearchTerm={setSearchTerm}
              category={category}
              setCategory={setCategory}
              status={status}
              setStatus={setStatus}
              subType={subType}
              setSubType={setSubType}
              dateFrom={dateFrom}
              setDateFrom={setDateFrom}
              dateTo={dateTo}
              setDateTo={setDateTo}
              onRefetchPage1={refetchPage1}
              onApplyFilters={applyFilters}
              onClearFilters={clearManualFilters}
              hasActiveFilters={manualHasActiveFilters}
            />
          )}

          {activeTab === 'auto' && (
            <AdminPostsFilterBar
              searchTerm={autoSearchTerm}
              setSearchTerm={setAutoSearchTerm}
              category={autoCategory}
              setCategory={setAutoCategory}
              status={autoStatus}
              setStatus={setAutoStatus}
              subType={autoSubType}
              setSubType={setAutoSubType}
              dateFrom={autoDateFrom}
              setDateFrom={setAutoDateFrom}
              dateTo={autoDateTo}
              setDateTo={setAutoDateTo}
              onRefetchPage1={refetchAutoPage1}
              onApplyFilters={applyAutoFilters}
              onClearFilters={clearAutoFilters}
              hasActiveFilters={autoHasActiveFilters}
            />
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[900px]">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">
                    Tiêu đề bài viết
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Danh mục</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Tác giả</th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Trạng thái
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-center">
                    Loại
                  </th>
                  <th className="px-4 py-4 text-xs font-bold uppercase tracking-wider text-slate-500">Ngày đăng</th>
                  <th className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-slate-500 text-right">
                    Thao tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading && posts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                      Đang tải danh sách bài viết...
                    </td>
                  </tr>
                )}
                {!loading && posts.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-sm text-slate-500">
                      Chưa có bài viết nào.
                    </td>
                  </tr>
                )}
                {posts.map((post) => {
                  const publishRaw = post.date_post || '';
                  const publishDisplay = publishRaw ? formatDate(publishRaw) : post.date;
                  const authorInitial = (post.author?.trim()?.charAt(0) || 'A').toUpperCase();
                  return (
                    <tr key={post.id} className="hover:bg-blue-50/30 transition-colors group">
                      <td className="px-6 py-4 max-w-md">
                        <div className="flex items-start gap-3">
                          <div className="mt-1 p-2 bg-slate-100 rounded text-slate-400 group-hover:text-blue-500 group-hover:bg-blue-50 transition-colors">
                            <Edit3 size={16} />
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-slate-800 line-clamp-2 group-hover:text-blue-600 transition-colors">
                              {post.title}
                            </p>
                            <p className="text-xs text-slate-400 mt-1">
                              ID: #{post.id} • Tạo: {post.date}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium border border-slate-200 uppercase tracking-tight">
                          {categoryLabel(post.category)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center text-[10px] font-bold text-blue-600 shrink-0">
                            {authorInitial}
                          </div>
                          <span className="text-sm font-medium text-slate-600 truncate max-w-[120px]">
                            {post.author}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusStyle(post.status)}`}
                        >
                          {post.status === 'publish' ? <CheckCircle2 size={12} /> : <Clock size={12} />}
                          {statusVi(post.status)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`px-3 py-1 rounded-lg text-[10px] uppercase tracking-wider border ${getTypeStyle(post.sub_type)}`}
                        >
                          {typeVi(post.sub_type)}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex flex-col">
                          <span className="text-sm text-slate-700 font-medium">{publishDisplay}</span>
                          <span className="text-[10px] text-slate-400">{formatTimeLabel(publishRaw)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            type="button"
                            title="Xem bài"
                            onClick={() => handleView(post.id)}
                            className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            type="button"
                            title="Chỉnh sửa"
                            onClick={() => handleEdit(post.id)}
                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-all"
                          >
                            <Edit3 size={18} />
                          </button>
                          <button
                            type="button"
                            title="Xóa"
                            onClick={() => handleDeleteClick(post.id)}
                            className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Hiển thị{' '}
              <span className="font-semibold text-slate-700">
                {pagination.totalCount === 0 ? 0 : `${rangeStart}-${rangeEnd}`}
              </span>{' '}
              trong số <span className="font-semibold text-slate-700">{pagination.totalCount}</span> bài viết
            </p>
            <div className="flex items-center gap-1 flex-wrap justify-center">
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage <= 1 || loading}
                className="p-2 border border-slate-200 rounded hover:bg-white disabled:opacity-40 transition-all"
              >
                <ChevronLeft size={16} />
              </button>
              {pageItems.map((item, idx) =>
                item === 'dots' ? (
                  <span key={`d-${idx}`} className="px-1 text-slate-400">
                    …
                  </span>
                ) : (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handlePageChange(item)}
                    disabled={loading}
                    className={`w-8 h-8 flex items-center justify-center rounded font-medium text-sm transition-all ${
                      item === pagination.currentPage
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-white border border-transparent hover:border-slate-200 text-slate-600'
                    }`}
                  >
                    {item}
                  </button>
                )
              )}
              <button
                type="button"
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={pagination.currentPage >= pagination.totalPages || loading}
                className="p-2 border border-slate-200 rounded hover:bg-white disabled:opacity-40 transition-all"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Xác nhận xóa bài viết
            </DialogTitle>
            <DialogDescription>Bạn có chắc chắn muốn xóa bài viết này không?</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Hủy
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              Xóa
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
};

export default Posts;
