import AppNavbar from '../components/common/AppNavbar';

const PatientLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col mesh-soft">
    <AppNavbar />
    <main id="main" className="flex-1 px-6 py-10">
      <div className="max-w-3xl mx-auto">{children}</div>
    </main>
  </div>
);

export default PatientLayout;
