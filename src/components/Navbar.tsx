import { UserButton } from "@clerk/nextjs";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";

const Navbar = async () => {
  const user = await currentUser();
  return (
    <div className="flex items-center justify-between p-4 bg-white border-b border-gray-100 shadow-sm">
      {/* SEARCH BAR */}
      <div className="hidden md:flex items-center gap-3 text-sm bg-gray-50 rounded-lg px-3 py-2 border border-gray-100 transition-all duration-200 focus-within:border-blue-200 focus-within:shadow-sm">
        <Image src="/search.png" alt="" width={16} height={16} className="opacity-60" />
        <input
          type="text"
          placeholder="Search..."
          className="w-[240px] bg-transparent outline-none text-gray-600"
        />
      </div>
      
      {/* ICONS AND USER */}
      <div className="flex items-center gap-5 justify-end w-full">
        <button className="relative p-2.5 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <Image src="/message.png" alt="Messages" width={20} height={20} />
        </button>
        
        <button className="relative p-2.5 text-gray-500 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors duration-200">
          <Image src="/announcement.png" alt="Notifications" width={20} height={20} />
          <span className="absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center bg-indigo-600 text-white rounded-full text-xs font-medium shadow-sm">
            1
          </span>
        </button>
        
        <div className="hidden sm:flex items-center gap-3 border-l border-gray-100 pl-4">
          <div className="flex flex-col">
            <span className="text-sm font-medium text-gray-700">{user?.firstName || 'User'}</span>
            <span className="text-xs text-gray-500 capitalize">
              {user?.publicMetadata?.role as string || 'Guest'}
            </span>
          </div>
          <div className="ring-2 ring-gray-100 rounded-full p-0.5">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
        
        <div className="sm:hidden">
          <UserButton afterSignOutUrl="/" />
        </div>
      </div>
    </div>
  );
};

export default Navbar;
