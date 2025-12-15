export const menuList = [
  { id: 0, name: "dashboards", path: "/", icon: "feather-airplay" },
  { id: 1, name: "users", path: "/users", icon: "feather-users" },
  { id: 2, name: "YouTubeData", path: "/Youtube-links", icon: "feather-briefcase" },
  { id: 3, name: "YoutubeChannelQuery", path: "/Youtube-channel-filters", icon: "feather-cast" },
  { id: 4, name: "YoutubeQuery", path: "/Youtube-filters", icon: "feather-settings" },
  { id: 5, name: "Create Campaign", path: "/campaign", icon: "feather-settings" },

  // REPORTS MENU
  {
    id: 6,
    name: "Reports",
    path: "#",
    icon: "feather-at-sign",
    dropdownMenu: [
      {
        id: 1,
        name: "overview",
        path: "/reports/overview",
        subdropdownMenu: false,
      },
    ],
  },

  { id: 7, name: "Audience", path: "/audience", icon: "feather-layout" },
  { id: 8, name: "createAccount", path: `/authentication/register/creative`, icon: "feather-send" },
];
