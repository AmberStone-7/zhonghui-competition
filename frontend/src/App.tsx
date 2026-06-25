import { BrowserRouter, Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Register from "./pages/Register";
import Showcase from "./pages/Showcase";
import Rules from "./pages/Rules";
import Awards from "./pages/Awards";
import Vote from "./pages/Vote";
import Login from "./pages/admin/Login";
import Dashboard from "./pages/admin/Dashboard";

const BASENAME = import.meta.env.PROD ? "/zhonghui-competition" : "/static";

export default function App() {
  return (
    <ErrorBoundary>
    <BrowserRouter basename={BASENAME}>
      <Routes>
        <Route element={<AuthGuard><Layout /></AuthGuard>}>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/showcase" element={<Showcase />} />
          <Route path="/rules" element={<Rules />} />
          <Route path="/awards" element={<Awards />} />
          <Route path="/vote" element={<Vote />} />
        </Route>
        <Route path="/auth" element={<Auth />} />
        <Route path="/admin/login" element={<Login />} />
        <Route path="/admin/*" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
