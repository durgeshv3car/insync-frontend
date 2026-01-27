export const menuList = [
  { id: 1, name: "Users", path: "/users", icon: "feather-users" },
  { id: 2, name: "YouTubeData", path: "/Youtube-links", icon: "feather-briefcase" },
  { id: 3, name: "YoutubeChannelQuery", path: "/Youtube-channel-filters", icon: "feather-cast" },
  { id: 4, name: "YoutubeQuery", path: "/Youtube-filters", icon: "feather-settings" },
  { id: 5, name: "Create Campaign", path: "/campaign", icon: "feather-settings" },

  // Project


  // REPORTS MENU
  {
    id: 6,
    name: "Reports",
    path: "#",
    icon: "feather-at-sign",
    dropdownMenu: [
      {
        id: 1,
        name: "Dashboard",
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
      {
        id: 1,
        name: "Category",
        path: "/reports/category",
        subdropdownMenu: false,
      },
    ],
  },

  { id: 7, name: "Audience", path: "/audience", icon: "feather-layout" },
  { id: 8, name: "CreateAccount", path: `/authentication/register/creative`, icon: "feather-send" },
];
