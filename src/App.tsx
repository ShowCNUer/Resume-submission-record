import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import ApplicationForm from "@/pages/ApplicationForm";
import StatusManagement from "@/pages/StatusManagement";

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/add" element={<ApplicationForm />} />
        <Route path="/edit/:id" element={<ApplicationForm />} />
        <Route path="/statuses" element={<StatusManagement />} />
      </Routes>
    </Router>
  );
}
