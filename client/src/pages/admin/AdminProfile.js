import React, { useEffect, useState } from "react";
import AdminLayout from "../../components/layout/AdminLayout";
import { getAdminProfileApi } from "../../api/adminApi";
const AdminProfile = () => {
  const [profile, setProfile] = useState({
    email: "",
    lastLogin: "",
    quizzesCreated: 0,
    usersManaged: 0,
    notifications: 0,
    batches: 0,
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadAdminProfile = async () => {
    try {
      setLoading(true);
      const res = await getAdminProfileApi();

      if (!res.success) {
        throw new Error(res.message);
      }

      setProfile(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load admin profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminProfile();
  }, []);

  if (loading) {
    return <div className="card">Loading profile...</div>;
  }

  if (error) {
    return <div className="card text-red">{error}</div>;
  }

  return (
    <AdminLayout>
      <div>
        <div id="profile" className="tab-panel">
          <h2 className="sec-title" style={{ marginBottom: "20px" }}>
            👤 Admin Profile
          </h2>

          {/* ACCOUNT INFO */}
          <div className="card" style={{ marginBottom: "20px" }}>
            <div className="card-hdr">
              <span className="card-title">Account Information</span>
            </div>

            <div className="card-body">
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
                  gap: "16px",
                  marginBottom: "24px",
                }}
              >
                <div>
                  <div className="stat-label">Email</div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>
                    {profile.email}
                  </div>
                </div>

                <div>
                  <div className="stat-label">Role</div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>
                    System Administrator
                  </div>
                </div>

                <div>
                  <div className="stat-label">Last Login</div>
                  <div style={{ fontWeight: 700, fontSize: "14px" }}>
                    {profile.lastLogin}
                  </div>
                </div>

                <div>
                  <div className="stat-label">Status</div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "14px",
                      color: "#16a34a",
                    }}
                  >
                    ✅ Active
                  </div>
                </div>
              </div>

              {/* STATS */}
              <div className="stats-grid">
                <div className="stat-box">
                  <div className="stat-label">Quizzes Created</div>
                  <div className="stat-num">{profile.quizzesCreated}</div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Users Managed</div>
                  <div className="stat-num">{profile.usersManaged}</div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Notifications</div>
                  <div className="stat-num">{profile.notifications}</div>
                </div>

                <div className="stat-box">
                  <div className="stat-label">Batches</div>
                  <div className="stat-num">{profile.batches}</div>
                </div>
              </div>
            </div>
          </div>

          {/* SECURITY */}
          <div className="card">
            <div className="card-hdr">
              <span className="card-title">🔒 Security</span>
            </div>

            <div
              className="card-body"
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "10px",
              }}
            >
              <button className="btn btn-gray" style={{ maxWidth: "300px" }}>
                Change Password
              </button>
              <button className="btn btn-gray" style={{ maxWidth: "300px" }}>
                Enable 2-Factor Auth
              </button>
              <button className="btn btn-gray" style={{ maxWidth: "300px" }}>
                View Login History
              </button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProfile;
