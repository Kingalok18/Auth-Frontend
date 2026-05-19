import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import { Toaster } from "react-hot-toast";


function RootLayout() {
  return (
    <div>
      <Toaster />  {/* This will allow us to show notifications from anywhere in the app (popup messages) */}
      <Navbar />   {/* This is the common layout that will be used for all routes  */}
      <Outlet />  {/* This is where the child routes will be rendered (child components will be rendered here) */}
    </div>
  );
}

export default RootLayout;