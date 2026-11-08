import Navbar from "./navbar/Navbar";
import Footer from "./footer/Footer";
import { Outlet } from "react-router-dom";
import { ComposerProvider } from "../src/components/Createpost";

export default function Layout() {
  return (
    <ComposerProvider>
      <nav className="fixed top-0 left-0 right-0 z-999">
        <Navbar />
      </nav>

      <section className="mt-20">
        <Outlet />
      </section>

      <Footer />
    </ComposerProvider>
  );
}
