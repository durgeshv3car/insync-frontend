"use client";
import React, { Fragment, useEffect, useState } from "react";
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
  const filteredMenu = menuList.filter((menu) => {
    if (role === "super_admin") return menu.name !== "preview";
    return ["dashboards", "Reports"].includes(menu.name);
  });

  // ✅ Auto open dropdown when child is active
  useEffect(() => {
    filteredMenu.forEach((menu) => {
      if (
        menu.dropdownMenu?.some((d) => isActive(d.path))
      ) {
        setOpenDropdown(menu.name);
      }
    });
  }, [pathName]);

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
              <Link href={path} className="nxl-link">
                <span className="nxl-micon">{getIcon(icon)}</span>
                <span className="nxl-mtext">{name}</span>
              </Link>
            </li>
          );
        }

        // ✅ DROPDOWN MENU (Reports)
        const isParentActive =
          dropdownMenu.some((d) => isActive(d.path));

        return (
          <li
            key={id}
            className={`nxl-item nxl-hasmenu ${
              isParentActive ? "active nxl-trigger" : ""
            }`}
          >
          <a
              href="#"
              className="nxl-link"
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
                openDropdown === name
                  ? "nxl-menu-visible"
                  : "nxl-menu-hidden"
              }`}
            >
              {dropdownMenu.map(({ id, name, path }) => (
                <li
                  key={id}
                  className={`nxl-item ${
                    isActive(path) ? "active" : ""
                  }`}
                >
                  <Link
                    href={path}
                    className="nxl-link text-capitalize"
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
