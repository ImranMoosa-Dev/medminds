import { Routes, Route } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";
import AccountConfirmation from "./pages/auth/AccountConfirmation";
import VerifyEmail from "./pages/auth/VerifyEmail";

// student private routes imports
import StudentPrivateRoute from "./components/Routes/StudentPrivateRoute";
import QuizSelection from "./pages/student/QuizSelection";
import Profile from "./pages/student/Profile";
import Stats from "./pages/student/Stats";
import CustomHistory from "./pages/student/CustomHistory";
import CreateTest from "./pages/student/CreateTest";
import Quiz from "./pages/student/Quiz";
import Review from "./pages/student/Review";
import QuizDetails from "./pages/QuizDetails";

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
        <Route path="/create-test" element={<CreateTest />} />
        <Route path="/quiz-details/:quizId" element={<QuizDetails />} />
      </Route>

      {/* test route */}
      <Route path="/review" element={<Review />} />
      <Route path="/stats" element={<Stats />} />
    </Routes>
  );
}
export default App;
