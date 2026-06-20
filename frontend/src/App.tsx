import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import Layout from "./components/Layout";
import Register from "./pages/Register";
import Showcase from "./pages/Showcase";
import Rules from "./pages/Rules";
import Awards from "./pages/Awards";
import Vote from "./pages/Vote";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter basename={import.meta.env.DEV ? "/static" : undefined}>
      <Routes>
        <Route element={<Layout />}>
          <Route path="/" element={<Register />} />
          <Route path="/register" element={<Register />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/vote" element={<Vote />} />
        </Route>
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
