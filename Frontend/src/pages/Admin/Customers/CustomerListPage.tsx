import { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { API_BASE_URL, authFetch } from '@/services/apiService';
import { UserPlus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface Customer {
  id: number;
  username: string;
  email: string;
  role: string;
  is_staff: boolean;
  is_active: boolean;
}

export default function CustomerListPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [syncLoading, setSyncLoading] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', password: '' });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await authFetch(`${API_BASE_URL}/users/customers/`);
      if (!res.ok) {
        toast.error('Không thể tải danh sách khách hàng');
        return;
      }
      const data = await res.json();
      setCustomers(data);
    } catch {
      toast.error('Lỗi kết nối server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleSync = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.username || !form.email || !form.password) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }
    setSyncLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/users/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        toast.error(err.message || 'Đồng bộ khách hàng thất bại');
        return;
      }
      toast.success('Đồng bộ khách hàng thành công');
      setForm({ username: '', email: '', password: '' });
      setDialogOpen(false);
      fetchCustomers();
    } catch {
      toast.error('Lỗi kết nối server');
    } finally {
      setSyncLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen">
      <div className="flex items-center justify-between border-b pb-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Quản lý Khách hàng</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Khách hàng được đồng bộ từ web bán hàng chính
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={fetchCustomers} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} />
            Làm mới
          </Button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <UserPlus className="w-4 h-4 mr-1" />
                Đồng bộ khách hàng
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Đồng bộ khách hàng từ web chính</DialogTitle>
                <DialogDescription>
                  Mô phỏng việc đồng bộ tài khoản khách hàng từ hệ thống bán hàng chính sang hệ thống quản lý.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSync} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tên đăng nhập</label>
                  <Input
                    placeholder="Nhập tên đăng nhập"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    placeholder="Nhập email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Mật khẩu</label>
                  <Input
                    type="password"
                    placeholder="Nhập mật khẩu"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Hủy
                  </Button>
                  <Button type="submit" disabled={syncLoading}>
                    {syncLoading ? 'Đang đồng bộ...' : 'Đồng bộ'}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Danh sách khách hàng</CardTitle>
          <CardDescription>
            Tổng cộng {customers.length} khách hàng đang hoạt động
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Đang tải...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Tên đăng nhập</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Vai trò</TableHead>
                  <TableHead className="text-center">Trạng thái</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="font-mono text-sm">{c.id}</TableCell>
                    <TableCell className="font-medium">{c.username}</TableCell>
                    <TableCell className="text-muted-foreground">{c.email}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{c.role}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge variant={c.is_active ? 'default' : 'destructive'}>
                        {c.is_active ? 'Hoạt động' : 'Vô hiệu'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
                {customers.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                      Không có khách hàng nào
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
