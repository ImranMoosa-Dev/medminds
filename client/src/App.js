import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AccountConfirmation from "./pages/auth/AccountConfirmation";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Review from "./pages/student/Review";

// private routes
import StudentPrivateRoute from "./components/Routes/StudentPrivateRoute";
// student pages imports
import QuizSelection from "./pages/student/QuizSelection";
import Profile from "./pages/student/Profile";
import Stats from "./pages/student/Stats";
import CustomHistory from "./pages/student/CustomHistory";

function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password/:token" element={<ResetPassword />} />
      <Route
        path="/account-confirmation/:email"
        element={<AccountConfirmation />}
      />
      <Route path="/verify-email/:token" element={<VerifyEmail />} />

      {/* student routes */}
      <Route element={<StudentPrivateRoute />}>
        <Route path="/quiz-selection" element={<QuizSelection />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/custom-history" element={<CustomHistory />} />
      </Route>

      {/* test route */}
      <Route path="/review" element={<Review />} />
      <Route path="/stats" element={<Stats />} />
    </Routes>
  );
}
export default App;
