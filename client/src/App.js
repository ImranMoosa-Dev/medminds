import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Register from "./pages/auth/Register";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AccountConfirmation from "./pages/auth/AccountConfirmation";
import VerifyEmail from "./pages/auth/VerifyEmail";

// public routes imports
import PublicRoutes from "./components/Routes/PublicRoutes";

// student private routes imports
import StudentPrivateRoute from "./components/Routes/StudentPrivateRoute";
import QuizSelection from "./pages/student/QuizSelection";
import Profile from "./pages/student/Profile";
import Stats from "./pages/student/Stats";
import CustomHistory from "./pages/student/CustomHistory";
import CreateTest from "./pages/student/CreateTest";
import Quiz from "./pages/student/Quiz";
import Review from "./pages/student/Review";
import QuizDetails from "./pages/student/QuizDetails";
import Result from "./pages/student/Result";
import MyBatch from "./pages/student/MyBatch";
import Leaderboard from "./pages/student/Leaderboard";
import Batches from "./pages/student/Batches";

// ADMIN IMPORTS
import Admin from "./pages/admin/Admin";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminQuizzes from "./pages/admin/AdminQuizzes";
import AdminProfile from "./pages/admin/AdminProfile";
import AdminBatches from "./pages/admin/AdminBatches";
// import AdminEnrollment from "./pages/admin/AdminEnrollment";
function App() {
  return (
    <Routes>
      {/* PUBLIC ROUTES */}

      <Route element={<PublicRoutes />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        <Route
          path="/account-confirmation/:email"
          element={<AccountConfirmation />}
        />
        <Route path="/verify-email/:token" element={<VerifyEmail />} />
      </Route>
      {/* STUDENT PRIVATE ROUTES */}

      <Route element={<StudentPrivateRoute />}>
        <Route path="/quiz-selection" element={<QuizSelection />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/custom-history" element={<CustomHistory />} />
        <Route path="/create-test" element={<CreateTest />} />
        <Route path="/quiz-details" element={<QuizDetails />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/result" element={<Result />} />
        <Route path="/my-batch" element={<MyBatch />} />
        <Route path="/leaderboard" element={<Leaderboard />} />
        <Route path="/batches" element={<Batches />} />
        <Route path="/stats" element={<Stats />} />
      </Route>

      {/* test route */}
      <Route path="/review" element={<Review />} />

      {/* ADMIN PRIVATE ROUTE */}

      <Route path="/admin">
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="users" element={<AdminUsers />} />
        <Route path="quizzes" element={<AdminQuizzes />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="batches" element={<AdminBatches />} />

        {/* <Route path="/admin/enrollments" element={<AdminEnrollment />} /> */}
      </Route>
    </Routes>
  );
}
export default App;
