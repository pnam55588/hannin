import { Card, Notice, PageHeader } from '@/components/ui'
import { currentUser } from '@/lib/auth'
import { ChangePasswordForm } from './change-password-form'

export const dynamic = 'force-dynamic'

export default async function AccountPage() {
  const user = await currentUser()

  return (
    <>
      <PageHeader title="Tài khoản" subtitle={user?.email ?? ''} />

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Đổi mật khẩu" hint="Cần nhập mật khẩu hiện tại">
          <ChangePasswordForm />
        </Card>

        <Card title="Về hệ thống này">
          <ul className="space-y-2 text-sm text-muted">
            <li>Chỉ có một tài khoản chủ lớp. Không có tài khoản cho phụ huynh hay học sinh.</li>
            <li>Dữ liệu không mở công khai ra ngoài.</li>
            <li>Sổ thu chỉ ghi thêm: ghi nhầm thì tạo dòng điều chỉnh, không sửa và không xoá.</li>
            <li>Điểm danh không ảnh hưởng tới học phí.</li>
          </ul>
          <div className="mt-4">
            <Notice tone="info">
              Bản sao lưu chạy tự động mỗi ngày một lần. Vì gói Supabase miễn phí không có sao lưu
              tự động, job này là lưới an toàn duy nhất.
            </Notice>
          </div>
        </Card>
      </div>
    </>
  )
}
