import BottomNav from "@/components/mobile/BottomNav";

export default function GuestLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="bg-[#f5f6fa] min-h-screen pb-20">
            {children}
            <BottomNav />
        </div>
    );
}
