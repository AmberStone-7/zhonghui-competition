import { Routes, Route, Navigate } from "react-router-dom";
import ProtectedRoute from "../../components/ProtectedRoute";
import AdminLayout from "../../components/AdminLayout";
import Review from "./Review";
import Works from "./Works";
import Content from "./Content";
import Scores from "./Scores";
import Export from "./Export";
import Config from "./Config";
import TaskList from "../scorer/TaskList";
import Scoring from "../scorer/Scoring";

function AdminRedirect() {
  const role = sessionStorage.getItem("admin_role");
  if (role === "super_admin") {
    return <Navigate to="/admin/review" replace />;
  }
  return <Navigate to="/admin/scoring" replace />;
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <Routes>
        <Route element={<AdminLayout />}>
          <Route index element={<AdminRedirect />} />
          <Route path="review" element={<Review />} />
          <Route path="works" element={<Works />} />
          <Route path="content" element={<Content />} />
          <Route path="scores" element={<Scores />} />
          <Route path="export" element={<Export />} />
          <Route path="config" element={<Config />} />
          <Route path="scoring" element={<TaskList />} />
          <Route path="scoring/:workId" element={<Scoring />} />
        </Route>
      </Routes>
    </ProtectedRoute>
  );
}
