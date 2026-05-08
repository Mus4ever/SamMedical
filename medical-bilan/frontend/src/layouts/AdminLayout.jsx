import AppNavbar from '../components/common/AppNavbar';
import Sidebar from '../components/common/Sidebar';

const AdminLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col mesh-soft">
    <AppNavbar />
    <div className="flex flex-1">
      <Sidebar />
      <main id="main" className="flex-1 p-6 md:p-10">
        <div className="max-w-7xl mx-auto">{children}</div>
      </main>
    </div>
  </div>
);

export default AdminLayout;
