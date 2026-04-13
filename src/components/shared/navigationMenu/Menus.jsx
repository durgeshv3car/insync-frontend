"use client";
import React, { Fragment, useEffect, useMemo, useState } from "react";
import { FiChevronRight } from "react-icons/fi";
import { menuList } from "@/utils/fackData/menuList";
import getIcon from "@/utils/getIcon";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { jwtDecode } from "jwt-decode";

const Menus = () => {
  const pathName = usePathname();
  const { data: session } = useSession();
  const [openDropdown, setOpenDropdown] = useState(null);

  let role = "";
  if (session?.user?.token) {
    const decoded = jwtDecode(session.user.token);
    role = decoded.role;
  }

  // ✅ Active checker (IMPORTANT FIX)
  const isActive = (path) => {
    if (path === "/") return pathName === "/";
    return pathName.startsWith(path);
  };

  // ✅ Filter by role
  const filteredMenu = useMemo(() => {
    let baseMenu = [];
    if (role === "super_admin") {
      baseMenu = menuList.filter((menu) => menu.name !== "preview");
    } else if (role === "admin") {
      baseMenu = menuList.filter((menu) => ["dashboards", "Reports","Youtube Data","Keywords Search","Keyword Search"].includes(menu.name));
    }
     else {
      baseMenu = menuList.filter((menu) => ["dashboards", "Reports"].includes(menu.name));
    }

    // Role-based flattening for 'user' role
    if (role === "user") {
      const flattened = [];
      const iconMap = {
        "Overview": "feather-pie-chart",
        "Device": "feather-smartphone",
        "Demographics": "feather-users"
      };

      baseMenu.forEach((menu) => {
        if (menu.name === "Reports" && menu.dropdownMenu) {
          // Promote children to parents
          menu.dropdownMenu.forEach((sub) => {
            flattened.push({
              ...sub,
              icon: iconMap[sub.name] || "feather-bar-chart-2", // Map specific icon or fallback
              id: `report-${sub.name.toLowerCase()}` // Ensure unique ID
            });
          });
        } else {
          flattened.push(menu);
        }
      });
      return flattened;
    }


    return baseMenu;
  }, [role, menuList]);


  const handleMainMenu = (name) => {
    setOpenDropdown((prev) => (prev === name ? null : name));
  };

  return (
    <>
      {filteredMenu.map((menu) => {
        const { id, name, path, icon, dropdownMenu } = menu;
        const hasDropdown =
          Array.isArray(dropdownMenu) && dropdownMenu.length > 0;

        // ✅ SIMPLE MENU (no dropdown)
        if (!hasDropdown) {
          return (
            <li
              key={id}
              className={`nxl-item ${isActive(path) ? "active" : ""}`}
            >
              <Link
                href={path}
                className={`nxl-link ${isActive(path) ? "active" : ""}`}
              >
                <span className="nxl-micon">{getIcon(icon)}</span>
                <span className="nxl-mtext">{name}</span>
              </Link>
            </li>
          );
        }

        // ✅ DROPDOWN MENU (Reports)
        const isParentActive = dropdownMenu.some((d) => isActive(d.path));
        const isOpen = openDropdown === name;

        return (
          <li
            key={id}
            className={`nxl-item nxl-hasmenu ${isOpen ? "nxl-trigger" : ""} ${
              isParentActive && !isOpen ? "active" : ""
            }`}
          >
            <a
              href="#"
              className={`nxl-link ${
                isParentActive && !isOpen ? "active" : ""
              }`}
              onClick={(e) => {
                e.preventDefault();
                handleMainMenu(name);
              }}
            >
              <span className="nxl-micon">{getIcon(icon)}</span>
              <span className="nxl-mtext">{name}</span>
              <span className="nxl-arrow">
                <FiChevronRight />
              </span>
            </a>

            <ul
              className={`nxl-submenu ${
                isOpen ? "nxl-menu-visible" : "nxl-menu-hidden"
              }`}
            >
              {dropdownMenu.map(({ id, name, path }) => (
                <li
                  key={path || id}
                  className={`nxl-item ${isActive(path) ? "active" : ""}`}
                >
                  <Link
                    href={path}
                    className={`nxl-link text-capitalize ${
                      isActive(path) ? "active" : ""
                    }`}
                  >
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        );
      })}
    </>
  );
};

export default Menus;
