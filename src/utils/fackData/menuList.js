export const menuList = [
  { id: 1, name: "Users", path: "/users", icon: "feather-users" },
  {
    id: 2,
    name: "Youtube Data",
    path: "/youtube-data",
    icon: "feather-youtube",
  },
  {
    id: 3,
    name: "Keywords Search",
    path: "/keywords-search",
    icon: "feather-search",
  },
  { 
  id: 4, 
  name: "Create Campaign", 
  path: "/campaign", 
  icon: "feather-activity"   
},

  // Project

  // REPORTS MENU
  {
    id: 6,
    name: "Reports",
    path: "#",
    icon: "feather-bar-chart-2",
    dropdownMenu: [
      {
        id: 1,
        name: "Overview",
        path: "/reports/overview",
        subdropdownMenu: false,
      },
      {
        id: 1,
        name: "Device",
        path: "/reports/device",
        subdropdownMenu: false,
      },
      {
        id: 1,
        name: "Demographics",
        path: "/reports/demographics",
        subdropdownMenu: false,
      },
      // {
      //   id: 1,
      //   name: "creative",
      //   path: "/reports/creative",
      //   subdropdownMenu: false,
      // },
      // {
      //   id: 1,
      //   name: "Category",
      //   path: "/reports/category",
      //   subdropdownMenu: false,
      // },
    ],
  },

  { id: 7, name: "Audience", path: "/audience", icon: "feather-layout" },
  {
    id: 8,
    name: "Create Account",
    path: `/authentication/register/creative`,
    icon: "feather-send",
  },
];
