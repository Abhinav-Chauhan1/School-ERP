"use client";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

// Define types for menu structure
interface SubMenuItem {
  label: string;
  href: string;
}

interface MenuItem {
  icon: string;
  label: string;
  href: string;
  visible: string[];
  subItems?: SubMenuItem[];
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

const menuItems: MenuSection[] = [
  {
    title: "MENU",
    items: [
      {
        icon: "/home.png",
        label: "Home",
        href: "/",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/teacher.png",
        label: "Teachers",
        href: "/list/teachers",
        visible: ["admin", "teacher"],
        subItems: [
          { label: "All Teacher", href: "/list/teachers" },
          { label: "Teacher Attendance", href: "/attendance/teachers" },
        ],
      },
      {
        icon: "/student.png",
        label: "Students",
        href: "/list/students",
        visible: ["admin", "teacher"],
        subItems: [
          { label: "All Student", href: "/list/students" },
          { label: "Student Records", href: "/records/students" },
        ],
      },
      {
        icon: "/parent.png",
        label: "Parents",
        href: "/list/parents",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/calendar.png",
        label: "Academic Years",
        href: "/list/academic-years",
        visible: ["admin"],
      },
      {
        icon: "/calendar.png",
        label: "Terms",
        href: "/list/terms",
        visible: ["admin"],
      },
      {
        icon: "/subject.png",
        label: "Subjects",
        href: "/list/subjects",
        visible: ["admin"],
      },
      {
        icon: "/class.png",
        label: "Classes",
        href: "/list/classes",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/lesson.png",
        label: "Lessons",
        href: "/list/lessons",
        visible: ["admin", "teacher"],
      },
      {
        icon: "/exam.png",
        label: "Exams",
        href: "/list/exams",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/assignment.png",
        label: "Assignments",
        href: "/list/assignments",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/result.png",
        label: "Results",
        href: "/list/results",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/attendance.png",
        label: "Attendance",
        href: "/list/attendance",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/calendar.png",
        label: "Events",
        href: "/list/events",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/message.png",
        label: "Messages",
        href: "/list/messages",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/announcement.png",
        label: "Announcements",
        href: "/list/announcements",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
  {
    title: "OTHER",
    items: [
      {
        icon: "/profile.png",
        label: "Profile",
        href: "/profile",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/setting.png",
        label: "Settings",
        href: "/settings",
        visible: ["admin", "teacher", "student", "parent"],
      },
      {
        icon: "/logout.png",
        label: "Logout",
        href: "/logout",
        visible: ["admin", "teacher", "student", "parent"],
      },
    ],
  },
];

interface MenuItemProps {
  item: MenuItem;
  role: string;
}

const MenuItem = ({ item, role }: MenuItemProps) => {
  const [isSubMenuOpen, setIsSubMenuOpen] = useState(false);

  if (!item.visible.includes(role)) {
    return null;
  }

  const hasSubMenu = item.subItems && item.subItems.length > 0;

  return (
    <div className="relative mb-1">
      {hasSubMenu ? (
        <button
          onClick={() => setIsSubMenuOpen(!isSubMenuOpen)}
          className="w-full flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2.5 md:px-3 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-50 group-hover:bg-white group-hover:shadow-sm">
            <Image src={item.icon} alt="" width={18} height={18} />
          </div>
          <span className="hidden lg:block font-medium">{item.label}</span>
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`hidden lg:block ml-auto h-4 w-4 text-gray-400 transition-transform duration-200 ${isSubMenuOpen ? 'rotate-180' : ''}`}
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button>
      ) : (
        <Link
          href={item.href}
          className="w-full flex items-center justify-center lg:justify-start gap-4 text-gray-600 py-2.5 md:px-3 rounded-lg hover:bg-gray-100 transition-all duration-200 group"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-md bg-gray-50 group-hover:bg-white group-hover:shadow-sm">
            <Image src={item.icon} alt="" width={18} height={18} />
          </div>
          <span className="hidden lg:block font-medium">{item.label}</span>
        </Link>
      )}

      {/* Sub-menu slider */}
      {hasSubMenu && (
        <div
          className={`overflow-hidden transition-all duration-300 ease-in-out ${
            isSubMenuOpen ? "max-h-64 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          <div className="pl-10 py-1 my-1 ml-3 border-l-2 border-gray-100">
            {item.subItems?.map((subItem: SubMenuItem) => (
              <Link
                key={subItem.label}
                href={subItem.href}
                className="flex items-center py-2 px-2 text-gray-500 hover:text-gray-800 rounded-md hover:bg-gray-50 transition-colors duration-150"
              >
                <span className="text-sm">{subItem.label}</span>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const Menu = () => {
  const { user } = useUser();
  const role = user?.publicMetadata.role as string || ""; // Provide a default value

  return (
    <div className="mt-6 px-2 text-sm">
      {menuItems.map((section) => (
        <div className="flex flex-col mb-6" key={section.title}>
          <span className="hidden lg:block text-xs uppercase text-gray-400 font-semibold tracking-wider mb-3 px-3">
            {section.title}
          </span>
          {section.items.map((item) => (
            <MenuItem key={item.label} item={item} role={role} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default Menu;
