import React from "react";
import AdminHeader from "../admin/AdminHeader";
import { Helmet } from "react-helmet";

const AdminLayout = ({
  children,
  title = "Admin Dashboard - Medminds",
  description = "Admin Dashboard",
  keywords = "mern, react,node,mongodb",
  author = "medminds",
}) => {
  return (
    <div>
      <Helmet>
        <meta charSet="UTF-8" />
        <meta name="description" content={description} />
        <meta name="keywords" content={keywords} />
        <meta name="author" content={author} />
        <title>{title}</title>
      </Helmet>
      <AdminHeader />
      <main style={{ minHeight: "70vh" }}>{children}</main>
    </div>
  );
};

export default AdminLayout;
