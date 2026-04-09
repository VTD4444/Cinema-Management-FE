import React from 'react';
import { Mail, Phone, Globe, Facebook, Instagram, Youtube } from 'lucide-react';

const FOOTER_COLUMNS = [
  {
    title: 'Về chúng tôi',
    links: ['Giới thiệu', 'Tiện ích Online', 'Thẻ quà tặng', 'Tuyển dụng'],
  },
  {
    title: 'Điều khoản',
    links: ['Điều khoản chung', 'Điều khoản giao dịch', 'Chính sách thanh toán', 'Chính sách bảo mật'],
  },
  {
    title: 'Chăm sóc khách hàng',
    links: ['Hotline: 1900 1234', 'Giờ làm việc: 8:00 - 22:00', 'Email: support@cinego.vn'],
  },
];

const UserFooter = () => {
  return (
    <footer className="mt-14 border-t border-zinc-900 bg-[#090909] text-zinc-400">
      <div className="mx-auto max-w-6xl px-6 py-10 sm:px-10">
        <div className="grid gap-8 border-b border-zinc-900 pb-8 md:grid-cols-4">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm font-semibold text-zinc-100">
              <img src="/logo.png" alt="CineGo logo" className="h-5 w-5 object-contain" />
              <span>CineGo</span>
            </div>
            <p className="max-w-[260px] text-xs leading-6 text-zinc-500">
              Trải nghiệm điện ảnh đỉnh cao với hệ thống rạp chiếu phim hiện đại nhất.
            </p>
            <div className="flex items-center gap-3 text-zinc-500">
              <button type="button" className="transition-colors hover:text-zinc-200" aria-label="Website">
                <Globe className="h-4 w-4" />
              </button>
              <button type="button" className="transition-colors hover:text-zinc-200" aria-label="Email">
                <Mail className="h-4 w-4" />
              </button>
              <button type="button" className="transition-colors hover:text-zinc-200" aria-label="Hotline">
                <Phone className="h-4 w-4" />
              </button>
            </div>
          </div>

          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 text-sm font-semibold text-zinc-100">{col.title}</h3>
              <ul className="space-y-2 text-xs">
                {col.links.map((item) => (
                  <li key={item}>
                    <button type="button" className="transition-colors hover:text-zinc-200">
                      {item}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 text-[11px] text-zinc-600">
          <span>© {new Date().getFullYear()} CineGo. All rights reserved.</span>
          <div className="flex items-center gap-3">
            <button type="button" className="rounded bg-zinc-800 p-1.5 text-zinc-500 transition-colors hover:text-zinc-200" aria-label="Facebook">
              <Facebook className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="rounded bg-zinc-800 p-1.5 text-zinc-500 transition-colors hover:text-zinc-200" aria-label="Instagram">
              <Instagram className="h-3.5 w-3.5" />
            </button>
            <button type="button" className="rounded bg-zinc-800 p-1.5 text-zinc-500 transition-colors hover:text-zinc-200" aria-label="Youtube">
              <Youtube className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default UserFooter;
