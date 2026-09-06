import { useEffect, useState } from "react";

const API_URL = "http://127.0.0.1:8000";

function ApplicantDashboard() {
  const [user, setUser] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");

    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await fetch(
        `${API_URL}/api/applications`
      );

      const data = await response.json();

      setApplications(data.applications || []);
    } catch (error) {
      console.error("Failed to load applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    window.location.reload();
  };

  const totalApplications = applications.length;

  const pendingApplications = applications.filter(
    (app) =>
      app.status === "Submitted" ||
      app.status === "Pending"
  ).length;

  const approvedApplications = applications.filter(
    (app) => app.status === "Approved"
  ).length;

  const rejectedApplications = applications.filter(
    (app) => app.status === "Rejected"
  ).length;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f5f7fb",
        padding: "30px",
        fontFamily: "Arial, sans-serif",
      }}
    >

      {/* HEADER */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "35px",
        }}
      >
        <div>
          <p
            style={{
              margin: 0,
              color: "#6b7280",
              fontSize: "14px",
            }}
          >
            APPLICANT PORTAL
          </p>

          <h1
            style={{
              margin: "6px 0",
              color: "#111827",
            }}
          >
            Welcome{user?.name ? `, ${user.name}` : ""}
          </h1>

          <p
            style={{
              margin: 0,
              color: "#6b7280",
            }}
          >
            Manage your industrial applications and approvals.
          </p>
        </div>

        <button
          onClick={logout}
          style={{
            border: "1px solid #d1d5db",
            background: "white",
            padding: "10px 18px",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "600",
          }}
        >
          Logout
        </button>
      </div>


      {/* STAT CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "20px",
          marginBottom: "35px",
        }}
      >

        <StatCard
          title="Total Applications"
          value={totalApplications}
        />

        <StatCard
          title="Pending"
          value={pendingApplications}
        />

        <StatCard
          title="Approved"
          value={approvedApplications}
        />

        <StatCard
          title="Rejected"
          value={rejectedApplications}
        />

      </div>


      {/* APPLICATIONS */}

      <div
        style={{
          background: "white",
          borderRadius: "14px",
          padding: "25px",
          boxShadow:
            "0 4px 20px rgba(0,0,0,0.05)",
        }}
      >

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "20px",
          }}
        >

          <div>
            <h2
              style={{
                margin: 0,
                color: "#111827",
              }}
            >
              My Applications
            </h2>

            <p
              style={{
                color: "#6b7280",
                marginTop: "6px",
              }}
            >
              Track the status of your submitted applications.
            </p>
          </div>

          <button
            style={{
              background: "#111827",
              color: "white",
              border: "none",
              padding: "11px 18px",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "600",
            }}
          >
            + New Application
          </button>

        </div>


        {/* LOADING */}

        {loading && (
          <p style={{ color: "#6b7280" }}>
            Loading applications...
          </p>
        )}


        {/* EMPTY */}

        {!loading && applications.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "50px 20px",
              color: "#6b7280",
            }}
          >
            <h3>No applications yet</h3>

            <p>
              Submit your first industrial application
              to get started.
            </p>
          </div>
        )}


        {/* APPLICATION LIST */}

        {!loading && applications.length > 0 && (
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "12px",
            }}
          >

            {applications.map((application) => (

              <div
                key={application.id}
                style={{
                  border: "1px solid #e5e7eb",
                  borderRadius: "10px",
                  padding: "18px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "20px",
                }}
              >

                <div>

                  <strong
                    style={{
                      color: "#111827",
                      fontSize: "16px",
                    }}
                  >
                    {application.business_name}
                  </strong>

                  <p
                    style={{
                      margin: "6px 0",
                      color: "#6b7280",
                      fontSize: "14px",
                    }}
                  >
                    Application #{application.id}
                    {" • "}
                    {application.sector}
                  </p>

                  <p
                    style={{
                      margin: 0,
                      color: "#6b7280",
                      fontSize: "13px",
                    }}
                  >
                    Investment: ₹
                    {application.investment_crore} Cr
                    {" • "}
                    Employees: {application.employees}
                  </p>

                </div>


                <StatusBadge
                  status={application.status}
                />

              </div>

            ))}

          </div>
        )}

      </div>

    </div>
  );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({ title, value }) {
  return (
    <div
      style={{
        background: "white",
        borderRadius: "14px",
        padding: "22px",
        boxShadow:
          "0 4px 20px rgba(0,0,0,0.05)",
      }}
    >
      <p
        style={{
          margin: 0,
          color: "#6b7280",
          fontSize: "14px",
        }}
      >
        {title}
      </p>

      <h2
        style={{
          margin: "8px 0 0",
          fontSize: "30px",
          color: "#111827",
        }}
      >
        {value}
      </h2>
    </div>
  );
}


// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({ status }) {
  let background = "#f3f4f6";
  let color = "#374151";

  if (status === "Approved") {
    background = "#dcfce7";
    color = "#166534";
  }

  if (status === "Rejected") {
    background = "#fee2e2";
    color = "#991b1b";
  }

  if (
    status === "Submitted" ||
    status === "Pending"
  ) {
    background = "#fef3c7";
    color = "#92400e";
  }

  return (
    <span
      style={{
        background,
        color,
        padding: "7px 12px",
        borderRadius: "20px",
        fontSize: "13px",
        fontWeight: "600",
        whiteSpace: "nowrap",
      }}
    >
      {status}
    </span>
  );
}

export default ApplicantDashboard;