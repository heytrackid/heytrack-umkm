import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import Link from 'next/link';
import { cn } from '@/lib/utils';
const quickLinks = [
    {
        title: 'Dashboard',
        description: 'Lihat ringkasan performa usaha dan metrik penting',
        href: '/dashboard'
    },
    {
        title: 'Pesanan',
        description: 'Pantau order terbaru dan update status produksi',
        href: '/orders'
    },
    {
        title: 'Bahan Baku',
        description: 'Kelola stok bahan dan peringatan reorder',
        href: '/ingredients'
    }
];
const ctaLinks = [
    {
        title: 'Ke Beranda',
        description: 'Kembali ke dashboard utama HeyTrack',
        href: '/'
    },
    {
        title: 'Tanya AI Assistant',
        description: 'Dapatkan bantuan instan untuk menemukan fitur yang tepat',
        href: '/ai-chatbot'
    }
];
export default function NotFound() {
    return (_jsx("section", { className: 'min-h-screen bg-slate-950 text-white', children: _jsxs("div", { className: cn('mx-auto flex max-w-4xl flex-col gap-10 px-4 py-20 text-center', 'sm:px-6 lg:px-8'), children: [_jsxs("header", { className: 'space-y-4', children: [_jsx("div", { className: cn('inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5', 'px-4 py-1 text-sm font-medium text-white/70'), children: "Status 404 \u00B7 Halaman tidak ditemukan" }), _jsx("h1", { className: 'text-4xl font-semibold tracking-tight sm:text-5xl', children: "Ups, halaman ini tidak tersedia" }), _jsx("p", { className: 'mx-auto max-w-2xl text-base text-white/70 sm:text-lg', children: "Kami tidak menemukan halaman yang Anda maksud. Periksa kembali URL atau gunakan pintasan berikut untuk kembali bekerja." })] }), _jsxs("section", { className: cn('rounded-lg bg-slate-900/70 text-left text-white shadow-2xl shadow-slate-900/40', 'ring-1 ring-white/5 backdrop-blur'), children: [_jsxs("div", { className: 'space-y-2 p-6', children: [_jsx("h2", { className: 'text-lg font-semibold', children: "Tujuan populer" }), _jsx("p", { className: 'text-white/70', children: "Pilih salah satu modul inti untuk melanjutkan pekerjaan Anda." })] }), _jsx("div", { className: 'grid gap-4 p-6 pt-0 md:grid-cols-3', children: quickLinks.map(link => (_jsxs(Link, { href: link.href, className: cn('group block rounded-xl border border-white/5 bg-white/5 px-4 py-5 transition', 'hover:border-white/20 hover:bg-white/10'), "aria-label": `Buka halaman ${link.title}`, children: [_jsxs("p", { className: 'flex items-center justify-between text-sm font-semibold text-white', children: [link.title, _jsx("span", { className: 'text-xs text-white/60 transition group-hover:text-white', children: "\u2192" })] }), _jsx("p", { className: 'mt-2 text-sm text-white/70', children: link.description })] }, link.href))) })] }), _jsx("div", { className: 'flex flex-col gap-3 text-left sm:flex-row sm:justify-center', children: ctaLinks.map(link => (_jsxs(Link, { href: link.href, className: cn('inline-flex flex-1 items-center justify-between rounded-lg border border-white/15', 'px-4 py-3 text-white transition hover:border-white/40 hover:bg-white/10', 'sm:flex-none sm:justify-center sm:gap-2'), "aria-label": link.description, children: [_jsx("span", { className: 'font-medium', children: link.title }), _jsx("span", { className: 'text-sm text-white/60 sm:hidden', children: "\u2192" })] }, link.href))) })] }) }));
}
