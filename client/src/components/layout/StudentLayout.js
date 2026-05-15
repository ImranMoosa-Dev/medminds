import React from "react";
import Header from "../Header";
import { Helmet } from "react-helmet";

const Layout = ({
  children,
  title = "Medminds",
  description = "Student Learning Portal",
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
      <Header />
      <main style={{ minHeight: "70vh" }}>{children}</main>
    </div>
  );
};

export default Layout;
